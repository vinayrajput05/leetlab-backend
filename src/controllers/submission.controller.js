import { db } from '../libs/db.js';
import ApiResponse from '../utils/api-response.js';

export const getAllSubmissions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const submissions = await db.submission.findMany({
      where: {
        userId,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, submissions, 'Submissions fetched successfully'),
      );
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsForPloblem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;

    const submissions = await db.submission.findMany({
      where: { userId, problemId },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, submissions, 'Submissions fetched successfully'),
      );
  } catch (error) {
    next(error);
  }
};

export const getAllTheSumissionsForProblem = async (req, res, next) => {
  try {
    const problemId = req.params.problemId;
    const submissions = await db.submission.count({
      where: { problemId },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, submissions, 'Submissions fetched successfully'),
      );
  } catch (error) {
    next(error);
  }
};
