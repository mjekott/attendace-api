import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { KiosksService } from './kiosks.service';
import { CreateKioskDto } from './dto/create-kiosk.dto';
import { UpdateKioskDto } from './dto/update-kiosk.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKioskDto) {
    return this.kiosksService.update(id, dto);
  }
}
