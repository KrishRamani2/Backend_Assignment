import dotenv from 'dotenv';

dotenv.config();

export const config = {
  
  port: parseInt(process.env.PORT || '3000', 10),

 
  nodeEnv: process.env.NODE_ENV || 'development',

 
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-me',

  
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

 
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
};
