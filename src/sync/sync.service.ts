import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface QueuedRecord {
  type: 'ATTENDANCE' | 'VISITOR';
  employeeId?: string;
  accessCode?: string;
  action: 'CHECKIN' | 'CHECKOUT';
  timestamp: string;
  confidence?: number;
}

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayGatePasses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.gatePass.findMany({
      where: {
        expectedDate: { gte: today, lt: tomorrow },
      },
      select: {
        accessCode: true,
        visitorName: true,
        hostName: true,
        purpose: true,
        status: true,
        expectedDate: true,
        checkedIn: true,
        checkedOut: true,
      },
    });
  }

  async processQueue(records: QueuedRecord[], kioskId: string) {
    const results: { index: number; success: boolean; error?: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        if (record.type === 'ATTENDANCE' && record.employeeId) {
          await this.processAttendanceRecord(record, kioskId);
        } else if (record.type === 'VISITOR' && record.accessCode) {
          await this.processVisitorRecord(record, kioskId);
        }
        results.push({ index: i, success: true });
      } catch (error: any) {
        results.push({ index: i, success: false, error: error.message });
      }
    }

    return {
      processed: results.filter((r) => r.success).length,
      errors: results.filter((r) => !r.success),
    };
  }

  private async processAttendanceRecord(record: QueuedRecord, kioskId: string) {
    const user = await this.prisma.user.findUnique({
      where: { employeeId: record.employeeId },
    });

    if (!user) throw new Error(`User ${record.employeeId} not found`);

    const timestamp = new Date(record.timestamp);
    const today = new Date(timestamp);
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });

    if (record.action === 'CHECKIN') {
      if (!existing) {
        await this.prisma.attendance.create({
          data: {
            userId: user.id,
            kioskId,
            date: today,
            checkedIn: timestamp,
          },
        });
      }
    } else if (record.action === 'CHECKOUT' && existing) {
      await this.prisma.attendance.update({
        where: { id: existing.id },
        data: { checkedOut: timestamp },
      });
    }
  }

  private async processVisitorRecord(record: QueuedRecord, kioskId: string) {
    const gatePass = await this.prisma.gatePass.findUnique({
      where: { accessCode: record.accessCode!.toUpperCase() },
    });

    if (!gatePass) throw new Error(`Gate pass ${record.accessCode} not found`);

    const timestamp = new Date(record.timestamp);

    if (record.action === 'CHECKIN' && gatePass.status === 'PENDING') {
      await this.prisma.gatePass.update({
        where: { id: gatePass.id },
        data: { status: 'CHECKED_IN', checkedIn: timestamp, kioskId },
      });
    } else if (record.action === 'CHECKOUT' && gatePass.status === 'CHECKED_IN') {
      await this.prisma.gatePass.update({
        where: { id: gatePass.id },
        data: { status: 'CHECKED_OUT', checkedOut: timestamp },
      });
    }
  }
}
