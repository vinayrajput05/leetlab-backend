import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getAllSubmissions,
  getAllTheSumissionsForProblem,
  getSubmissionsForPloblem,
} from '../controllers/submission.controller.js';

const submissionRoutes = Router();

submissionRoutes.get('/get-all-submissions', authMiddleware, getAllSubmissions);
submissionRoutes.get(
  '/get-submission/:problemId',
  authMiddleware,
  getSubmissionsForPloblem,
);
submissionRoutes.get(
  '/get-submissions-count/:problemId',
  authMiddleware,
  getAllTheSumissionsForProblem,
);

export default submissionRoutes;
