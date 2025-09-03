import { APIGatewayProxyEvent } from 'aws-lambda';

export interface DecodedToken {
  sub: string;
  username?: string;
  email?: string;
  exp: number;
  iat: number;
  token_use: string;
}

export class AuthUtils {
  /**
   * Extrae el token JWT del header Authorization
   */
  static extractTokenFromEvent(event: APIGatewayProxyEvent): string | null {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return null;
    }

    // Formato esperado: "Bearer token_aqui"
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    return tokenMatch ? tokenMatch[1] : null;
  }

  /**
   * Decodifica un JWT sin validar la firma (solo para verificar expiración)
   */
  static decodeJWT(token: string): DecodedToken {
    try {
      const payload = token.split('.')[1];
      const decoded = Buffer.from(payload, 'base64').toString();
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Invalid JWT token format');
    }
  }

  /**
   * Verifica si un token está expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeJWT(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      return true;
    }
  }

  /**
   * Crea una respuesta de error de autenticación
   */
  static createAuthErrorResponse(message: string = 'Unauthorized') {
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        message,
        hint: 'Use /login endpoint to get a new token or /refresh to refresh existing token'
      }),
    };
  }

  /**
   * Middleware para verificar token en eventos
   */
  static validateTokenInEvent(event: APIGatewayProxyEvent): { isValid: boolean; token?: string; error?: string } {
    const token = this.extractTokenFromEvent(event);
    
    if (!token) {
      return { 
        isValid: false, 
        error: 'Missing Authorization header. Format: Bearer <token>' 
      };
    }

    if (this.isTokenExpired(token)) {
      return { 
        isValid: false, 
        error: 'The incoming token has expired' 
      };
    }

    return { isValid: true, token };
  }
}
