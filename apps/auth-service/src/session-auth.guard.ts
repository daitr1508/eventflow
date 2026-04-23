import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { session?: Record<string, any> }>();
    if (request.session && request.session.user) {
      return true;
    }
    throw new UnauthorizedException('Unauthorized session');
  }
}
