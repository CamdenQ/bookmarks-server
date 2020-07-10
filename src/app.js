require('dotenv').config();
const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  helmet = require('helmet'),
  { NODE_ENV } = require('./config'),
  uuid = require('uuid'),
  winston = require('winston');

const app = express();

let valid = true;

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [new winston.transports.File({ filename: 'info.log' })],
// });

// if (NODE_ENV !== 'production') {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }

const bookmarks = [
  {
    id: '1',
    title: 'First Bookmark',
    url: 'https://test.bookmark.com',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales auctor arcu et mollis. Donec a interdum elit. Maecenas et tellus libero. Maecenas consectetur vulputate leo, et interdum arcu molestie ut. Quisque aliquet, arcu at fringilla consectetur, velit sem sagittis nunc, vel semper ipsum sem a neque. Vestibulum porta vehicula ligula, quis ullamcorper neque convallis a. Duis egestas enim a ligula fringilla iaculis. Ut rutrum viverra fermentum. Proin molestie justo facilisis neque interdum feugiat. Donec ultrices mollis feugiat. ',
    rating: 4,
  },
  {
    id: '2',
    title: 'Second Bookmark',
    url: 'https://test.bookmark.com',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales auctor arcu et mollis. Donec a interdum elit. Maecenas et tellus libero. Maecenas consectetur vulputate leo, et interdum arcu molestie ut. Quisque aliquet, arcu at fringilla consectetur, velit sem sagittis nunc, vel semper ipsum sem a neque. Vestibulum porta vehicula ligula, quis ullamcorper neque convallis a. Duis egestas enim a ligula fringilla iaculis. Ut rutrum viverra fermentum. Proin molestie justo facilisis neque interdum feugiat. Donec ultrices mollis feugiat. ',
    rating: 3,
  },
];

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
  });

app.get('/bookmarks', (req, res) => {
  res.json(bookmarks);
});

app.get('/bookmarks/:id', (req, res) => {
  const { id } = req.params,
    bookmark = bookmarks.find((b) => b.id == id);

  if (!bookmark) {
    return res.status(404).send('Card Not Found');
  }

  res.json(bookmark);
});

app.post('/bookmarks', (req, res) => {
  const { title, url, rating, description = '' } = req.headers;
  console.log(req);

  if (!title) {
    // valid = false;
    return res.status(400).send('Invalid title');
  }

  if (!url || typeof url !== 'string' || !url.includes('http')) {
    valid = false;
    return res.status(400).send('Invalid url');
  }

  if (typeof description !== 'string') {
    valid = false;
    return res.status(400).send('Invalid description');
  }

  if (!rating || rating > 5 || rating < 1) {
    valid = false;
    return res.status(400).send('Invalid rating');
  }

  if (!valid) {
    return res.status(400).send('Invalid data');
  }

  // get an id
  const id = uuid();

  const bookmark = {
    id: id,
    title: title,
    url: url,
    description: description,
    rating: rating,
  };

  bookmarks.push(bookmark);

  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json({ id });
});

module.exports = app;
