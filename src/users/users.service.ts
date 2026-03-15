import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { employeeId: dto.employeeId },
    });

    if (existing) {
      throw new ConflictException('Employee ID already exists');
    }

    return this.prisma.user.create({
      data: {
        name: dto.name,
        employeeId: dto.employeeId,
        department: dto.department,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { embeddings: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        _count: { select: { embeddings: true } },
      },
    });
  }
}
