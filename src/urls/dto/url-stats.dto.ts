export class UrlStatsDto {
  shortUrl: string;
  accessCount: number;
  lastAccessedAt: Date;
  uniqueUsers: number;
  accessedFrom: string[];
}
