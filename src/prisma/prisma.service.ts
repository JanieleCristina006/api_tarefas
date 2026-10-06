import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.cjs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
   [x: string]: any;
   constructor(){
      const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL!})
      super({adapter});
   }
 }
