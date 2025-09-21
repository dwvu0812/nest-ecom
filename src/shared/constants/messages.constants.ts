export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh.',
  INVALID_VERIFICATION_CODE: 'Mã xác minh không hợp lệ hoặc đã hết hạn',
  EMAIL_ALREADY_VERIFIED: 'Email đã được xác minh trước đó.',
  EMAIL_VERIFIED_SUCCESS: 'Xác minh email thành công.',
  EMAIL_ALREADY_VERIFIED_RESEND: 'Email đã được xác minh.',
  RESEND_THROTTLE: 'Vui lòng chờ ít nhất 60 giây trước khi yêu cầu lại',
  RESEND_SUCCESS: 'Đã gửi lại mã xác minh qua email.',
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  EMAIL_NOT_VERIFIED: 'Vui lòng xác minh email trước khi đăng nhập.',
  ACCOUNT_BLOCKED: 'Tài khoản đã bị khóa.',
} as const;

export const VALIDATION_FIELDS = {
  VERIFICATION_CODE: 'verification_code',
  RESEND_REQUEST: 'resend_request',
  EMAIL: 'email',
  PASSWORD: 'password',
} as const;
