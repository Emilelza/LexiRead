require('dotenv').config();

const requiredVars = ['GROK_API_KEY'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  openai: {
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 4096,
  },
  upload: {
    maxFileSizeMb: 10,
    allowedMimeTypes: [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  rateLimit: {
    windowMs: 60 * 1000,
    max: 30,
  },
};