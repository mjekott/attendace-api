import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { KiosksModule } from './kiosks/kiosks.module';
import { UsersModule } from './users/users.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { AttendanceModule } from './attendance/attendance.module';
import { VisitorsModule } from './visitors/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    KiosksModule,
    UsersModule,
    EmbeddingsModule,
    AttendanceModule,
    VisitorsModule,
  ],
})
export class AppModule {}
