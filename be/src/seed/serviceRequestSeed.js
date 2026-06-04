const { faker } = require('@faker-js/faker');
const ServiceRequest = require('../models/ServiceRequest');

const SERVICE_REQUEST_COUNT = 200;

async function seedServiceRequests(customers) {
  const requests = Array.from({ length: SERVICE_REQUEST_COUNT }, () => ({
    userId: faker.helpers.arrayElement(customers).id,
    requestType: faker.helpers.arrayElement(['REFUND', 'CHANGE_TICKET', 'FOOD_SERVICE', 'MEMBERSHIP', 'TECHNICAL_SUPPORT']),
    requestDetail: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  }));

  return ServiceRequest.bulkCreate(requests);
}

module.exports = seedServiceRequests;
