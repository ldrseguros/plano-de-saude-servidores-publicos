class ApiResponse {
  constructor(success, statusCode, data, message) {
    this.success = success;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

export { ApiResponse };
