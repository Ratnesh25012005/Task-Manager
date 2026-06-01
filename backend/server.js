import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());

const uri = process.env.MONGODB_URL;

// Configure session store using MongoDB
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
        store: MongoStore.create({ mongoUrl: uri }),
    }),
);

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static('uploads'));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Task Manager API is running.' });
});

const start = async () => {
    await mongoose.connect(uri);

    const port = process.env.PORT || 9080;

    app.listen(port, () => {
        console.log(`Server is working at port ${port}`);
    });
};

start();
