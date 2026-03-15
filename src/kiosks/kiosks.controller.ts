import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { KiosksService } from './kiosks.service';
import { CreateKioskDto } from './dto/create-kiosk.dto';
import { UpdateKioskDto } from './dto/update-kiosk.dto';
import { UpdateKioskStatusDto } from './dto/update-kiosk-status.dto';
import { KioskAuthGuard } from '../common/guards/kiosk-auth.guard';
import { CurrentKiosk } from '../common/decorators/current-kiosk.decorator';

@Controller('kiosks')
export class KiosksController {
  constructor(private readonly kiosksService: KiosksService) {}

  @Post()
  create(@Body() dto: CreateKioskDto) {
    return this.kiosksService.create(dto);
  }

  @Get()
  findAll() {
    return this.kiosksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kiosksService.findOne(id);
  }

  @Patch('status')
  @UseGuards(KioskAuthGuard)
  updateStatus(
    @CurrentKiosk() kiosk: { kioskId: string },
    @Body() dto: UpdateKioskStatusDto,
  ) {
    return this.kiosksService.updateStatus(kiosk.kioskId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKioskDto) {
    return this.kiosksService.update(id, dto);
  }
}
