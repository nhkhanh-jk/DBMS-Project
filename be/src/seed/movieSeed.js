const { faker } = require('@faker-js/faker');
const Movie = require('../models/Movie');

const MOVIE_COUNT = 50;

function buildMovies(limit) {
  const genreSets = [
    ['Action', 'Adventure'],
    ['Comedy', 'Family'],
    ['Drama', 'Romance'],
    ['Horror', 'Thriller'],
    ['Sci-Fi', 'Action'],
    ['Animation', 'Family'],
    ['Crime', 'Mystery'],
  ];

  return Array.from({ length: limit }, (_, index) => ({
    title: faker.helpers.fake(`{{word.adjective}} {{word.noun}} ${index + 1}`),
    genres: genreSets[index % genreSets.length],
    description: faker.lorem.paragraph(),
    durationMin: faker.number.int({ min: 88, max: 155 }),
    releaseDate: faker.date.between({
      from: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    }),
    status: index % 6 === 0 ? 'SCHEDULED' : 'ACTIVE',
  }));
}

async function seedMovies() {
  return Movie.bulkCreate(buildMovies(MOVIE_COUNT));
}

module.exports = seedMovies;
