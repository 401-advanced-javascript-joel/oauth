'use strict';

// External resources
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// TODO: Update this string to be something unique to your groups project
// TODO: Where should the secret typically be stored in a more secure application?
let SECRET = 'myserverhasfleas';

// This creates a small test database, where the only record is test.
// The bcrypt.hashSync function is used to quickly hash the password string 'testPass' as a
// synchronous command
let db = {
  test: { username: 'test', password: bcrypt.hashSync('testPass', 10) },
};

// Create an object as our "model", and add functions to that object.
// This takes the place of Mongoose's model AND our wrapper generic model
// class. We're minimizing on features and external packages in this lab, so that
// the focus can be on OAuth.
let usersModel = {
  // TODO: JSDocs function comments
  save: async (record) => {
    if (!db[record.username]) {
      // Hash the password
      record.password = await bcrypt.hash(record.password, 10);

      // Create the user in the (mock) database
      db[record.username] = record;

      return record;
    }

    return false;
  },

  // TODO: JSDocs function comments
  authenticateBasic: async (user, pass) => {
    // Compare the user's stored password with the provided plaintext password
    let valid = await bcrypt.compare(pass, db[user].password);

    if (valid) return db[user];

    return false;
  },

  // TODO: JSDocs function comments
  generateToken: (user) => {
    let token = jwt.sign({ username: user.username }, SECRET);
    return token;
  },

  // TODO: JSDocs function comments
  list: () => {
    return db;
  },
};

module.exports = usersModel;
