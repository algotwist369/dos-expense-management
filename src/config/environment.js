// Environment configuration
const config = {
  // API Configuration
  API_BASE_URL: 'https://expense.d0s369.co.in/api' || 'https://dos.adminspaadvisor.in/api' || 'http://localhost:5000/api',

  // Auth endpoints
  AUTH_BASE_URL: 'https://expense.d0s369.co.in/api/auth' || 'https://dos.adminspaadvisor.in/auth' || 'http://localhost:5000/api/auth',

  // Feature flags
  ENABLE_ANALYTICS: true,
  ENABLE_GOOGLE_ADS: true,

  // App configuration
  APP_NAME: 'DOS Daily Expenses',
  VERSION: '1.0.0',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

  // Local storage keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER_ID: 'userId',
    ROLE: 'role',
    NAME: 'name',
    THEME: 'theme'
  }
};

export default config; 