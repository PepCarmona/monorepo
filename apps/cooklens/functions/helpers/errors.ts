export class CustomError {
  message: string;
  error: string;
  stack: string;

  constructor(message: string, error?: Error) {
    this.message = message;
    if (error) {
      this.error = error.message;
      this.stack = error.stack ?? '';
    }
  }
}
