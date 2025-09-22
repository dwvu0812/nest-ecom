export const VERIFICATION_CODE_TYPES = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  TWO_FA_SETUP: 'TWO_FA_SETUP',
} as const;

export type VerificationCodeType =
  (typeof VERIFICATION_CODE_TYPES)[keyof typeof VERIFICATION_CODE_TYPES];

export const OTP_CONFIG = {
  LENGTH: 6,
  MIN_VALUE: 100000,
  MAX_VALUE: 900000,
  RESEND_THROTTLE_SECONDS: 60,
} as const;

export const TOTP_CONFIG = {
  ISSUER: 'NestJS E-Commerce',
  ALGORITHM: 'SHA1',
  DIGITS: 6,
  PERIOD: 30,
  WINDOW: 1, // Accept codes from previous/next time window
  SECRET_SIZE: 20, // 160 bits
} as const;

export const SECURITY_CONSTANTS = {
  DEFAULT_BCRYPT_ROUNDS: 12,
} as const;
