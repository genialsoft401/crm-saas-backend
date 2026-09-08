const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const ErrorMiddleware = require('./middlewares/ErrorMiddleware');
// const logger = require('./utils/logger');
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
// app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Muitas requisições deste IP, tente novamente mais tarde.' });
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true, swaggerOptions: { persistAuthorization: true } }));
app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use(ErrorMiddleware.notFound);
app.use(ErrorMiddleware.handle);

module.exports = app;