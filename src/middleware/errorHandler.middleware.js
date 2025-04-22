import ApiError from '../utils/api-error.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // For unexpected errors
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
