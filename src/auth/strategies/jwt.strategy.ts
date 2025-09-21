import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../shared/config';
import { UsersService } from '../../users/users.service';
import { AuthException } from '../../shared/exceptions';

export interface JwtPayload {
  sub: number;
  email: string;
  role: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByIdWithRole(payload.sub);
    if (!user) {
      throw AuthException.invalidToken();
    }

    if (user.status === 'BLOCKED') {
      throw AuthException.insufficientPermissions();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
