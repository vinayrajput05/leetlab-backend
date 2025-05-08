import { db } from '../libs/db.js';
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';

export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res
      .status(200)
      .json(new ApiResponse(200, playlist, 'Playlist created successfully'));
  } catch (error) {
    console.log('createPlaylist error', error);
    next(error);
  }
};

export const getAllListDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const playlists = await db.playlist.findMany({
      where: {
        userId,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    res
      .status(200)
      .json(new ApiResponse(200, playlists, 'Playlists fetched successfully'));
  } catch (error) {
    console.log('getAllListDetails error', error);
    next(error);
  }
};

export const getPlayListDetails = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    res
      .status(200)
      .json(new ApiResponse(200, playlist, 'Playlist fetched successfully'));
  } catch (error) {
    console.log('getPlayListDetails error', error);
    next(error);
  }
};

export const addProblemToPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds)) {
      throw new ApiError(400, 'Invalid problem ids');
    }

    const problemsInPlaylist = await db.ProblemInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          200,
          problemsInPlaylist,
          'Problems added to playlist successfully',
        ),
      );
  } catch (error) {
    console.log('addProblemToPlaylist error', error);
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const deletePlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, deletePlaylist, 'Playlist deleted successfully'),
      );
  } catch (error) {
    console.log('deletePlaylist error', error);
    next(error);
  }
};

export const removeProblemFromPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    if (!Array.isArray(problemIds)) {
      throw new ApiError(400, 'Invalid problem ids');
    }

    const problemsInPlaylist = await db.ProblemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          problemsInPlaylist,
          'Problems removed from playlist successfully',
        ),
      );
  } catch (error) {
    console.log('removeProblemFromPlaylist error', error);
    next(error);
  }
};
