import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { VerifyGatePassDto } from './dto/verify-gate-pass.dto';
import { KioskAuthGuard } from '../common/guards/kiosk-auth.guard';
import { CurrentKiosk } from '../common/decorators/current-kiosk.decorator';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  create(@Body() dto: CreateGatePassDto) {
    return this.visitorsService.create(dto);
  }

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.visitorsService.findAll({ date, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(id);
  }

  @Post('verify')
  @UseGuards(KioskAuthGuard)
  verify(
    @Body() dto: VerifyGatePassDto,
    @CurrentKiosk() kiosk: { kioskId: string },
  ) {
    return this.visitorsService.verify(dto, kiosk.kioskId);
  }
}
