'use strict';

// TODO: What is this line doing?
// DONE: This line is setting all the environement variables
require('dotenv').config();

// TODO: What is this line doing?
// DONE: This line is spinning up the server on the given port
require('./lib/server.js').start(process.env.PORT);
