import { IsString, Validate } from 'class-validator';
import { IsUniqueAlias } from '../validators/custom-validators';

export class CreateUrlDto {
  @IsString()
  readonly longUrl: string;

  @Validate(IsUniqueAlias)
  alias?: string;

  requestLimit?: number;
}
