const { Queue } = require('bullmq');
const { redis } = require('../config/redis');

const emailQueue = new Queue('email', { connection: redis });
const pointsQueue = new Queue('points', { connection: redis });
const showtimeQueue = new Queue('showtime-status', { connection: redis });

module.exports = {
  emailQueue,
  pointsQueue,
  showtimeQueue,
};
