import { IsString, IsNotEmpty, Validate } from 'class-validator';
import { IsUniqueAlias } from '../validators/custom-validators';

export class SetAliasDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsUniqueAlias)
  alias: string;
}
