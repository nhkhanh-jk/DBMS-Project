const { faker } = require('@faker-js/faker');
const Cinema = require('../models/Cinema');

const CINEMA_COUNT = 8;

const cities = [
  ['Da Nang', 'Vincom Plaza, 910A Ngo Quyen, Son Tra'],
  ['Ha Noi', '191 Ba Trieu, Hai Ba Trung'],
  ['Ho Chi Minh', '72 Le Thanh Ton, District 1'],
  ['Can Tho', '209 Duong 30/4, Ninh Kieu'],
  ['Hai Phong', '1 Le Hong Phong, Ngo Quyen'],
  ['Hue', '50A Hung Vuong, Phu Nhuan'],
  ['Nha Trang', '20 Tran Phu, Loc Tho'],
  ['Quy Nhon', '7 Nguyen Tat Thanh, Le Loi'],
];

function buildRooms() {
  const roomCount = faker.number.int({ min: 4, max: 7 });

  return Array.from({ length: roomCount }, (_, index) => {
    const type = index === 0 ? 'imax' : index % 3 === 0 ? 'vip' : 'standard';
    const capacity = type === 'imax' ? 140 : type === 'vip' ? 80 : 110;

    return {
      roomNumber: index + 1,
      capacity,
      type,
    };
  });
}

async function seedCinemas() {
  const cinemas = Array.from({ length: CINEMA_COUNT }, (_, index) => {
    const [city, fallbackAddress] = cities[index % cities.length];

    return {
      name: `TNC ${city} ${index + 1}`,
      city,
      address: fallbackAddress || faker.location.streetAddress(),
      rooms: buildRooms(),
      phone: faker.phone.number('0#########'),
      isActive: true,
    };
  });

  return Cinema.bulkCreate(cinemas);
}

module.exports = seedCinemas;
