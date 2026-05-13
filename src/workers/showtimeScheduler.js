const { showtimeQueue } = require('./queue');

// Schedule the showtime status update job to run every 5 minutes
const scheduleShowtimeUpdates = () => {
  showtimeQueue.add(
    'update-statuses',
    {},
    { repeat: { cron: '*/5 * * * *' }, jobId: 'showtime-status-update' }
  );
};

module.exports = { scheduleShowtimeUpdates };
