const mockAdapter = {
  name: 'sqlite-adapter',
};
const mockPrismaClientConstructor = jest.fn();
const mockPrismaBetterSqlite3Constructor = jest.fn();

jest.mock(
  '../../generated/prisma/client.cjs',
  () => ({
    PrismaClient: class PrismaClient {
      constructor(options: unknown) {
        mockPrismaClientConstructor(options);
      }
    },
  }),
  { virtual: true },
);

jest.mock('@prisma/adapter-better-sqlite3', () => ({
  PrismaBetterSqlite3: jest.fn().mockImplementation((options: unknown) => {
    mockPrismaBetterSqlite3Constructor(options);
    return mockAdapter;
  }),
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'file:test.db';
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('should create the prisma client with the sqlite adapter', () => {
    const prismaService = new PrismaService();

    expect(prismaService).toBeInstanceOf(PrismaService);
    expect(mockPrismaBetterSqlite3Constructor).toHaveBeenCalledWith({
      url: 'file:test.db',
    });
    expect(mockPrismaClientConstructor).toHaveBeenCalledWith({
      adapter: mockAdapter,
    });
  });
});
