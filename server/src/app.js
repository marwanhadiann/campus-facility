import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Parsing Body JSON
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'API Backend Kampus Berjalan!' });
});

app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});