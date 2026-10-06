import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { AppModule } from './app.module';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AppModule', () => {
  it('should apply the logger middleware to all routes', () => {
    const forRoutes = jest.fn();
    const consumer = {
      apply: jest.fn().mockReturnValue({
        forRoutes,
      }),
    } as unknown as MiddlewareConsumer;

    new AppModule().configure(consumer);

    expect(consumer.apply).toHaveBeenCalledWith(LoggerMiddleware);
    expect(forRoutes).toHaveBeenCalledWith({
      path: '*',
      method: RequestMethod.ALL,
    });
  });
});
