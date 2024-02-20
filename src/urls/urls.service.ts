import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from './interfaces/url.interface';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlStatsDto } from './dto/url-stats.dto';

@Injectable()
export class UrlsService {
  constructor(@InjectModel('Url') private readonly urlModel: Model<Url>) {}

  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    const { longUrl } = createUrlDto;
    const shortUrl = await this.generateShortUrl();
    const newUrl = new this.urlModel({ longUrl, shortUrl });
    return await newUrl.save();
  }

  async redirect(shortUrl: string, ip: string): Promise<Url> {
    let uniqueUsers = 0;
    const filter: any = { shortUrl, 'stats.accessedFrom': ip };
    let url = await this.urlModel.findOne(filter);

    if (!url) {
      delete filter['stats.accessedFrom'];
      url = await this.urlModel.findOne(filter);
      uniqueUsers = 1;
    }

    if (url) {
      // If the document exists, update it
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
      throw new NotFoundException('URL not found');
    }
  }

  async getUrlStats(): Promise<UrlStatsDto[]> {
    const urls = await this.urlModel.find().exec();

    return urls.map((url) => ({
      shortUrl: url.shortUrl,
      lastAccessedAt: url.stats.lastAccessedAt,
      accessCount: url.stats.accessCount,
      uniqueUsers: url.stats.uniqueUsers,
      accessedFrom: url.stats.accessedFrom,
    }));
  }

  async findByShortUrl(shortUrl: string) {
    return this.urlModel.findOne({ shortUrl }).exec();
  }

  async generateShortUrl(): Promise<string> {
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
      const existingUrl = await this.findByShortUrl(shortUrl);
      if (existingUrl != null) {
        shortUrl = '';
      }
    } while (!shortUrl);

    return shortUrl;
  }
}
