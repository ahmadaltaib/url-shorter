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
  Delete,
  Patch,
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
import { SetAliasDto } from './dto/set-alias.dto';
import { SetRequestLimitDto } from './dto/set-request-limit.dto';

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
        value: {
          longUrl: 'https://example.com',
          alias: 'dummy',
          requestLimit: 10,
        },
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

  @Patch(':shortUrl/alias')
  @ApiOperation({ summary: 'Set an alias for a short URL' })
  @ApiParam({ name: 'shortUrl', description: 'Short URL to set the alias for' })
  @ApiBody({
    type: SetAliasDto,
    examples: {
      example1: {
        value: {
          alias: 'dummy',
        },
        description: 'Example of dummy alias',
      },
    },
  })
  async setAlias(
    @Param('shortUrl') shortUrl: string,
    @Body() setAliasDto: SetAliasDto,
  ) {
    return this.urlsService.setAlias(shortUrl, setAliasDto);
  }

  @Patch(':shortUrl/request-limit')
  @ApiOperation({ summary: 'Set a request limit for a short URL' })
  @ApiParam({
    name: 'shortUrl',
    description: 'Short URL to set the request limit for',
  })
  @ApiBody({
    type: SetRequestLimitDto,
    examples: {
      example1: {
        value: {
          requestLimit: 10,
        },
        description: 'Example of a requestLimit',
      },
    },
  })
  async setRequestLimit(
    @Param('shortUrl') shortUrl: string,
    @Body() setRequestLimitDto: SetRequestLimitDto,
  ) {
    return this.urlsService.setRequestLimit(shortUrl, setRequestLimitDto);
  }

  @Delete(':shortUrl')
  @ApiOperation({ summary: 'Delete a short URL' })
  @ApiParam({ name: 'shortUrl', description: 'Short URL to delete' })
  async deleteUrl(@Param('shortUrl') shortUrl: string) {
    return this.urlsService.deleteUrl(shortUrl);
  }

  @Get(':shortUrl')
  @ApiResponse({
    status: 301,
    description: 'Redirect to the original long URL',
  })
  @ApiNotFoundResponse({ description: 'Short URL not found or deleted' })
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiParam({ name: 'shortUrl', description: 'Short URL to be redirected' })
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string, @Req() request: Request) {
    const url = await this.urlsService.redirect(shortUrl, request.ip);
    if (!url) {
      throw new HttpException('Short URL not found', HttpStatus.NOT_FOUND);
    } else if (!url.isActiveLink) {
      throw new HttpException(
        'Requested URL has been deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return { url: url.longUrl, statusCode: 301 };
  }
}
