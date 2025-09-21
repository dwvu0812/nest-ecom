import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw exception when no JWT token
  handleRequest(err: any, user: any) {
    // If there's no user, just return null instead of throwing error
    return user || null;
  }
}
