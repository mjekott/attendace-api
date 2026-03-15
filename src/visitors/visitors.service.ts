import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { VerifyGatePassDto } from './dto/verify-gate-pass.dto';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

// Characters excluding ambiguous ones (0/O, 1/I/L)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  private generateAccessCode(): string {
    const bytes = randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
    }
    return code;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async create(dto: CreateGatePassDto) {
    // Generate unique access code
    let accessCode = this.generateAccessCode();
    while (await this.prisma.gatePass.findUnique({ where: { accessCode } })) {
      accessCode = this.generateAccessCode();
    }

    // Normalize expectedDate to midnight
    const expectedDate = new Date(dto.expectedDate);
    expectedDate.setHours(0, 0, 0, 0);

    // Generate QR code as data URI
    const qrCode = await QRCode.toDataURL(accessCode, {
      width: 300,
      margin: 2,
    });

    const gatePass = await this.prisma.gatePass.create({
      data: {
        accessCode,
        visitorName: dto.visitorName,
        purpose: dto.purpose,
        hostName: dto.hostName,
        expectedDate,
        qrCode,
      },
    });

    return {
      ...gatePass,
      summary: `Gate pass for ${gatePass.visitorName} visiting ${gatePass.hostName} on ${this.formatDate(expectedDate)}. Purpose: ${gatePass.purpose}. Access code: ${gatePass.accessCode}`,
    };
  }

  async findAll(filters?: { date?: string; status?: string }) {
    const where: any = {};

    if (filters?.date) {
      const date = new Date(filters.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.expectedDate = { gte: date, lt: nextDay };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.gatePass.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.gatePass.findUnique({ where: { id } });
  }

  async verify(dto: VerifyGatePassDto, kioskId: string) {
    const code = dto.accessCode.toUpperCase();

    const gatePass = await this.prisma.gatePass.findUnique({
      where: { accessCode: code },
    });

    if (!gatePass) {
      return { valid: false, message: 'Invalid access code' };
    }

    // Check if pass is for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expectedDate = new Date(gatePass.expectedDate);
    expectedDate.setHours(0, 0, 0, 0);

    if (expectedDate.getTime() !== today.getTime()) {
      if (expectedDate.getTime() < today.getTime() && gatePass.status === 'PENDING') {
        await this.prisma.gatePass.update({
          where: { id: gatePass.id },
          data: { status: 'EXPIRED' },
        });
      }
      return {
        valid: false,
        message: expectedDate.getTime() > today.getTime()
          ? 'Gate pass is not yet valid'
          : 'Gate pass has expired',
      };
    }

    if (gatePass.status === 'EXPIRED') {
      return { valid: false, message: 'Gate pass has expired' };
    }

    if (gatePass.status === 'CHECKED_OUT') {
      return { valid: false, message: 'Gate pass already used and checked out' };
    }

    // Auto-detect action: PENDING → CHECKIN, CHECKED_IN → CHECKOUT
    if (gatePass.status === 'PENDING') {
      const updated = await this.prisma.gatePass.update({
        where: { id: gatePass.id },
        data: {
          status: 'CHECKED_IN',
          checkedIn: new Date(),
          kioskId,
        },
      });

      return {
        valid: true,
        visitorName: updated.visitorName,
        hostName: updated.hostName,
        purpose: updated.purpose,
        action: 'CHECKIN',
        checkedIn: updated.checkedIn,
        message: `Welcome ${updated.visitorName}. Checked in successfully.`,
      };
    }

    if (gatePass.status === 'CHECKED_IN') {
      const updated = await this.prisma.gatePass.update({
        where: { id: gatePass.id },
        data: {
          status: 'CHECKED_OUT',
          checkedOut: new Date(),
        },
      });

      return {
        valid: true,
        visitorName: updated.visitorName,
        hostName: updated.hostName,
        purpose: updated.purpose,
        action: 'CHECKOUT',
        checkedOut: updated.checkedOut,
        message: `Goodbye ${updated.visitorName}. Checked out successfully.`,
      };
    }

    return { valid: false, message: 'Invalid gate pass status' };
  }
}
