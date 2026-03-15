import { Controller, Get, Post, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { KioskAuthGuard } from '../common/guards/kiosk-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':employeeId/embeddings')
  @UseGuards(KioskAuthGuard)
  async getEmbeddings(@Param('employeeId') employeeId: string) {
    const result = await this.usersService.findByEmployeeIdWithEmbeddings(employeeId);
    if (!result) {
      throw new NotFoundException('Employee not found');
    }
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
