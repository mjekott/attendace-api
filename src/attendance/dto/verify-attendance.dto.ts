import {
  IsArray,
  IsEnum,
  ArrayMinSize,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AttendanceAction {
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
}

export class VerifyAttendanceDto {
  @IsString()
  employeeId: string;

  @IsArray()
  @ArrayMinSize(1)
  embedding: number[];

  @IsOptional()
  @IsEnum(AttendanceAction)
  action?: AttendanceAction;
}
