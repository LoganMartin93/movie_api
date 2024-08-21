const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

const morgan = require('morgan');

// Middleware for logging
app.use(morgan('common'));

// In-memory list of top movies
let movies = [
  {
    Title: 'Harry Potter and the Sorcerer\'s Stone',
    Description : 'Based on the wildly popular J.K. Rowling\'s book about a young boy who on his eleventh birthday discovers, he is the orphaned boy of two powerful wizards and has unique magical powers.',
    Author: 'J.K. Rowling',
    Genre: {
      Name: 'Fantasy',
      Description: 'Fantasy is a genre of literature that features magical and supernatural elements that are not real'
    },
    Director: {
      Name: 'Chris Columbus',
      Bio: "Born in Pennsylvania and raised in Ohio, Chris Columbus was first inspired to make movies after seeing The Godfather at age 15. After enrolling at NYU film school, he sold his first screenplay (never produced) while a sophomore there. After graduation Columbus tried to sell his fourth script, Gremlins, with no success, until Steven Spielberg optioned it; Columbus moved to Los Angeles for a year during rewrites on the project in Spielberg's bungalow at Universal. After writing two more scripts for Spielberg, The Goonies and Young Sherlock Holmes, Columbus' own directing career was launched a few years later with Adventures in Babysitting. He is best known to audiences as the director of the runaway hit Home Alone, written and produced by John Hughes its sequel Home Alone 2, and most recently Mrs. Doubtfire.",
      Birth: 1958 
    },
    ImageURL: "https://www.amazon.com/Harry-Potter-Sorcerers-Daniel-Radcliffe/dp/B0011AQLZQ",
    Featured: false
  },
  {
    Title: 'Lord of the Rings',
    Description : 'In the first part, The Lord of the Rings, a shy young hobbit named Frodo Baggins inherits a simple gold ring that holds the secret to the survival--or enslavement--of the entire world.',
    Author: 'J.R.R. Tolkien',
    Genre: {
      Name: 'Adventure',
      Description: 'Adventure stories are a genre that involve protagonists going on epic journeys. '
    },
    Director: {
      Name: 'Peter Jackson',
      Bio:  "Sir Peter Jackson made history with The Lord of the Rings trilogy, becoming the first person to direct three major feature films simultaneously. The Fellowship of the Ring, The Two Towers and The Return of the King were nominated for and collected a slew of awards from around the globe, with The Return of the King receiving his most impressive collection of awards. This included three Academy Awards® (Best Adapted Screenplay, Best Director and Best Picture), two Golden Globes (Best Director and Best Motion Picture-Drama), three BAFTAs (Best Adapted Screenplay, Best Film and Viewers' Choice), a Directors Guild Award, a Producers Guild Award and a New York Film Critics Circle Award.",
      Birth: 1961
    },
    ImageURL: "https://www.amazon.com/Lord-Rings-Fellowship-Ring/dp/B000YMH4CG",
    Featured: false
  },
  {
    Title: 'Twilight',
    Description : 'When Bella Swan moves to a small town in the Pacific Northwest, she falls in love with Edward Cullen, a mysterious classmate who reveals himself to be a 108-year-old vampire.',
    Author: 'Stephanie Meyer',
    Genre: {
      Name: 'Romance',
      Description: 'The romance genre is a type of storytelling that explores love and romantic relationships between characters.'
    },
    Director: {
      Name: 'Catherine Hardwicke',
      Bio:  "Hardwicke's first film as a director was the Sundance winner THIRTEEN which explored the transition into teenage years with an authenticity that still captures young audiences (1.3 billion Tik Tok engagements.) Hardwicke directed LORDS OF DOGTOWN before she became best known as the director of TWILIGHT, which launched the blockbuster franchise and has since earned over three billion dollars. Recently her indie film PRISONER'S DAUGHTER premiered at TIFF 2022 and DREAMS IN THE WITCHHOUSE dropped on Netflix October 2022 as part of Guillermo del Toro's Cabinet of Curiosities. MAFIA MAMMA premieres in theaters on April 14 2023.",
      Birth: 1955
    },
    ImageURL: "https://www.amazon.com/Twilight-Kristen-Stewart/dp/B001T5D6LK",
    Featured: false
  }
];

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: ["Twilight"]
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: []
  },
]

// CREATE 
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name){
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('Users need names!')
  }
})

// UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else{
    res.status(400).send('User not found')
  }
})

// POST
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle)
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else{
    res.status(400).send('User not found')
  }
})

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title!== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else{
    res.status(400).send('no such user')
  }
})

// DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else{
    res.status(400).send('no such user')
  }
})


// ROOT
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});


// READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});


// READ
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(404).send('Genre not found');
  }
});


// READ
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(404).send('Director not found');
  }
});

// Serves static documentation
app.use('/documentation', express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Starts the server
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
