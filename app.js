import express from 'express';
const app = express();

import cookieParser from 'cookie-parser';
import authenticationRoutes from './src/routes/authentication.routes.js';


app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authenticationRoutes);

export default app;