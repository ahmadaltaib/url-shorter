import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Url } from '../interfaces/url.interface';
import { Model } from 'mongoose';

@ValidatorConstraint({ name: 'IsUniqueAlias', async: false })
@Injectable()
export class IsUniqueAlias implements ValidatorConstraintInterface {
  constructor(private readonly urlModel: Model<Url>) {}
  async validate(createUrlDto: any) {
    const { alias } = createUrlDto;
    const existingUrl = await this.urlModel.findOne({ alias }).exec();
    return !existingUrl;
  }
  defaultMessage() {
    return 'Alias must be unique';
  }
}
