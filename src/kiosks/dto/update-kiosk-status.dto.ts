import { IsIn } from 'class-validator';

export class UpdateKioskStatusDto {
  @IsIn(['online', 'offline'])
  status: 'online' | 'offline';
}
