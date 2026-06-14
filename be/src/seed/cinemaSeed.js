const Cinema = require('../models/Cinema');

const cinemaProfiles = [
  {
    name: 'TNC Landmark 81',
    city: 'TP. Ho Chi Minh',
    address: 'B1 Vincom Center Landmark 81, 720A Dien Bien Phu, Binh Thanh',
    phone: '02873018881',
    rooms: [
      { roomNumber: 1, capacity: 168, type: 'imax' },
      { roomNumber: 2, capacity: 132, type: 'standard' },
      { roomNumber: 3, capacity: 118, type: 'standard' },
      { roomNumber: 4, capacity: 96, type: 'vip' },
      { roomNumber: 5, capacity: 112, type: 'standard' },
      { roomNumber: 6, capacity: 72, type: 'vip' },
      { roomNumber: 7, capacity: 88, type: 'standard' },
    ],
  },
  {
    name: 'TNC Vincom Ba Trieu',
    city: 'Ha Noi',
    address: 'Tang 6 Vincom Center Ba Trieu, 191 Ba Trieu, Hai Ba Trung',
    phone: '02473018882',
    rooms: [
      { roomNumber: 1, capacity: 152, type: 'imax' },
      { roomNumber: 2, capacity: 126, type: 'standard' },
      { roomNumber: 3, capacity: 118, type: 'standard' },
      { roomNumber: 4, capacity: 84, type: 'vip' },
      { roomNumber: 5, capacity: 104, type: 'standard' },
      { roomNumber: 6, capacity: 76, type: 'vip' },
    ],
  },
  {
    name: 'TNC Vincom Ngo Quyen',
    city: 'Da Nang',
    address: 'Tang 4 Vincom Plaza, 910A Ngo Quyen, Son Tra',
    phone: '02367301883',
    rooms: [
      { roomNumber: 1, capacity: 136, type: 'imax' },
      { roomNumber: 2, capacity: 112, type: 'standard' },
      { roomNumber: 3, capacity: 108, type: 'standard' },
      { roomNumber: 4, capacity: 78, type: 'vip' },
      { roomNumber: 5, capacity: 96, type: 'standard' },
    ],
  },
  {
    name: 'TNC Crescent Mall',
    city: 'TP. Ho Chi Minh',
    address: 'Tang 5 Crescent Mall, 101 Ton Dat Tien, District 7',
    phone: '02873018884',
    rooms: [
      { roomNumber: 1, capacity: 144, type: 'imax' },
      { roomNumber: 2, capacity: 120, type: 'standard' },
      { roomNumber: 3, capacity: 116, type: 'standard' },
      { roomNumber: 4, capacity: 86, type: 'vip' },
      { roomNumber: 5, capacity: 102, type: 'standard' },
      { roomNumber: 6, capacity: 74, type: 'vip' },
    ],
  },
  {
    name: 'TNC Aeon Long Bien',
    city: 'Ha Noi',
    address: 'Tang 3 Aeon Mall Long Bien, 27 Co Linh, Long Bien',
    phone: '02473018885',
    rooms: [
      { roomNumber: 1, capacity: 132, type: 'imax' },
      { roomNumber: 2, capacity: 112, type: 'standard' },
      { roomNumber: 3, capacity: 100, type: 'standard' },
      { roomNumber: 4, capacity: 76, type: 'vip' },
      { roomNumber: 5, capacity: 92, type: 'standard' },
    ],
  },
  {
    name: 'TNC Lotte Ninh Kieu',
    city: 'Can Tho',
    address: '209 Duong 30/4, Ninh Kieu',
    phone: '02927301886',
    rooms: [
      { roomNumber: 1, capacity: 118, type: 'standard' },
      { roomNumber: 2, capacity: 104, type: 'standard' },
      { roomNumber: 3, capacity: 72, type: 'vip' },
      { roomNumber: 4, capacity: 88, type: 'standard' },
    ],
  },
  {
    name: 'TNC Vincom Le Thanh Tong',
    city: 'Hai Phong',
    address: 'Tang 4 Vincom Plaza, 1 Le Thanh Tong, Ngo Quyen',
    phone: '02257301887',
    rooms: [
      { roomNumber: 1, capacity: 124, type: 'standard' },
      { roomNumber: 2, capacity: 108, type: 'standard' },
      { roomNumber: 3, capacity: 74, type: 'vip' },
      { roomNumber: 4, capacity: 90, type: 'standard' },
    ],
  },
  {
    name: 'TNC Nha Trang Center',
    city: 'Nha Trang',
    address: 'Tang 3 Nha Trang Center, 20 Tran Phu, Loc Tho',
    phone: '02587301888',
    rooms: [
      { roomNumber: 1, capacity: 120, type: 'standard' },
      { roomNumber: 2, capacity: 104, type: 'standard' },
      { roomNumber: 3, capacity: 70, type: 'vip' },
      { roomNumber: 4, capacity: 86, type: 'standard' },
    ],
  },
];

async function seedCinemas() {
  const cinemas = cinemaProfiles.map(cinema => ({
    ...cinema,
    isActive: true,
  }));

  return Cinema.bulkCreate(cinemas);
}

module.exports = seedCinemas;
