const mongoose = require('mongoose');

// One-time script to drop indexes that are causing conflicts
const dropIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for index maintenance...');

        const Location = require('./src/models/Location');
        const Bus = require('./src/models/Bus');

        // Drop name_1 index on locations if it exists
        try {
            await Location.collection.dropIndex('name_1');
            console.log('Dropped name_1 index from locations');
        } catch (e) {
            console.log('name_1 index on locations might not exist or already dropped:', e.message);
        }

        // Drop busNumber_1 index on buses if it exists
        try {
            await Bus.collection.dropIndex('busNumber_1');
            console.log('Dropped busNumber_1 index from buses');
        } catch (e) {
            console.log('busNumber_1 index on buses might not exist or already dropped:', e.message);
        }

        console.log('Index cleanup complete. New compound indexes should be created automatically by Mongoose on restart.');
        process.exit();
    } catch (error) {
        console.error('Error dropping indexes:', error);
        process.exit(1);
    }
};

require('dotenv').config();
dropIndexes();
