import { APIGatewayProxyHandler } from 'aws-lambda';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

export const loginHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username and password required' }),
      };
    }

    const tokens = await AuthService.authenticateUser(username, password);
    logger.info('User authenticated successfully', { username });

    return {
      statusCode: 200,
      body: JSON.stringify(tokens),
    };
  } catch (error) {
    logger.error('Error in login', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Authentication failed' }),
    };
  }
};

export const refreshHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { refreshToken } = body;

    if (!refreshToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Refresh token required' }),
      };
    }

    const tokens = await AuthService.refreshToken(refreshToken);
    logger.info('Token refreshed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify(tokens),
    };
  } catch (error) {
    logger.error('Error refreshing token', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Token refresh failed' }),
    };
  }
};
