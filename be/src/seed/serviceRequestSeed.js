const { faker } = require('@faker-js/faker');
const ServiceRequest = require('../models/ServiceRequest');

const REQUEST_RATE_BY_CUSTOMER = 0.055;
const MIN_REQUEST_COUNT = 180;
const MAX_REQUEST_COUNT = 360;

const requestDetails = {
  REFUND: [
    'Khach yeu cau hoan tien do chon nham suat chieu.',
    'Thanh toan thanh cong nhung khach muon huy ve truoc gio chieu.',
    'Khach bi trung giao dich khi thanh toan online.',
  ],
  CHANGE_TICKET: [
    'Khach muon doi sang suat chieu muon hon trong cung ngay.',
    'Khach can doi vi tri ghe cho nhom di cung nhau.',
    'Khach dat nham rap va can ho tro doi ve.',
  ],
  FOOD_SERVICE: [
    'Khach phan hoi combo bap nuoc giao cham.',
    'Khach can xac nhan lai voucher do an.',
    'Khach bao nhan sai combo tai quay.',
  ],
  MEMBERSHIP: [
    'Khach chua duoc cong diem sau khi dat ve.',
    'Khach can cap nhat hang thanh vien.',
    'Khach muon gop nhieu tai khoan thanh vien.',
  ],
  TECHNICAL_SUPPORT: [
    'Ung dung bao loi khi chon ghe.',
    'Khach khong nhan duoc email xac nhan ve.',
    'Ma QR tren ve hien thi khong ro.',
  ],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function weighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = faker.number.float({ min: 0, max: total });

  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }

  return items[items.length - 1].value;
}

function requestType() {
  return weighted([
    { weight: 30, value: 'CHANGE_TICKET' },
    { weight: 24, value: 'REFUND' },
    { weight: 18, value: 'MEMBERSHIP' },
    { weight: 16, value: 'FOOD_SERVICE' },
    { weight: 12, value: 'TECHNICAL_SUPPORT' },
  ]);
}

function status() {
  return weighted([
    { weight: 62, value: 'RESOLVED' },
    { weight: 18, value: 'IN_PROGRESS' },
    { weight: 14, value: 'PENDING' },
    { weight: 6, value: 'REJECTED' },
  ]);
}

async function seedServiceRequests(customers) {
  const requestCount = clamp(
    Math.round(customers.length * REQUEST_RATE_BY_CUSTOMER),
    MIN_REQUEST_COUNT,
    MAX_REQUEST_COUNT,
  );

  const requests = Array.from({ length: requestCount }, () => {
    const type = requestType();

    return {
      userId: faker.helpers.arrayElement(customers).id,
      requestType: type,
      requestDetail: faker.helpers.arrayElement(requestDetails[type]),
      status: status(),
    };
  });

  return ServiceRequest.bulkCreate(requests);
}

module.exports = seedServiceRequests;
