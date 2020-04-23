'use strict';

// External Resources
const express = require('express');
const cors = require('cors');

// Internal Resources
const oauth = require('./oauth.js');

// TODO: What is this line doing?
const app = express();

// TODO: What is this line doing?
app.use(cors());

// This line of code allows us to use the HTML pages located in the public folder.
// It is important for OAuth applications to have some "front-end" webpages, because
// we want to have the user redirect to a webpage owned by our OAuth provider.
app.use(express.static('./public'));

// TODO: What is this route doing?
// TODO: Document route with swagger comments
app.get('/oauth', oauth, (req, res) => {
    res.status(200).send(req.token);
});

// TODO: What is this module exporting?
// TODO: What does app.listen do?
module.exports = {
    server: app,
    start: (port) => {
        app.listen(port, () => {
            console.log(`Server Up on ${port}`);
        });
    },
};
