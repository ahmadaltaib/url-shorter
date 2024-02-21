import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from '../src/urls/urls.controller';
import { UrlsService } from '../src/urls/urls.service';
import { UrlStatsDto } from '../src/urls/dto/url-stats.dto';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlSchema } from '../src/urls/schemas/url.schema';
import { CreateUrlDto } from '../src/urls/dto/create-url.dto';
import { Url } from 'src/urls/interfaces/url.interface';
import { SetAliasDto } from '../src/urls/dto/set-alias.dto';
import { SetRequestLimitDto } from '../src/urls/dto/set-request-limit.dto';
import { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: 'mongodb://localhost:27017/test',
          }),
        }),
        MongooseModule.forFeature([{ name: 'Url', schema: UrlSchema }]),
      ],
      controllers: [UrlsController],
      providers: [UrlsService],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a shortened URL', async () => {
    const createUrlDto: CreateUrlDto = {
      longUrl: 'https://example.com',
      alias: 'dummy',
      requestLimit: 10,
    };
    const expectedResult: Url = {
      longUrl: 'https://example.com',
      shortUrl: 'shortened-url',
      createdAt: new Date(),
      stats: {
        accessCount: 0,
        uniqueUsers: 0,
        accessedFrom: [],
        lastAccessedAt: new Date(),
      },
      isActiveLink: true,
    };
    jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

    const result = await controller.create(createUrlDto);

    expect(result).toEqual(expectedResult);
  });

  describe('create', () => {
    it('should return a shortened URL', async () => {
      const createUrlDto: CreateUrlDto = {
        longUrl: 'https://example.com',
        alias: 'dummy',
        requestLimit: 10,
      };
      const expectedResult: Url = {
        longUrl: 'https://example.com',
        shortUrl: 'shortened-url',
        createdAt: new Date(),
        stats: {
          accessCount: 0,
          uniqueUsers: 0,
          accessedFrom: [],
          lastAccessedAt: null,
        },
        isActiveLink: true,
      };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createUrlDto);

      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if invalid data is provided', async () => {
      const createUrlDto: CreateUrlDto = {
        longUrl: '',
        alias: '',
        requestLimit: -1,
      };

      await expect(controller.create(createUrlDto)).rejects.toThrow();
    });
  });

  describe('getUrlStats', () => {
    it('should return URL statistics', async () => {
      const expectedResult: UrlStatsDto[] = []; // Modify with expected result from service
      jest.spyOn(service, 'getUrlStats').mockResolvedValue(expectedResult);

      const result = await controller.getUrlStats();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('setAlias', () => {
    it('should set an alias for a short URL', async () => {
      const shortUrl = 'shortened-url';
      const setAliasDto: SetAliasDto = { alias: 'dummy' };
      const expectedResult: Url = {
        longUrl: 'https://example.com',
        shortUrl: 'shortened-url',
        alias: 'dummy',
        createdAt: new Date(),
        stats: {
          accessCount: 0,
          uniqueUsers: 0,
          accessedFrom: [],
          lastAccessedAt: null,
        },
        isActiveLink: true,
      };
      jest.spyOn(service, 'setAlias').mockResolvedValue(expectedResult);

      const result = await controller.setAlias(shortUrl, setAliasDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('setRequestLimit', () => {
    it('should set a request limit for a short URL', async () => {
      const shortUrl = 'shortened-url';
      const setRequestLimitDto: SetRequestLimitDto = { limit: 10 };
      const expectedResult: Url = {
        longUrl: 'https://example.com',
        shortUrl: 'shortened-url',
        alias: 'dummy',
        createdAt: new Date(),
        requestLimit: 10,
        stats: {
          accessCount: 0,
          uniqueUsers: 0,
          accessedFrom: [],
          lastAccessedAt: null,
        },
        isActiveLink: true,
      };
      jest.spyOn(service, 'setRequestLimit').mockResolvedValue(expectedResult);

      const result = await controller.setRequestLimit(
        shortUrl,
        setRequestLimitDto,
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteUrl', () => {
    it('should delete a short URL', async () => {
      const shortUrl = 'shortened-url';
      const expectedResult = { message: 'Short URL deleted' };
      jest.spyOn(service, 'deleteUrl').mockResolvedValue(expectedResult);

      const result = await controller.deleteUrl(shortUrl);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('redirect', () => {
    it('should redirect to the original URL', async () => {
      const shortUrl = 'shortened-url';
      const request = { ip: '127.0.0.1' } as Request;
      const expectedResult: Url = {
        longUrl: 'https://example.com',
        shortUrl: 'shortened-url',
        alias: 'dummy',
        createdAt: new Date(),
        stats: {
          accessCount: 0,
          uniqueUsers: 0,
          accessedFrom: [],
          lastAccessedAt: null,
        },
        isActiveLink: true,
      };
      jest.spyOn(service, 'redirect').mockResolvedValue(expectedResult);

      const result = await controller.redirect(shortUrl, request);

      expect(result).toEqual({ url: expectedResult.longUrl, statusCode: 301 });
    });

    it('should throw 404 error if short URL not found', async () => {
      const shortUrl = 'invalid-url';
      const request = { ip: '127.0.0.1' } as Request;
      jest.spyOn(service, 'redirect').mockResolvedValue(null);

      await expect(controller.redirect(shortUrl, request)).rejects.toThrowError(
        new HttpException('Short URL not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw 404 error if short URL is inactive', async () => {
      const shortUrl = 'inactive-url';
      const request = { ip: '127.0.0.1' } as Request;
      const expectedResult: Url = {
        longUrl: 'https://example.com',
        shortUrl: 'shortened-url',
        alias: 'dummy',
        createdAt: new Date(),
        stats: {
          accessCount: 0,
          uniqueUsers: 0,
          accessedFrom: [],
          lastAccessedAt: null,
        },
        isActiveLink: false,
      };
      jest.spyOn(service, 'redirect').mockResolvedValue(expectedResult);

      await expect(controller.redirect(shortUrl, request)).rejects.toThrowError(
        new HttpException(
          'Requested URL has been deleted',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
