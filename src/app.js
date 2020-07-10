require('dotenv').config();
const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  helmet = require('helmet');

const bookmarksRouter = require('./bookmarks-router'),
  logger = require('./logger'),
  { NODE_ENV } = require('./config');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app
  .use(morgan(morganOption))
  .use(helmet())
  .use(cors())
  .use(express.json())
  .use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      logger.error(`Unauthorized request to path: ${req.path}`);
      return res.status(401).json({ error: 'Unauthorized request' });
    }
    // move to the next middleware
    next();
  })
  .use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' } };
    } else {
      console.error(error);
      response = { message: error.message, error };
    }
    res.status(500).json(response);
  })
  .use(bookmarksRouter);

module.exports = app;
