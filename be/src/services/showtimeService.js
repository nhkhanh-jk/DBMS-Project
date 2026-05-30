const { normalize } = require('../utils/legacyNormalizer');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const { Op } = require('sequelize');

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
        query.startTime = { [Op.gte]: startTime };
        query.endTime = { [Op.lt]: endTime };
      } catch (error) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
    }

    // Get showtimes
    const showtimes = await Showtime.findAll({
      where: query,
      order: [['startTime', 'ASC']]
    });

    // Convert to DTOs
    const dtoList = [];
    for (const showtime of showtimes) {
      const movie = await Movie.findByPk(showtime.movieId);
      const cinema = await Cinema.findByPk(showtime.cinemaId);
      const movieTitle = movie ? movie.title : null;
      const roomName = cinema ? `${cinema.name} - Room ${showtime.roomId}` : null;
      dtoList.push(this._toShowtimeDTO(showtime, movieTitle, roomName));
    }

    return dtoList;
  }

  async getShowtimeById(showtimeId) {
    const showtime = await Showtime.findByPk(showtimeId);

    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    const movie = await Movie.findByPk(showtime.movieId);
    const cinema = await Cinema.findByPk(showtime.cinemaId);
    const movieTitle = movie ? movie.title : null;
    const roomName = cinema ? `${cinema.name} - Room ${showtime.roomId}` : null;
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
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Validate cinemaId (if provided) or resolve from roomId
    let cinemaIdResolved = cinemaId;
    if (!cinemaIdResolved) {
      const error = new Error('Cinema ID is required');
      error.status = 400;
      throw error;
    }

    const cinema = await Cinema.findByPk(cinemaIdResolved);
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
    if (basePrice !== undefined) {
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

    // Return DTO
    const movieTitle = movie ? movie.title : null;
    const roomName = cinema ? `${cinema.name} - Room ${showtime.roomId}` : null;
    return this._toShowtimeDTO(showtime, movieTitle, roomName);
  }

  async updateShowtime(showtimeId, payload) {
    // Normalize the payload
    const normalized = normalize(payload, 'showtime');

    // Find existing showtime
    const showtime = await Showtime.findByPk(showtimeId);
    if (!showtime) {
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
      if (updateData.startTime >= showtime.endTime) {
        const error = new Error('Start time must be earlier than existing end time');
        error.status = 400;
        throw error;
      }
    } else if (updateData.endTime !== undefined) {
      if (updateData.endTime <= showtime.startTime) {
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
    await showtime.update(updateData);

    // Return DTO
    const movie = await Movie.findByPk(showtime.movieId);
    const cinema = await Cinema.findByPk(showtime.cinemaId);
    const movieTitle = movie ? movie.title : null;
    const roomName = cinema ? `${cinema.name} - Room ${showtime.roomId}` : null;
    return this._toShowtimeDTO(showtime, movieTitle, roomName);
  }

  async deleteShowtime(showtimeId) {
    const showtime = await Showtime.findByPk(showtimeId);
    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    await showtime.destroy();

    return { deleted: true, id: showtimeId };
  }

  async updateExpiredStatus() {
    const now = new Date();
    const [affectedCount] = await Showtime.update(
      { status: 'COMPLETED' },
      {
        where: {
          endTime: { [Op.lt]: now },
          status: { [Op.ne]: 'COMPLETED' }
        }
      }
    );

    return affectedCount;
  }

  // Helper method to convert showtime to DTO
  _toShowtimeDTO(showtime, movieTitle, roomName) {
    const s = showtime.get ? showtime.get({ plain: true }) : showtime;

    // Handle times - convert to ISO string if they're Date objects
    let startTime = s.startTime;
    let endTime = s.endTime;
    if (startTime instanceof Date) {
      startTime = startTime.toISOString();
    }
    if (endTime instanceof Date) {
      endTime = endTime.toISOString();
    }

    const idStr = s.id.toString();
    const movieIdStr = s.movieId.toString();
    const cinemaIdStr = s.cinemaId.toString();

    return {
      // English
      id: idStr,
      movieId: movieIdStr,
      roomId: s.roomId,
      cinemaId: cinemaIdStr,
      startTime: startTime,
      endTime: endTime,
      basePrice: s.basePrice,
      status: s.status,
      bookedSeats: s.bookedSeats || [],
      movieTitle: movieTitle || null,
      roomName: roomName || null,
      // Vietnamese
      MaSuat: idStr,
      MaPhim: movieIdStr,
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
