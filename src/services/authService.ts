import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { logger } from '../utils/logger';

const cognito = new CognitoIdentityServiceProvider({ region: 'us-east-1' });
const CLIENT_ID = '5m24kbogjpi8u1jgfvhfn3jtdk';

export interface TokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  /**
   * Autentica un usuario con username y password
   */
  static async authenticateUser(username: string, password: string): Promise<TokenResponse> {
    try {
      const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      };

      const result = await cognito.initiateAuth(params).promise();
      
      if (!result.AuthenticationResult) {
        throw new Error('Authentication failed');
      }

      return {
        accessToken: result.AuthenticationResult.AccessToken!,
        idToken: result.AuthenticationResult.IdToken!,
        refreshToken: result.AuthenticationResult.RefreshToken!,
        expiresIn: result.AuthenticationResult.ExpiresIn!,
      };
    } catch (error) {
      logger.error('Error authenticating user', error);
      throw error;
    }
  }

  /**
   * Refresca un token usando el refresh token
   */
  static async refreshToken(refreshToken: string): Promise<Omit<TokenResponse, 'refreshToken'>> {
    try {
      const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      };

      const result = await cognito.initiateAuth(params).promise();
      
      if (!result.AuthenticationResult) {
        throw new Error('Token refresh failed');
      }

      return {
        accessToken: result.AuthenticationResult.AccessToken!,
        idToken: result.AuthenticationResult.IdToken!,
        expiresIn: result.AuthenticationResult.ExpiresIn!,
      };
    } catch (error) {
      logger.error('Error refreshing token', error);
      throw error;
    }
  }

  /**
   * Verifica si un token es válido decodificándolo (sin validar firma)
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true; // Si no se puede decodificar, considerarlo expirado
    }
  }

  /**
   * Obtiene un token válido, renovándolo automáticamente si es necesario
   */
  static async getValidToken(accessToken: string, refreshToken: string): Promise<string> {
    if (!this.isTokenExpired(accessToken)) {
      return accessToken;
    }

    logger.info('Token expired, refreshing...');
    const refreshResult = await this.refreshToken(refreshToken);
    return refreshResult.accessToken;
  }
}
