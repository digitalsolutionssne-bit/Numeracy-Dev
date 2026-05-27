// ==========================================
// config.js - Application Configuration
// ==========================================
// ENVIRONMENT TOGGLE
// Options: 'Exp' (Experimental) | 'Dev' (Development) | 'Prod' (Production)
const ENV = 'Exp';

// ENVIRONMENT API ENDPOINTS (Google Apps Script Web App URLs)
const EXP_URL = 'https://script.google.com/macros/s/AKfycbw6E26vK0BKSvnje3BZKWhikeEsj0GGC3stHVuob6Lx7h6n7CXf5fXG7Wg0LOJ5ugTKDw/exec';
const DEV_URL = 'https://script.google.com/macros/s/AKfycbyBV9vBOLiHHe-Defjzkhf6g7xXw979RGEp-kl-h_teOUUpcL-R-YZWtbSQHPEgvFlRcg/exec';
const PROD_URL = 'https://script.google.com/macros/s/AKfycbwECIelwQpWq-bVniCpHgLqQlBGA0lGzPsN--4xBVoGQUbJsQT18b6zi8F00UMV2mpG/exec';

const API_URL = ENV === 'Exp' ? EXP_URL : (ENV === 'Dev' ? DEV_URL : PROD_URL);