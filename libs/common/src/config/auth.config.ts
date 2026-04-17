import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => {
  return {
    environment: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtExpiresInRefreshToken: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN,
    authServiceUrl: process.env.AUTH_SERVICE_URL,
  };
});
