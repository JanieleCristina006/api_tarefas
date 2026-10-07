import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type UploadFileParams = {
  key: string;
  body: Buffer;
  contentType?: string;
};

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.AVATAR_BUCKET_NAME ?? 'files';

    this.client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION ?? 'us-east-2',
      forcePathStyle: true,
    });
  }

  async uploadFile({ key, body, contentType }: UploadFileParams) {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );

      return key;
    } catch {
      throw new HttpException(
        'Falha ao enviar arquivo para o storage!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getPublicUrl(key: string) {
    const baseUrl = process.env.STORAGE_PUBLIC_URL ?? process.env.AWS_ENDPOINT_URL_S3;

    if (!baseUrl) {
      return key;
    }

    return `${baseUrl.replace(/\/$/, '')}/${this.bucketName}/${key}`;
  }
}
