const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

/**
 * Connects to the MongoDB database using the connection URI from the environment.
 * Logs a success message on successful connection and an error message if the connection fails.
 */
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err)); 

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

/**
 * Middleware to parse incoming request bodies in JSON format.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require('express-validator');

/**
 * CORS middleware to handle cross-origin requests.
 */
const cors = require('cors');
app.use(cors());

/**
 * Passport authentication middleware for protecting routes.
 */
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const morgan = require('morgan');

/**
 * Middleware to log requests in the common Apache log format.
 */
app.use(morgan('common'));

/**
 * GET /users - Returns a list of all users from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - JSON array of users.
 */
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET /users/:Username - Returns a user by their username.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.Username - The username of the user.
 * @returns {Object} - JSON object representing the user.
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * POST /users - Creates a new user.
 * Expects the following body:
 * {
 *   Username: String,
 *   Password: String,
 *   Email: String,
 *   Birthday: Date
 * }
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - JSON object representing the newly created user.
 */
app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) => { res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * PUT /users/:Username - Updates a user's information by their username.
 * Expects the following body:
 * {
 *   Username: String,
 *   Password: String,
 *   Email: String,
 *   Birthday: Date
 * }
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.Username - The username of the user to update.
 * @returns {Object} - JSON object representing the updated user.
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }

  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * POST /users/:Username/movies/:MovieID - Adds a movie to a user's favorite movies.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to add to the user's favorites.
 * @returns {Object} - JSON object representing the updated user with the added movie.
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }

  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  }, { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Other routes should follow the same format as above...

// Error handling middleware
/**
 * Error handling middleware.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});
