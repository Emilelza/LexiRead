require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const simplifyRoute = require('./routes/simplifyRoute');
const studyRoute = require('./routes/studyRoute');
const explainRoute = require('./routes/explainRoute');
const chatRoute = require('./routes/chatRoute');
const uploadRoute = require('./routes/uploadRoute');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts')));

app.use('/api', apiLimiter);
app.use('/api', simplifyRoute);
app.use('/api', studyRoute);
app.use('/api', explainRoute);
app.use('/api', chatRoute);
app.use('/api', uploadRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'landing.html'));
});
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`\n🚀 LexiRead running at http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
});

module.exports = app;