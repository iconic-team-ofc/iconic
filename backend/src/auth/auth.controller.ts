import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/firebase')
  login(@Body('idToken') idToken: string) {
    return this.authService.validateFirebaseIdToken(idToken);
  }
}
