const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');

const CUSTOMER_COUNT = 300;
const EMPLOYEE_COUNT = 8;

async function seedUsers(runId) {
  const password = await bcrypt.hash('123456', 10);

  const admin = {
    username: `seed_admin_${runId}`,
    password,
    role: 'ADMIN',
    fullName: 'Seed Admin',
    email: `seed_admin_${runId}@tnc.test`,
    phoneNumber: '0900000000',
    rewardPoints: 0,
    membershipLevel: 'gold',
    isActive: true,
  };

  const employees = Array.from({ length: EMPLOYEE_COUNT }, (_, index) => ({
    username: `seed_staff_${runId}_${index + 1}`,
    password,
    role: 'NHANVIEN',
    fullName: faker.person.fullName(),
    email: `seed_staff_${runId}_${index + 1}@tnc.test`,
    phoneNumber: faker.phone.number('09########'),
    rewardPoints: 0,
    membershipLevel: 'bronze',
    isActive: true,
  }));

  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, index) => ({
    username: `seed_customer_${runId}_${index + 1}`,
    password,
    role: 'KHACHHANG',
    fullName: faker.person.fullName(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 55, mode: 'age' }),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    email: `seed_customer_${runId}_${index + 1}@example.test`,
    phoneNumber: faker.phone.number('08########'),
    rewardPoints: faker.number.int({ min: 0, max: 5000 }),
    membershipLevel: faker.helpers.arrayElement(['bronze', 'silver', 'gold']),
    isActive: true,
  }));

  return User.bulkCreate([admin, ...employees, ...customers]);
}

module.exports = seedUsers;
