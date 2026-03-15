import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateGatePassDto {
  @IsString()
  @IsNotEmpty()
  visitorName: string;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsString()
  @IsNotEmpty()
  hostName: string;

  @IsDateString()
  expectedDate: string;
}
