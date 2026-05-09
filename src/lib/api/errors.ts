export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(message = 'The server returned data in an unexpected shape.') {
    super(message);
    this.name = 'ValidationError';
  }
}
