import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async verify(dto: VerifyAttendanceDto, kioskId: string) {
    const match = await this.embeddingsService.findMatchForUser(
      dto.embedding,
      dto.employeeId,
    );

    if (!match.matched || !match.userId) {
      return {
        matched: false,
        message: 'Face does not match the provided employee ID',
      };
    }

    // Auto-close any past days' open records (forgot to check out)
    await this.autoClosePastRecords(match.userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: match.userId,
          date: today,
        },
      },
    });

    // No record today → CHECKIN
    if (!existingAttendance) {
      const attendance = await this.prisma.attendance.create({
        data: {
          userId: match.userId,
          kioskId,
          date: today,
          checkedIn: new Date(),
        },
      });

      return {
        matched: true,
        userId: match.userId,
        userName: match.userName,
        confidence: match.confidence,
        action: 'CHECKIN',
        checkedIn: attendance.checkedIn,
        message: 'Checked in successfully',
      };
    }

    // Checked in but not out → CHECKOUT
    // Already checked out → update checkout timestamp (came back and leaving again)
    const attendance = await this.prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { checkedOut: new Date() },
    });

    return {
      matched: true,
      userId: match.userId,
      userName: match.userName,
      confidence: match.confidence,
      action: 'CHECKOUT',
      checkedOut: attendance.checkedOut,
      message: 'Checked out successfully',
    };
  }

  /**
   * Auto-close any past attendance records where user forgot to check out.
   * Sets checkedOut to end of that day (23:59:59) and status to INCOMPLETE.
   */
  private async autoClosePastRecords(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openRecords = await this.prisma.attendance.findMany({
      where: {
        userId,
        checkedOut: null,
        date: { lt: today },
      },
    });

    for (const record of openRecords) {
      const endOfDay = new Date(record.date);
      endOfDay.setHours(23, 59, 59, 999);

      await this.prisma.attendance.update({
        where: { id: record.id },
        data: {
          checkedOut: endOfDay,
          status: 'INCOMPLETE',
        },
      });
    }
  }

  async findAll(query: { date?: string; kioskId?: string }) {
    const where: Record<string, unknown> = {};

    if (query.date) {
      const date = new Date(query.date);
      date.setHours(0, 0, 0, 0);
      where.date = date;
    }

    if (query.kioskId) {
      where.kioskId = query.kioskId;
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        kiosk: { select: { id: true, name: true, location: true } },
      },
      orderBy: { checkedIn: 'desc' },
    });
  }
}
