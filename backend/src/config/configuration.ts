export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'securevault',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'securevault-access-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'securevault-refresh-secret-key',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  bcrypt: {
    saltRounds: 12,
  },
  throttler: {
    ttl: 60000,
    limit: 100,
  },
  lockout: {
    maxAttempts: 5,
    windowMinutes: 10,
    durationMinutes: 15,
  },
});
