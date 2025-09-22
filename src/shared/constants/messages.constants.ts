export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh.',
  INVALID_VERIFICATION_CODE: 'Mã xác minh không hợp lệ hoặc đã hết hạn',
  EMAIL_ALREADY_VERIFIED: 'Email đã được xác minh trước đó.',
  EMAIL_VERIFIED_SUCCESS: 'Xác minh email thành công.',
  EMAIL_ALREADY_VERIFIED_RESEND: 'Email đã được xác minh.',
  RESEND_THROTTLE: 'Vui lòng chờ ít nhất 60 giây trước khi yêu cầu lại',
  RESEND_SUCCESS: 'Đã gửi lại mã xác minh qua email.',
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  LOGOUT_SUCCESS: 'Đăng xuất thành công.',
  LOGOUT_ALL_SUCCESS: 'Đăng xuất khỏi tất cả thiết bị thành công.',
  DEVICE_REVOKE_SUCCESS: 'Thiết bị đã được thu hồi thành công.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  EMAIL_NOT_VERIFIED: 'Vui lòng xác minh email trước khi đăng nhập.',
  ACCOUNT_BLOCKED: 'Tài khoản đã bị khóa.',
  FORGOT_PASSWORD_SUCCESS:
    'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã đặt lại mật khẩu.',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công.',
  INVALID_RESET_CODE: 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
  GOOGLE_ACCOUNT_NO_PASSWORD:
    'Tài khoản này được tạo bằng Google và không có mật khẩu để đặt lại.',

  // 2FA Messages
  TWO_FA_SETUP_REQUIRED: 'Vui lòng xác minh mã TOTP để kích hoạt 2FA.',
  TWO_FA_ENABLED_SUCCESS: '2FA đã được kích hoạt thành công.',
  TWO_FA_DISABLED_SUCCESS: '2FA đã được tắt thành công.',
  TWO_FA_ALREADY_ENABLED: '2FA đã được kích hoạt trước đó.',
  TWO_FA_NOT_ENABLED: '2FA chưa được kích hoạt cho tài khoản này.',
  TWO_FA_REQUIRED: 'Cần xác minh 2FA để hoàn tất đăng nhập.',
  TWO_FA_LOGIN_SUCCESS: 'Đăng nhập 2FA thành công.',
  INVALID_2FA_CODE: 'Mã 2FA không hợp lệ hoặc đã hết hạn.',
  INVALID_TEMP_TOKEN: 'Token tạm thời không hợp lệ hoặc đã hết hạn.',
} as const;

export const VALIDATION_FIELDS = {
  VERIFICATION_CODE: 'verification_code',
  RESEND_REQUEST: 'resend_request',
  EMAIL: 'email',
  PASSWORD: 'password',
} as const;
