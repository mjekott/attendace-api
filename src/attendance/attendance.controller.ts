import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';
import { KioskAuthGuard } from '../common/guards/kiosk-auth.guard';
import { CurrentKiosk } from '../common/decorators/current-kiosk.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('verify')
  @UseGuards(KioskAuthGuard)
  verify(
    @Body() dto: VerifyAttendanceDto,
    @CurrentKiosk() kiosk: { kioskId: string },
  ) {
    return this.attendanceService.verify(dto, kiosk.kioskId);
  }

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('kioskId') kioskId?: string,
  ) {
    return this.attendanceService.findAll({ date, kioskId });
  }
}
