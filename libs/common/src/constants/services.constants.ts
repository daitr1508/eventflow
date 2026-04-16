export const SERVICES = {
  API_GATEWAY: 'api-gateway',
  AUTH_SERVICE: 'auth-service',
  NOTIFICATIONS_SERVICE: 'notifications-service',
} as const;

export const SERVICES_PORTS = {
  API_GATEWAY: 3001,
  AUTH_SERVICE: 3002,
  NOTIFICATIONS_SERVICE: 3003,
} as const;
