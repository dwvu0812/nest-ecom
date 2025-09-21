import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { googleConfig } from '../../shared/config';
import { AuthService } from '../auth.service';

export interface GoogleProfile {
  id: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: [{ value: string; verified: boolean }];
  photos: [{ value: string }];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    if (!googleConfig.clientID || !googleConfig.clientSecret) {
      throw new Error(
        'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
      );
    }

    super({
      clientID: googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;

      const userPayload = {
        googleId: id,
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0]?.value,
        emailVerified: emails[0].verified,
        accessToken,
        refreshToken,
      };

      const user = await this.authService.googleLogin(userPayload);

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
