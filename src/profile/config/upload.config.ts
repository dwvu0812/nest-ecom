import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { PROFILE_UPLOAD_CONFIG } from '../constants/profile.constants';

// Avatar upload configuration
export const avatarUploadConfig = {
  storage: diskStorage({
    destination: PROFILE_UPLOAD_CONFIG.UPLOAD_PATH,
    filename: (
      req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      // Extract user ID from JWT token
      const userId = req.user?.id;
      const timestamp = Date.now();
      const ext = extname(file.originalname);
      const fileName = `avatar-${userId}-${timestamp}${ext}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: PROFILE_UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 1, // Single avatar file only
  },
  fileFilter: (
    req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Check file type
    if (!file.mimetype.match(PROFILE_UPLOAD_CONFIG.ALLOWED_FILE_TYPES)) {
      return cb(
        new BadRequestException(
          'Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed.',
        ),
        false,
      );
    }

    // Additional security check - verify MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new BadRequestException('Invalid file type detected.'), false);
    }

    cb(null, true);
  },
};
