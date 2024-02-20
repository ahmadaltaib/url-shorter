import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Redirect,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlStatsDto } from './dto/url-stats.dto';
import { Request } from 'express';

@ApiTags('URLs module')
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiCreatedResponse({
    description: 'The shortened URL has been successfully created.',
  })
  @ApiBody({
    type: CreateUrlDto,
    examples: {
      example1: {
        value: { longUrl: 'https://example.com' },
        description: 'Example of a long URL',
      },
    },
  })
  @Post()
  async create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlsService.create(createUrlDto);
  }

  @ApiOperation({ summary: 'Get URL Statistics' })
  @ApiResponse({
    status: 200,
    description: 'List of URLs along with their statistics',
  })
  @Get('/stats')
  async getUrlStats(): Promise<UrlStatsDto[]> {
    return this.urlsService.getUrlStats();
  }

  @Get(':shortUrl')
  @Redirect()
  @ApiParam({ name: 'shortUrl', description: 'Short URL to be redirected' })
  @ApiResponse({
    status: 301,
    description: 'Redirect to the original long URL',
  })
  @ApiNotFoundResponse({ description: 'Short URL not found' })
  @ApiOperation({ summary: 'Request shorten URL' })
  async redirect(@Param('shortUrl') shortUrl: string, @Req() request: Request) {
    const url = await this.urlsService.redirect(shortUrl, request.ip);
    if (!url) {
      throw new HttpException('Short URL not found', HttpStatus.NOT_FOUND);
    }
    return { url: url.longUrl, statusCode: 301 };
  }
}
