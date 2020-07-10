const express = require('express'),
  { v4: uuid } = require('uuid');

const bookmarks = require('./bookmark-store'),
  logger = require('./logger');

const bookmarksRouter = express.Router();

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post((req, res) => {
    const { title, url, rating, description = '' } = req.headers;

    if (!title || typeof title !== 'string') {
      logger.error(`Title is required and must be a string`);
      return res.status(400).send('Invalid title');
    }

    if (!url || typeof url !== 'string' || !url.includes('http')) {
      logger.error(`URL is required and must include http or https protocol`);
      return res.status(400).send('Invalid url');
    }

    if (typeof description !== 'string') {
      return res.status(400).send('Invalid description');
    }

    if (!rating || rating > 5 || rating < 1) {
      logger.error(`Rating is required and must be an integer between 1 and 5`);
      return res.status(400).send('Invalid rating');
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

    logger.info(`Bookmark with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json({ id });
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params,
      bookmark = bookmarks.find((b) => b.id == id);

    if (!bookmark) {
      logger.error(`Card with id ${id} not found.`);
      return res.status(404).send('Bookmark Not Found');
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    console.log(req.params);

    const bookmarkIndex = bookmarks.findIndex((c) => c.id == id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send('Not found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
