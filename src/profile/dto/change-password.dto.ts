import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { PasswordConfirmation } from '../validators/password-confirmation.validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @PasswordConfirmation('newPassword', {
    message: 'Password confirmation does not match new password',
  })
  confirmPassword: string;
}
