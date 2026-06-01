import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from '../controllers/posts.controller.js';

const postRoutes = express.Router();

postRoutes.get('/api/posts', authMiddleware, getPosts);
postRoutes.post('/api/posts', authMiddleware, createPost);
postRoutes.put('/api/posts/:id', authMiddleware, updatePost);
postRoutes.delete('/api/posts/:id', authMiddleware, deletePost);

export default postRoutes;
