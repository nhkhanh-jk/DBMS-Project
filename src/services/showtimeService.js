const { normalize } = require('../utils/legacyNormalizer');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const { get, set, invalidateShowtimesCache } = require('../cache/redisClient');
const { CACHE_KEYS, CACHE_TTL } = require('../cache/redisClient');

class ShowtimeService {
  async listShowtimes(movieId, cinemaId, roomId, date) {
    // Build query
    const query = {};
    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (roomId) query.roomId = roomId;

    // Handle date filtering
    let startTime = null;
    let endTime = null;
    if (date) {
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          const error = new Error('Date must be in valid format');
          error.status = 400;
          throw error;
        }
        startTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
        endTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1, 0, 0, 0, 0);
        query.startTime = { $gte: startTime };
        query.endTime = { $lt: endTime };
      } catch (error) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
    }

    // Try to get from cache if no filters
    if (!movieId && !cinemaId && !roomId && !date) {
      const cached = await get(CACHE_KEYS.SHOWTIMES_ALL);
      if (cached) {
        return cached;
      }
    }

    // Get showtimes
    const showtimes = await Showtime.find(query)
      .sort({ startTime: 1 })
      .populate('movieId', 'title')
      .populate('cinemaId', 'name');

    // Convert to DTOs
    const dtoList = showtimes.map(showtime => {
      const movieTitle = showtime.movieId ? showtime.movieId.title : null;
      const roomName = showtime.cinemaId ? `${showtime.cinemaId.name} - Room ${showtime.roomId}` : null;
      return this._toShowtimeDTO(showtime, movieTitle, roomName);
    });

    // Cache if no filters
    if (!movieId && !cinemaId && !roomId && !date) {
      await set(CACHE_KEYS.SHOWTIMES_ALL, dtoList, CACHE_TTL.SHOWTIMES);
    }

    return dtoList;
  }

  async getShowtimeById(showtimeId) {
    const showtime = await Showtime.findById(showtimeId)
      .populate('movieId', 'title')
      .populate('cinemaId', 'name');

    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    const movieTitle = showtime.movieId ? showtime.movieId.title : null;
    const roomName = showtime.cinemaId ? `${showtime.cinemaId.name} - Room ${showtime.roomId}` : null;
    return this._toShowtimeDTO(showtime, movieTitle, roomName);
  }

  async createShowtime(payload) {
    // Normalize the payload (convert VI keys to EN keys)
    const normalized = normalize(payload, 'showtime');

    // Extract fields
    const {
      movieId,
      cinemaId,
      roomId,
      startTime,
      endTime,
      basePrice,
      status
    } = normalized;

    // Validate required fields
    if (!movieId || !roomId || !startTime || !endTime) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }

    // Validate movieId
    const movie = await Movie.findById(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Validate cinemaId (if provided) or resolve from roomId
    let cinemaIdResolved = cinemaId;
    if (!cinemaIdResolved) {
      // In a real implementation, we'd look up the cinema from the room
      // For now, we'll assume cinemaId is required or we have a way to resolve it
      const error = new Error('Cinema ID is required');
      error.status = 400;
      throw error;
    }

    const cinema = await Cinema.findById(cinemaIdResolved);
    if (!cinema) {
      const error = new Error('Cinema not found');
      error.status = 404;
      throw error;
    }

    // Validate times
    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);
    if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) {
      const error = new Error('Invalid start or end time');
      error.status = 400;
      throw error;
    }
    if (endTimeObj <= startTimeObj) {
      const error = new Error('End time must be later than start time');
      error.status = 400;
      throw error;
    }

    // Validate basePrice
    if (basePrice === undefined) {
      // Default to 0 if not provided
      // But we should validate it's a number if provided
    } else {
      if (typeof basePrice !== 'number' || basePrice < 0) {
        const error = new Error('Base price must be a non-negative number');
        error.status = 400;
        throw error;
      }
    }

    // Validate status
    const validStatuses = ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      const error = new Error('Invalid showtime status');
      error.status = 400;
      throw error;
    }

    // Check for conflicts (simplified - in reality we'd check for overlapping showtimes in the same room)
    // For now, we'll skip this complex validation

    // Create showtime document
    const showtimeData = {
      movieId,
      cinemaId: cinemaIdResolved,
      roomId,
      startTime: startTimeObj,
      endTime: endTimeObj,
      basePrice: basePrice || 0,
      status: status || 'SCHEDULED',
      bookedSeats: [],
    };

    // Create showtime
    const showtime = await Showtime.create(showtimeData);

    // Invalidate showtimes cache
    await invalidateShowtimesCache();

    // Return DTO
    const movieTitle = showtime.movieId ? showtime.movieId.title : null;
    const roomName = showtime.cinemaId ? `${showtime.cinemaId.name} - Room ${showtime.roomId}` : null;
    return this._toShowtimeDTO(showtime, movieTitle, roomName);
  }

  async updateShowtime(showtimeId, payload) {
    // Normalize the payload
    const normalized = normalize(payload, 'showtime');

    // Find existing showtime
    const existingShowtime = await Showtime.findById(showtimeId);
    if (!existingShowtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    // Extract fields that can be updated
    const {
      startTime,
      endTime,
      basePrice,
      status
    } = normalized;

    // Prepare update document
    const updateData = {};
    if (startTime !== undefined) {
      const startTimeObj = new Date(startTime);
      if (isNaN(startTimeObj.getTime())) {
        const error = new Error('Invalid start time');
        error.status = 400;
        throw error;
      }
      updateData.startTime = startTimeObj;
    }
    if (endTime !== undefined) {
      const endTimeObj = new Date(endTime);
      if (isNaN(endTimeObj.getTime())) {
        const error = new Error('Invalid end time');
        error.status = 400;
        throw error;
      }
      updateData.endTime = endTimeObj;
    }
    if (basePrice !== undefined) {
      if (typeof basePrice !== 'number' || basePrice < 0) {
        const error = new Error('Base price must be a non-negative number');
        error.status = 400;
        throw error;
      }
      updateData.basePrice = basePrice;
    }
    if (status !== undefined) {
      const validStatuses = ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        const error = new Error('Invalid showtime status');
        error.status = 400;
        throw error;
      }
      updateData.status = status;
    }

    // Validate time relationship if both times are provided
    if (updateData.startTime !== undefined && updateData.endTime !== undefined) {
      if (updateData.endTime <= updateData.startTime) {
        const error = new Error('End time must be later than start time');
        error.status = 400;
        throw error;
      }
    } else if (updateData.startTime !== undefined) {
      // Check against existing end time
      if (updateData.startTime >= existingShowtime.endTime) {
        const error = new Error('Start time must be earlier than existing end time');
        error.status = 400;
        throw error;
      }
    } else if (updateData.endTime !== undefined) {
      // Check against existing start time
      if (updateData.endTime <= existingShowtime.startTime) {
        const error = new Error('End time must be later than existing start time');
        error.status = 400;
        throw error;
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      const error = new Error('No valid fields to update');
      error.status = 400;
      throw error;
    }

    // Update showtime
    const updatedShowtime = await Showtime.findByIdAndUpdate(
      showtimeId,
      updateData,
      { new: true, runValidators: true }
    );

    // Invalidate showtimes cache
    await invalidateShowtimesCache();

    // Return DTO
    const movieTitle = updatedShowtime.movieId ? updatedShowtime.movieId.title : null;
    const roomName = updatedShowtime.cinemaId ? `${updatedShowtime.cinemaId.name} - Room ${updatedShowtime.roomId}` : null;
    return this._toShowtimeDTO(updatedShowtime, movieTitle, roomName);
  }

  async deleteShowtime(showtimeId) {
    const deletedShowtime = await Showtime.findByIdAndDelete(showtimeId);
    if (!deletedShowtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    // Invalidate showtimes cache
    await invalidateShowtimesCache();

    return { deleted: true, id: showtimeId };
  }

  async updateExpiredStatus() {
    const now = new Date();
    const result = await Showtime.updateMany(
      { endTime: { $lt: now }, status: { $ne: 'COMPLETED' } },
      { $set: { status: 'COMPLETED' } }
    );

    if (result.modifiedCount > 0) {
      await invalidateShowtimesCache();
    }

    return result.modifiedCount;
  }

  // Helper method to convert showtime to DTO (matches Python's to_showtime_dto)
  _toShowtimeDTO(showtime, movieTitle, roomName) {
    const s = showtime.toObject ? showtime.toObject() : showtime;

    // Handle times - convert to ISO string if they're Date objects
    let startTime = s.startTime;
    let endTime = s.endTime;
    if (startTime instanceof Date) {
      startTime = startTime.toISOString();
    }
    if (endTime instanceof Date) {
      endTime = endTime.toISOString();
    }

    return {
      // English
      id: s._id.toString(),
      movieId: s.movieId.toString(),
      roomId: s.roomId,
      cinemaId: s.cinemaId.toString(),
      startTime: startTime,
      endTime: endTime,
      basePrice: s.basePrice,
      status: s.status,
      bookedSeats: s.bookedSeats,
      movieTitle: movieTitle || null,
      roomName: roomName || null,
      // Vietnamese
      MaSuat: s._id.toString(),
      MaPhim: s.movieId.toString(),
      MaPhong: s.roomId,
      ThoiGianBatDau: startTime,
      ThoiGianKetThuc: endTime,
      TrangThai: s.status,
      TenPhim: movieTitle || null,
      TenPhong: roomName || null,
    };
  }
}

module.exports = new ShowtimeService();
