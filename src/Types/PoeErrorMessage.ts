export interface PoeErrorMessage {
  error: {
    code: number;
    message: string;
  };
}

export const PoeErrorCodes = {
  0: 'Accepted',
  1: 'Resource not found',
  2: 'Invalid query',
  3: 'Rate limit exceeded',
  4: 'Internal error',
  5: 'Unexpected content type',
  8: '	Unauthorized',
  6: 'Forbidden',
  7: 'Temporarily Unavailable',
  9: 'Method not allowed',
  10: 'Unprocessable Entity',
};
