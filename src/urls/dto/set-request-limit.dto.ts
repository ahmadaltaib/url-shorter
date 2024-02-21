import { IsNumber, Min } from 'class-validator';

export class SetRequestLimitDto {
  @Min(1)
  @IsNumber()
  limit: number;
}
