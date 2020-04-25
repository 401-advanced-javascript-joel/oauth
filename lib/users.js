'use strict';

// External resources
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// TODO: Update this string to be something unique to your groups project
// DONE: Updated it to 'yesverysecure'
// TODO: Where should the secret typically be stored in a more secure application?
// DONE: Typically you would want to store this in the .env file
let SECRET = 'yesverysecure';

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
  /**
   * Saves the user record to the db
   * @param {object} record - The user record to save
   * @return {mixed} The user record saved or a false if failed
   */
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
  /**
   * Authenticates the user
   * @param {string} user - the username to find in the db
   * @param {string} pass - the plain text password to check against the stored hash
   * @return {user} The user information recieved from the 3rd party api
   */
  authenticateBasic: async (user, pass) => {
    // Compare the user's stored password with the provided plaintext password
    let valid = await bcrypt.compare(pass, db[user].password);

    if (valid) return db[user];

    return false;
  },

  // TODO: JSDocs function comments
  /**
   * Generates a JSONWebToken and returns it
   * @param {object} user - The user to create the JSONWebToken for
   * @return {object} The JSONWebToken
   */
  generateToken: (user) => {
    let token = jwt.sign({ username: user.username }, SECRET);
    return token;
  },

  // TODO: JSDocs function comments
  /**
   * Gets the list of users from the "db"
   * @return {object} The list of users
   */
  list: () => {
    return db;
  },
};

module.exports = usersModel;
