import dotenv from 'dotenv';

dotenv.config();

export const config = {
  /** Server port */
  port: parseInt(process.env.PORT || '3000', 10),

  /** Node environment */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** JWT secret key */
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-me',

  /** JWT expiration */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  /** Bcrypt salt rounds */
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  /** Is production? */
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
};
