import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginKiosk(secretKey: string) {
    const kiosk = await this.prisma.kiosk.findUnique({
      where: { secretKey },
    });

    if (!kiosk || !kiosk.isActive) {
      throw new UnauthorizedException('Invalid or inactive kiosk');
    }

    await this.prisma.kiosk.update({
      where: { id: kiosk.id },
      data: { lastSeen: new Date() },
    });

    const payload = { kioskId: kiosk.id, sub: kiosk.id };
    return {
      accessToken: this.jwtService.sign(payload),
      kiosk: {
        id: kiosk.id,
        name: kiosk.name,
        location: kiosk.location,
      },
    };
  }
}
