import 'dotenv/config';
import app from './app.js';
import dbConnection from './src/config/dbConnection.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await dbConnection();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = (signal) => {
            console.log(`\n${signal} received. Shutting down...`);
            server.close(() => {
                console.log('Stop accepting new requests.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        console.error('SERVER STARTUP ERROR:', error.message);
        process.exit(1); 
    }
};


startServer();