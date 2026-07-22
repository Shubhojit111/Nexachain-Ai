const cron = require('node-cron');
const { processDailyROI } = require('../services/roiService');

// Schedule daily ROI job to run at 12:00 AM server time
const scheduleROIJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log(`[ROI CRON] Starting daily ROI run at ${new Date().toISOString()}`);
    try {
      const summary = await processDailyROI();
      console.log(
        `[ROI CRON] Completed. Processed: ${summary.processed}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`
      );
    } catch (error) {
      console.error('[ROI CRON] Unhandled error during ROI processing:', error);
    }
  });

  console.log('[ROI CRON] Scheduled to run daily at 12:00 AM');
};

module.exports = scheduleROIJob;
