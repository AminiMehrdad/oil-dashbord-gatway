export interface ErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error: string;
}