import express from 'express';
import { login, register } from '../controllers/user.controller.js';

const userRoutes = express.Router();

userRoutes.post('/api/users/register', register);
userRoutes.post('/api/users/login', login);

export default userRoutes;
