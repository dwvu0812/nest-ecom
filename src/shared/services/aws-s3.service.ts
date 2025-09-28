import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { awsConfig } from '../config';
import { UploadCategory } from '../../uploads/constants/upload.constants';

@Injectable()
export class AwsS3Service implements OnModuleInit {
  private readonly logger = new Logger(AwsS3Service.name);
  private s3Client: S3;

  onModuleInit() {
    if (awsConfig.useS3) {
      this.initializeS3Client();
    }
  }

  private initializeS3Client(): void {
    try {
      this.s3Client = new S3({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
        region: awsConfig.region,
      });

      this.logger.log('AWS S3 client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AWS S3 client:', error);
      throw new Error('AWS S3 initialization failed');
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    fileBuffer: Buffer,
    key: string,
    contentType: string,
    category: UploadCategory,
  ): Promise<S3.ManagedUpload.SendData> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const uploadParams: S3.PutObjectRequest = {
      Bucket: awsConfig.s3.bucket!,
      Key: this.generateS3Key(key, category),
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly readable
    };

    try {
      const result = await this.s3Client.upload(uploadParams).promise();
      this.logger.log(`File uploaded to S3: ${result.Key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`, error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string, category: UploadCategory): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const deleteParams: S3.DeleteObjectRequest = {
      Bucket: awsConfig.s3.bucket!,
      Key: this.generateS3Key(key, category),
    };

    try {
      await this.s3Client.deleteObject(deleteParams).promise();
      this.logger.log(`File deleted from S3: ${deleteParams.Key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from S3: ${error.message}`,
        error,
      );
      throw new Error(`S3 deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteFiles(keys: string[], category: UploadCategory): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const s3Keys = keys.map((key) => this.generateS3Key(key, category));

    const deleteParams: S3.DeleteObjectsRequest = {
      Bucket: awsConfig.s3.bucket!,
      Delete: {
        Objects: s3Keys.map((Key) => ({ Key })),
        Quiet: false,
      },
    };

    try {
      const result = await this.s3Client.deleteObjects(deleteParams).promise();
      this.logger.log(`Deleted ${result.Deleted?.length || 0} files from S3`);

      if (result.Errors && result.Errors.length > 0) {
        this.logger.warn(
          `Some files failed to delete: ${JSON.stringify(result.Errors)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete multiple files from S3: ${error.message}`,
        error,
      );
      throw new Error(`S3 bulk deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file URL from S3
   */
  getFileUrl(key: string, category: UploadCategory): string {
    if (!awsConfig.s3.bucket) {
      throw new Error('S3 bucket not configured');
    }

    const s3Key = this.generateS3Key(key, category);
    return `https://${awsConfig.s3.bucket}.s3.${awsConfig.region}.amazonaws.com/${s3Key}`;
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(
    key: string,
    category: UploadCategory,
    expiresIn = 3600,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const params = {
      Bucket: awsConfig.s3.bucket!,
      Key: this.generateS3Key(key, category),
      Expires: expiresIn,
    };

    try {
      return await this.s3Client.getSignedUrlPromise('getObject', params);
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL: ${error.message}`,
        error,
      );
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Check if S3 is enabled
   */
  isS3Enabled(): boolean {
    return awsConfig.useS3;
  }

  /**
   * Generate S3 key with category prefix
   */
  private generateS3Key(filename: string, category: UploadCategory): string {
    // Use category as folder structure in S3
    return `uploads/${category}/${filename}`;
  }

  /**
   * Create presigned URL for direct upload from client
   */
  async createPresignedUploadUrl(
    key: string,
    contentType: string,
    category: UploadCategory,
    expiresIn = 3600,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const params = {
      Bucket: awsConfig.s3.bucket!,
      Key: this.generateS3Key(key, category),
      ContentType: contentType,
      Expires: expiresIn,
    };

    try {
      return await this.s3Client.getSignedUrlPromise('putObject', params);
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL: ${error.message}`,
        error,
      );
      throw new Error(
        `Failed to generate presigned upload URL: ${error.message}`,
      );
    }
  }
}
