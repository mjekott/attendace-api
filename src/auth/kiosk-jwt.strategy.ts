import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KioskJwtStrategy extends PassportStrategy(Strategy, 'kiosk-jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { kioskId: string; sub: string }) {
    const kiosk = await this.prisma.kiosk.findUnique({
      where: { id: payload.kioskId },
    });

    if (!kiosk || !kiosk.isActive) {
      throw new UnauthorizedException('Kiosk not found or inactive');
    }

    await this.prisma.kiosk.update({
      where: { id: kiosk.id },
      data: { lastSeen: new Date() },
    });

    return { kioskId: kiosk.id, name: kiosk.name, location: kiosk.location };
  }
}
