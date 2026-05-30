const Cinema = require('../models/Cinema');
const { normalize } = require('../utils/legacyNormalizer');

class CinemaService {
  async listCinemas() {
    const cinemas = await Cinema.findAll({
      where: { isActive: true },
      order: [
        ['city', 'ASC'],
        ['name', 'ASC']
      ]
    });
    return cinemas.map(c => this._toCinemaDTO(c));
  }

  async getCinemaById(cinemaId) {
    const cinema = await Cinema.findByPk(cinemaId);
    if (!cinema) {
      const error = new Error('Cinema not found');
      error.status = 404;
      throw error;
    }
    return this._toCinemaDTO(cinema);
  }

  async createCinema(payload) {
    const { name, city, address, rooms, phone } = payload;
    if (!name || !city || !address) {
      const error = new Error('Missing required fields: name, city, address');
      error.status = 400;
      throw error;
    }
    const cinema = await Cinema.create({ name, city, address, rooms: rooms || [], phone });
    return this._toCinemaDTO(cinema);
  }

  async updateCinema(cinemaId, payload) {
    const cinema = await Cinema.findByPk(cinemaId);
    if (!cinema) {
      const error = new Error('Cinema not found');
      error.status = 404;
      throw error;
    }
    const { name, city, address, rooms, phone, isActive } = payload;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (rooms !== undefined) updateData.rooms = rooms;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      const error = new Error('No valid fields to update');
      error.status = 400;
      throw error;
    }
    await cinema.update(updateData);
    return this._toCinemaDTO(cinema);
  }

  async deleteCinema(cinemaId) {
    const cinema = await Cinema.findByPk(cinemaId);
    if (!cinema) {
      const error = new Error('Cinema not found');
      error.status = 404;
      throw error;
    }
    await cinema.destroy();
    return { deleted: true, id: cinemaId };
  }

  _toCinemaDTO(cinema) {
    const c = cinema.get ? cinema.get({ plain: true }) : cinema;
    const idStr = c.id.toString();
    return {
      // English
      id: idStr,
      name: c.name,
      city: c.city,
      address: c.address,
      rooms: c.rooms || [],
      phone: c.phone || null,
      isActive: c.isActive,
      // Vietnamese
      MaRap: idStr,
      TenRap: c.name,
      ThanhPho: c.city,
      DiaChi: c.address,
      DanhSachPhong: c.rooms || [],
    };
  }
}

module.exports = new CinemaService();
