const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');

const CUSTOMER_COUNT = 12000;
const EMPLOYEE_COUNT = 64;

function membershipFor(index) {
  const ratio = index / CUSTOMER_COUNT;
  if (ratio < 0.08) return 'gold';
  if (ratio < 0.28) return 'silver';
  return 'bronze';
}

function rewardPointsFor(level) {
  if (level === 'gold') return faker.number.int({ min: 2200, max: 9000 });
  if (level === 'silver') return faker.number.int({ min: 600, max: 3500 });
  return faker.number.int({ min: 0, max: 1200 });
}

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

  const employees = Array.from({ length: EMPLOYEE_COUNT }, (_, index) => {
    const staffNumber = index + 1;
    const inactive = staffNumber % 23 === 0;

    return {
      username: `seed_staff_${runId}_${staffNumber}`,
      password,
      role: 'NHANVIEN',
      fullName: faker.person.fullName(),
      email: `seed_staff_${runId}_${staffNumber}@tnc.test`,
      phoneNumber: faker.phone.number('09########'),
      rewardPoints: 0,
      membershipLevel: 'bronze',
      isActive: !inactive,
    };
  });

  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const customerNumber = index + 1;
    const membershipLevel = membershipFor(index);

    return {
      username: `seed_customer_${runId}_${customerNumber}`,
      password,
      role: 'KHACHHANG',
      fullName: faker.person.fullName(),
      dateOfBirth: faker.date.birthdate({ min: 16, max: 62, mode: 'age' }),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      email: `seed_customer_${runId}_${customerNumber}@example.test`,
      phoneNumber: faker.phone.number('08########'),
      rewardPoints: rewardPointsFor(membershipLevel),
      membershipLevel,
      isActive: customerNumber % 97 !== 0,
    };
  });

  return User.bulkCreate([admin, ...employees, ...customers]);
}

module.exports = seedUsers;
