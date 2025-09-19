// Shared Data Transfer Objects (DTOs)
export class BaseDto {
  // Add base DTO properties here
}

export class PaginationDto {
  page?: number;
  limit?: number;
}

export class ResponseDto<T> {
  data: T;
  message?: string;
  success: boolean;
}
