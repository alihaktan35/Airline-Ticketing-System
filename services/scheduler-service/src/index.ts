import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3001';

console.log('Scheduler service started.');
console.log(`Will call flight service at: ${FLIGHT_SERVICE_URL}`);

// Schedule a task to run every minute for testing.
// In production, this would be something like '0 2 * * *' for 2 AM every day.
cron.schedule('* * * * *', async () => {
    console.log('Running the award-miles job...');
    try {
        const response = await axios.post(`${FLIGHT_SERVICE_URL}/flights/award-miles`);
        console.log('Award-miles job finished successfully:', response.data);
    } catch (error: any) {
        console.error('Error running award-miles job:', error.response?.data || error.message);
    }
});
