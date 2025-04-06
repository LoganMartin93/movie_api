const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Passport Local Strategy for authenticating users via username and password.
 * @param {string} username - The username provided by the user.
 * @param {string} password - The password provided by the user.
 * @param {Function} callback - The callback function to return the result of the authentication.
 * @returns {void}
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',  // Field used for username
      passwordField: 'Password',  // Field used for password
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      // Find the user in the database by username
      await Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log('incorrect username');
            // If user is not found, return an error message
            return callback(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          if (!user.validatePassword(password)) {
            console.log('incorrect password');
            // If password validation fails, return an error message
            return callback(null, false, { message: 'Incorrect password.' });
          }
          console.log('finished');
          // If authentication is successful, return the user object
          return callback(null, user);
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            // If an error occurs during the process, return the error
            return callback(error);
          }
        });
    }
  )
);

/**
 * Passport JWT Strategy for authenticating users based on JWT.
 * @param {Object} jwtPayload - The payload decoded from the JWT.
 * @param {Function} callback - The callback function to return the result of the JWT authentication.
 * @returns {void}
 */
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),  // Extract JWT from authorization header as bearer token
  secretOrKey: 'your_jwt_secret'  // Secret key used to verify the JWT
}, async (jwtPayload, callback) => {
  // Find the user by the decoded user ID from the JWT
  return await Users.findById(jwtPayload._id)
    .then((user) => {
      // If user is found, return the user object
      return callback(null, user);
    })
    .catch((error) => {
      // If an error occurs, return the error
      return callback(error);
    });
}));
