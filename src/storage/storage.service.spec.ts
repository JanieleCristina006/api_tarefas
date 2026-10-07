import { HttpStatus } from '@nestjs/common';

const mockSend = jest.fn();
const mockS3ClientConstructor = jest.fn();
const mockPutObjectCommandConstructor = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation((options: unknown) => {
    mockS3ClientConstructor(options);

    return {
      send: mockSend,
    };
  }),
  PutObjectCommand: jest.fn().mockImplementation((input: unknown) => {
    mockPutObjectCommandConstructor(input);

    return input;
  }),
}));

import { StorageService } from './storage.service';

describe('StorageService', () => {
  const originalEnv = {
    AVATAR_BUCKET_NAME: process.env.AVATAR_BUCKET_NAME,
    AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3,
    AWS_REGION: process.env.AWS_REGION,
    STORAGE_PUBLIC_URL: process.env.STORAGE_PUBLIC_URL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AVATAR_BUCKET_NAME = 'files';
    process.env.AWS_ENDPOINT_URL_S3 = 'https://storage.example.com';
    process.env.AWS_REGION = 'us-east-2';
    delete process.env.STORAGE_PUBLIC_URL;
    mockSend.mockResolvedValue({});
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('should upload a file to the configured bucket', async () => {
    const storageService = new StorageService();
    const body = Buffer.from('image');

    const result = await storageService.uploadFile({
      key: 'avatars/1.png',
      body,
      contentType: 'image/png',
    });

    expect(result).toBe('avatars/1.png');
    expect(mockS3ClientConstructor).toHaveBeenCalledWith({
      endpoint: 'https://storage.example.com',
      region: 'us-east-2',
      forcePathStyle: true,
    });
    expect(mockPutObjectCommandConstructor).toHaveBeenCalledWith({
      Bucket: 'files',
      Key: 'avatars/1.png',
      Body: body,
      ContentType: 'image/png',
    });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should build a public file URL from the storage endpoint', () => {
    const storageService = new StorageService();

    expect(storageService.getPublicUrl('avatars/1.png')).toBe(
      'https://storage.example.com/files/avatars/1.png',
    );
  });

  it('should prefer STORAGE_PUBLIC_URL when it is configured', () => {
    process.env.STORAGE_PUBLIC_URL = 'https://cdn.example.com';
    const storageService = new StorageService();

    expect(storageService.getPublicUrl('avatars/1.png')).toBe(
      'https://cdn.example.com/files/avatars/1.png',
    );
  });

  it('should throw a bad request exception when upload fails', async () => {
    const storageService = new StorageService();
    mockSend.mockRejectedValue(new Error('storage error'));

    await expect(
      storageService.uploadFile({
        key: 'avatars/1.png',
        body: Buffer.from('image'),
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
  });
});
