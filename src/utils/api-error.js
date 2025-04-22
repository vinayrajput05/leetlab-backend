// Custom error class that extends the built-in JavaScript Error class
class ApiError extends Error {
  constructor(
    statusCode, // HTTP status code (e.g., 400, 404, 500, etc.)
    message = "Something went wrong", // Default error message if not provided
    errors = [], // Optional array of validation or internal errors
    stack = "", // Optional custom stack trace
  ) {
    super(message); // Call parent constructor with message
    this.statusCode = statusCode; // Custom property to hold status code
    this.message = message; // Error message
    this.success = false; // Flag to indicate failure in response
    this.errors = errors; // Any additional error details (e.g., field errors)

    // If a custom stack trace is provided, use it
    if (stack) {
      this.stack = stack;
    } else {
      // Otherwise, automatically capture the stack trace from the current location
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Exporting the class to be used in other files
export default ApiError;
