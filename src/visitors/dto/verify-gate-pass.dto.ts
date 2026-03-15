import { IsString, Length } from 'class-validator';

export class VerifyGatePassDto {
  @IsString()
  @Length(6, 6)
  accessCode: string;
}
