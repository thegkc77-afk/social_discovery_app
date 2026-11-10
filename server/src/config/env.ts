import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'vibematch_super_secure_jwt_secret_key_2026',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
};

