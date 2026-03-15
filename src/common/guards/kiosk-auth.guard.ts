import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KioskAuthGuard extends AuthGuard('kiosk-jwt') {}
