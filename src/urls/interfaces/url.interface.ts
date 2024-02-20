export interface Url {
  id?: string;
  longUrl: string;
  shortUrl: string;
  createdAt: Date;
  stats: {
    accessCount: number;
    uniqueUsers: number;
    accessedFrom: string[];
    lastAccessedAt: Date;
  };
}
