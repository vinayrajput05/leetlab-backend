// Class to standardize API success responses
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode; // HTTP status code (e.g., 200, 201, etc.)
    this.message = message; // Response message, defaults to "Success"
    this.success = statusCode < 400; // Automatically determine success status based on HTTP code
    this.data = data; // Payload data (object, array, etc.)
  }
}

// Exporting the class to use in other files (e.g., controllers or services)
export default ApiResponse;
