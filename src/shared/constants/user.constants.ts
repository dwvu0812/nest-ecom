export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  PENDING: 'PENDING',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_DEFAULTS = {
  SEARCH_LIMIT: 10,
  PAGINATION_LIMIT: 20,
} as const;

export const USER_RESOURCE_NAMES = {
  DEFAULT_USER_ROLE: 'Default user role',
  USER: 'User',
} as const;
