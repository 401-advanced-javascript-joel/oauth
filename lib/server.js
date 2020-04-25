'use strict';

// External Resources
const express = require('express');
const cors = require('cors');

// Internal Resources
const oauth = require('./oauth.js');

// TODO: What is this line doing?
// DONE: This line creates the express app
const app = express();

// TODO: What is this line doing?
// DONE: This line sets cors() middleware application wide
app.use(cors());

// This line of code allows us to use the HTML pages located in the public folder.
// It is important for OAuth applications to have some "front-end" webpages, because
// we want to have the user redirect to a webpage owned by our OAuth provider.
app.use(express.static('./public'));

// TODO: What is this route doing?
// DONE: this route is basically just running the oauth middlware and spitting out
//       the token

// TODO: Document route with swagger comments
/**
 * This route runs and if authorized returns the access token to the screen
 * @route GET /oauth
 * @param {string} code.query.required - the authorization code
 * @param {string} state.query.required - the state
 * @returns {object} 200 - the access token.
 */
app.get('/oauth', oauth, (req, res) => {
  res.status(200).send(req.token);
});

// TODO: What is this module exporting?
// DONE: This model exports the express app and a function that spins it up on
//       the server

// TODO: What does app.listen do?
// DONE: app.listen tells express which port to listen for traffic on
module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
