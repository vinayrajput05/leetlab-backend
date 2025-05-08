import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  addProblemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllListDetails,
  getPlayListDetails,
  removeProblemFromPlaylist,
} from '../controllers/playlist.controller.js';

const playlistRoutes = Router();

playlistRoutes.get('/', authMiddleware, getAllListDetails);

playlistRoutes.get('/:playlistId', authMiddleware, getPlayListDetails);

playlistRoutes.post('/create-playlist', authMiddleware, createPlaylist);

playlistRoutes.post(
  '/:playlistId/add-problem',
  authMiddleware,
  addProblemToPlaylist,
);

playlistRoutes.delete('/:playlistId', authMiddleware, deletePlaylist);

playlistRoutes.delete(
  '/:playlistId/remove-problem',
  authMiddleware,
  removeProblemFromPlaylist,
);

export default playlistRoutes;
