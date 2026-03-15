import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { KioskAuthGuard } from '../common/guards/kiosk-auth.guard';
import { CurrentKiosk } from '../common/decorators/current-kiosk.decorator';

@Controller('sync')
@UseGuards(KioskAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('gate-passes')
  getTodayGatePasses() {
    return this.syncService.getTodayGatePasses();
  }

  @Post('queue')
  processQueue(
    @CurrentKiosk() kiosk: { kioskId: string },
    @Body() body: { records: any[] },
  ) {
    return this.syncService.processQueue(body.records, kiosk.kioskId);
  }
}
