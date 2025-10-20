export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: '24h',
  },
  nfeService: {
    url: process.env.NFE_SERVICE_URL || 'http://localhost:8080',
    apiKey: process.env.NFE_SERVICE_API_KEY || 'sua_api_key_secreta_aqui',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    path: process.env.UPLOAD_PATH || './uploads',
  },
});
