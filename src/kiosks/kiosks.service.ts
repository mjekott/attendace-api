import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKioskDto } from './dto/create-kiosk.dto';
import { UpdateKioskDto } from './dto/update-kiosk.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class KiosksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKioskDto) {
    const secretKey = randomBytes(32).toString('hex');
    return this.prisma.kiosk.create({
      data: {
        name: dto.name,
        location: dto.location,
        secretKey,
      },
    });
  }

  async findAll() {
    return this.prisma.kiosk.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        lastSeen: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.kiosk.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        secretKey: true,
        isActive: true,
        lastSeen: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateKioskDto) {
    return this.prisma.kiosk.update({
      where: { id },
      data: dto,
    });
  }
}
