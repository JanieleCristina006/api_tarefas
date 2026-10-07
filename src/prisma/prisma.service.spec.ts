const mockAdapter = {
  name: 'neon-adapter',
};
const mockPrismaClientConstructor = jest.fn();
const mockPrismaNeonConstructor = jest.fn();

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

jest.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: jest.fn().mockImplementation((options: unknown) => {
    mockPrismaNeonConstructor(options);
    return mockAdapter;
  }),
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('should create the prisma client with the Neon adapter', () => {
    const prismaService = new PrismaService();

    expect(prismaService).toBeInstanceOf(PrismaService);
    expect(mockPrismaNeonConstructor).toHaveBeenCalledWith({
      connectionString: 'postgres://test:test@localhost:5432/test',
    });
    expect(mockPrismaClientConstructor).toHaveBeenCalledWith({
      adapter: mockAdapter,
    });
  });
});
