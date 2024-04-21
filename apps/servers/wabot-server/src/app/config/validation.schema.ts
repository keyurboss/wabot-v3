import Joi from 'joi';

export const JwtKeyLength = 128;

export const defaultValidationSchema = {
  // ...commonValidationSchema,
  ACCESS_TOKEN_KEY: Joi.string().required().min(JwtKeyLength),
  DB_URL: Joi.string().uri().optional(),
  REDIS_URL: Joi.string().uri().optional(),
  DB_TLS_CA: Joi.string().optional(),
  REFRESH_TOKEN_KEY: Joi.string().required().min(JwtKeyLength),
  REDIS_USERNAME: Joi.string().optional(),
  REDIS_PASSWORD: Joi.string().optional(),
  PORT: Joi.number().port().required(),
};
