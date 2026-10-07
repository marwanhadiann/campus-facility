import express from 'express';
import 'dotenv/config';
import router from './route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Parsing Body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
)

app.use('/api', router)

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'API Backend Kampus Berjalan!' });
});

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});

export default app