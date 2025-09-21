import { z } from 'zod';

// Schema validation cho biến môi trường
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL là bắt buộc'),

  // Server
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // JWT Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET phải có ít nhất 32 ký tự'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET phải có ít nhất 32 ký tự'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email (Resend)
  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY là bắt buộc cho dịch vụ email'),
  FROM_EMAIL: z.email().optional(),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(5242880), // 5MB
  UPLOAD_PATH: z.string().default('./uploads'),

  // Redis (optional cho caching/sessions)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Payment Gateway (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60000), // 1 minute
  RATE_LIMIT_LIMIT: z.coerce.number().int().positive().default(10),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // OTP/2FA
  OTP_SECRET: z
    .string()
    .min(16, 'OTP_SECRET phải có ít nhất 16 ký tự')
    .optional(),
  OTP_EXPIRES_IN: z.coerce.number().int().positive().default(300), // 5 minutes

  // Timeout
  TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default('http://localhost:3000/auth/google/callback'),
});

// Parse và validate biến môi trường
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      throw new Error(
        `❌ Lỗi cấu hình biến môi trường:\n${errorMessages.join('\n')}`,
      );
    }
    throw error as Error;
  }
};

// Export validated config
export const config = validateEnv();

// Export types
export type Config = z.infer<typeof envSchema>;

// Export individual config objects cho dễ sử dụng
export const databaseConfig = {
  url: config.DATABASE_URL,
} as const;

export const serverConfig = {
  nodeEnv: config.NODE_ENV,
  port: config.PORT,
  corsOrigin: config.CORS_ORIGIN,
  timeoutMs: config.TIMEOUT_MS,
} as const;

export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
  refreshSecret: config.JWT_REFRESH_SECRET,
  refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
} as const;

export const emailConfig = {
  resend: {
    apiKey: config.RESEND_API_KEY,
  },
  from: config.FROM_EMAIL,
} as const;

export const fileConfig = {
  maxFileSize: config.MAX_FILE_SIZE,
  uploadPath: config.UPLOAD_PATH,
} as const;

export const securityConfig = {
  bcryptRounds: config.BCRYPT_ROUNDS,
  rateLimit: {
    ttl: config.RATE_LIMIT_TTL,
    limit: config.RATE_LIMIT_LIMIT,
  },
  otp: {
    secret: config.OTP_SECRET,
    expiresIn: config.OTP_EXPIRES_IN,
  },
} as const;

export const redisConfig = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
} as const;

export const paymentConfig = {
  stripe: {
    secretKey: config.STRIPE_SECRET_KEY,
    webhookSecret: config.STRIPE_WEBHOOK_SECRET,
  },
} as const;

export const googleConfig = {
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: config.GOOGLE_CALLBACK_URL,
} as const;
