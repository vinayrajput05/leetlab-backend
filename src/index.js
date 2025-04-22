import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('hello world');
});

app.use('/api/v1/auth', authRoutes);  

app.listen(PORT, () => {
    console.log('server is running', PORT);
});
