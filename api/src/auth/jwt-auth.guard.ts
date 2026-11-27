import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

// What we put in the token when the user logs in. sub (subject) is the user id.
export type JwtPayload = { sub: number; role: string };

export type AuthenticatedRequest = Request & { user: JwtPayload };

// Protects a route: requires "Authorization: Bearer <token>" with a valid, unexpired token
// signed with our JWT_SECRET. Use with @UseGuards(JwtAuthGuard).
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    try {
      // Checks the signature and the expiry time
      request.user = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
