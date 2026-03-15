import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginKioskDto } from './dto/login-kiosk.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kiosk/login')
  async loginKiosk(@Body() dto: LoginKioskDto) {
    return this.authService.loginKiosk(dto.secretKey);
  }
}
