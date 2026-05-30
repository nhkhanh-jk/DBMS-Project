const showtimeService = require('../services/showtimeService');

// Schedule showtime status updates to run every 5 minutes in background
const scheduleShowtimeUpdates = () => {
  console.log('[Scheduler] Showtime status update scheduler initialized');
  
  setInterval(async () => {
    try {
      console.log('[Scheduler] Running automated showtime status check...');
      const count = await showtimeService.updateExpiredStatus();
      if (count > 0) {
        console.log(`[Scheduler] Successfully updated ${count} showtimes to COMPLETED status`);
      }
    } catch (error) {
      console.error('[Scheduler] Error running automated showtime updates:', error.message);
    }
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
};

module.exports = { scheduleShowtimeUpdates };
