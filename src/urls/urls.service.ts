import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from './interfaces/url.interface';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlStatsDto } from './dto/url-stats.dto';
import { SetRequestLimitDto } from './dto/set-request-limit.dto';
import { SetAliasDto } from './dto/set-alias.dto';

@Injectable()
export class UrlsService {
  constructor(@InjectModel('Url') private readonly urlModel: Model<Url>) {}

  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    let { longUrl, alias, requestLimit } = createUrlDto;

    const shortUrl = await this.generateShortUrl(alias);
    alias = alias ?? shortUrl;
    const newUrl = new this.urlModel({
      longUrl,
      shortUrl,
      alias,
      requestLimit,
    });

    return await newUrl.save();
  }

  async generateShortUrl(alias: string): Promise<string> {
    if (alias != null && (await this.urlModel.findOne({ alias }).exec())) {
      throw new ConflictException('URL alias already exists');
    }

    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6; // Get the length from configuration
    let shortUrl = '';

    do {
      // Generate random short URL
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortUrl += characters.charAt(randomIndex);
      }

      // Check if the generated short URL already exists
      const existingUrl = await this.urlModel.findOne({ shortUrl }).exec();
      if (existingUrl == null) {
        // Short URL is unique
        return shortUrl;
      }

      // Reset shortUrl if it already exists
      shortUrl = '';
    } while (true);
  }

  async redirect(shortUrl: string, ip: string): Promise<Url> {
    let uniqueUsers = 0;
    const filter: any = {
      $or: [{ shortUrl }, { alias: shortUrl }],
    };

    const url = await this.urlModel.findOne(filter);

    if (url) {
      if (url.isActiveLink == false) {
        throw new HttpException(
          'Requested URL has been deleted',
          HttpStatus.MOVED_PERMANENTLY,
        );
      } else if (url.requestLimit <= url.stats.accessCount) {
        throw new HttpException(
          'Requested URL access limit is consumed',
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else if (!url.stats.accessedFrom.includes(ip)) {
        uniqueUsers = 1;
      }

      return this.urlModel.findOneAndUpdate(
        filter,
        {
          $inc: { 'stats.accessCount': 1, 'stats.uniqueUsers': uniqueUsers },
          $addToSet: { 'stats.accessedFrom': ip },
          $set: { 'stats.lastAccessedAt': new Date() },
        },
        { new: true },
      );
    } else {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }
  }

  async getUrlStats(): Promise<UrlStatsDto[]> {
    const urls = await this.urlModel.find({ isActiveLink: true }).exec();

    return urls.map((url) => ({
      shortUrl: url.shortUrl,
      alias: url.alias,
      lastAccessedAt: url.stats.lastAccessedAt,
      accessCount: url.stats.accessCount,
      uniqueUsers: url.stats.uniqueUsers,
      accessedFrom: url.stats.accessedFrom,
    }));
  }

  async setAlias(shortUrl: string, setAliasDto: SetAliasDto): Promise<Url> {
    const url = await this.urlModel.findOne({ shortUrl, isActiveLink: true });
    if (!url) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }

    const { alias } = setAliasDto;
    if (alias != null && (await this.urlModel.findOne({ alias }).exec())) {
      throw new HttpException('URL alias already exists', HttpStatus.CONFLICT);
    }

    url.alias = setAliasDto.alias;
    return await url.save();
  }

  async setRequestLimit(
    shortUrl: string,
    setRequestLimitDto: SetRequestLimitDto,
  ): Promise<Url> {
    const url = await this.urlModel.findOne({ shortUrl, isActiveLink: true });

    if (!url) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    } else if (url.stats.accessCount > setRequestLimitDto.limit) {
      throw new HttpException(
        'URL requests count is higher than this limit',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    url.requestLimit = setRequestLimitDto.limit;
    return await url.save();
  }

  async deleteUrl(shortUrl: string) {
    const url = await this.urlModel.findOneAndUpdate(
      { shortUrl, isActiveLink: true },
      { isActive: false },
      { new: true },
    );
    if (!url) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'URL have been deleted' };
  }
}
