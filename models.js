const mongoose = require('mongoose');
const { stringify } = require('uuid');
const bcrypt = require('bcrypt');

/**
 * Schema representing a Movie in the database.
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A short description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - A description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - A short biography of the director.
 * @property {Array<string>} Actors - A list of actors in the movie.
 * @property {string} ImagePath - The image path for the movie poster.
 * @property {boolean} Featured - Whether the movie is featured or not.
 */
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * Schema representing a User in the database.
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The hashed password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array<ObjectId>} FavoriteMovies - List of movies that the user has marked as favorites.
 */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Static method to hash a user's password.
 * @param {string} password - The password to be hashed.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Instance method to validate a user's password.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

// Creating models from the schemas
/**
 * Model representing a movie.
 * @type {mongoose.Model<Movie>}
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * Model representing a user.
 * @type {mongoose.Model<User>}
 */
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
