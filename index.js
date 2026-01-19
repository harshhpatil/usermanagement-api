import 'dotenv/config';
import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import authenticationRoutes from './src/routes/authentication.routes.js';

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authenticationRoutes);

app.listen(PORT, () => {
    console.log(`User Management API is running on port ${PORT}`);
});


