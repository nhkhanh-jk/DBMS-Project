const { normalize } = require('../utils/legacyNormalizer');
const Movie = require('../models/Movie');

class MovieService {
  async listMovies(status) {
    let movies;
    if (status) {
      movies = await Movie.findAll({ where: { status } });
    } else {
      movies = await Movie.findAll();
    }

    // Convert to DTOs
    return movies.map(movie => this._toMovieDTO(movie));
  }

  async getMovieById(movieId) {
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }
    return this._toMovieDTO(movie);
  }

  async createMovie(payload) {
    // Normalize the payload (convert VI keys to EN keys)
    const normalized = normalize(payload, 'movie');

    // Extract fields
    const {
      title,
      genres,
      description,
      durationMin,
      releaseDate,
      status,
      posterUrl
    } = normalized;

    // Validate required fields
    if (!title || !genres || durationMin === undefined || !releaseDate) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }

    // Validate genres is an array with at least one item
    if (!Array.isArray(genres) || genres.length === 0) {
      const error = new Error('Genres must be a non-empty array');
      error.status = 400;
      throw error;
    }

    // Validate each genre is a string
    for (const genre of genres) {
      if (typeof genre !== 'string') {
        const error = new Error('Each genre must be a string');
        error.status = 400;
        throw error;
      }
    }

    // Validate durationMin is a positive integer
    if (!Number.isInteger(durationMin) || durationMin < 1) {
      const error = new Error('Duration must be a positive integer');
      error.status = 400;
      throw error;
    }

    // Validate releaseDate is a valid date
    const releaseDateObj = new Date(releaseDate);
    if (isNaN(releaseDateObj.getTime())) {
      const error = new Error('Invalid release date');
      error.status = 400;
      throw error;
    }

    // Validate status is valid (optional, will use default if not provided)
    const validStatuses = ['SCHEDULED', 'RELEASED', 'COMING_SOON', 'END_OF_SHOW', 'ACTIVE', 'SNEAK_SHOW'];
    if (status && !validStatuses.includes(status)) {
      const error = new Error('Invalid movie status');
      error.status = 400;
      throw error;
    }

    // Create movie document
    const movieData = {
      title,
      genres,
      description: description || '',
      durationMin,
      releaseDate: releaseDateObj,
      status: status || 'SCHEDULED',
      posterUrl: posterUrl || null,
    };

    // Create movie
    const movie = await Movie.create(movieData);

    // Return DTO
    return this._toMovieDTO(movie);
  }

  async updateMovie(movieId, payload) {
    // Normalize the payload
    const normalized = normalize(payload, 'movie');

    // Find existing movie
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Extract fields that can be updated
    const {
      title,
      genres,
      description,
      durationMin,
      releaseDate,
      status,
      posterUrl
    } = normalized;

    // Prepare update document
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (genres !== undefined) {
      // Validate genres
      if (!Array.isArray(genres) || genres.length === 0) {
        const error = new Error('Genres must be a non-empty array');
        error.status = 400;
        throw error;
      }
      for (const genre of genres) {
        if (typeof genre !== 'string') {
          const error = new Error('Each genre must be a string');
          error.status = 400;
          throw error;
        }
      }
      updateData.genres = genres;
    }
    if (description !== undefined) updateData.description = description;
    if (durationMin !== undefined) {
      if (!Number.isInteger(durationMin) || durationMin < 1) {
        const error = new Error('Duration must be a positive integer');
        error.status = 400;
        throw error;
      }
      updateData.durationMin = durationMin;
    }
    if (releaseDate !== undefined) {
      const releaseDateObj = new Date(releaseDate);
      if (isNaN(releaseDateObj.getTime())) {
        const error = new Error('Invalid release date');
        error.status = 400;
        throw error;
      }
      updateData.releaseDate = releaseDateObj;
    }
    if (status !== undefined) {
      const validStatuses = ['SCHEDULED', 'RELEASED', 'COMING_SOON', 'END_OF_SHOW', 'ACTIVE', 'SNEAK_SHOW'];
      if (!validStatuses.includes(status)) {
        const error = new Error('Invalid movie status');
        error.status = 400;
        throw error;
      }
      updateData.status = status;
    }
    if (posterUrl !== undefined) updateData.posterUrl = posterUrl;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      const error = new Error('No valid fields to update');
      error.status = 400;
      throw error;
    }

    // Update movie
    await movie.update(updateData);

    // Return DTO
    return this._toMovieDTO(movie);
  }

  async deleteMovie(movieId) {
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    await movie.destroy();

    return { deleted: true, id: movieId };
  }

  // Helper method to convert movie to DTO
  _toMovieDTO(movie) {
    const m = movie.get ? movie.get({ plain: true }) : movie;

    // Handle releaseDate - convert to ISO string if it's a Date object
    let releaseDate = m.releaseDate;
    if (releaseDate instanceof Date) {
      releaseDate = releaseDate.toISOString();
    }

    const idStr = m.id.toString();

    return {
      // English
      id: idStr,
      title: m.title,
      genres: m.genres,
      description: m.description,
      durationMin: m.durationMin,
      releaseDate: releaseDate,
      status: m.status,
      posterUrl: m.posterUrl || null,
      // Vietnamese
      MaPhim: idStr,
      TenPhim: m.title,
      TheLoai: m.genres,
      MoTa: m.description,
      ThoiLuong: m.durationMin,
      NgayPhatHanh: releaseDate,
      TrangThai: m.status,
      AnhPhim: m.posterUrl || null,
    };
  }
}

module.exports = new MovieService();
