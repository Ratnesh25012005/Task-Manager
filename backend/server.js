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

const start = async () => {
    await mongoose.connect(uri);

    app.listen(9080, () => {
        console.log('Server is working at port 9080');
    });
};

start();
