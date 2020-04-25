'use strict';

// GitHub OAuth Implementation
// https://developer.github.com/apps/building-oauth-apps/

// External Resources
const superagent = require('superagent');
const users = require('./users.js');

// Environment Variables
const tokenServerUrl = process.env.TOKEN_SERVER;
const remoteUserAPI = process.env.REMOTE_USER_API;
const remoteEmailAPI = process.env.REMOTE_EMAIL_API;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_SERVER = process.env.API_SERVER;

// TODO: JSDocs function comments
/**
 * Exchanges the authentication code with the auth server for an access token
 * @param {string} code - The authentication code previously recieved from the 3rd
 *        party server
 * @return {string} The access token from the 3d party server
 */
async function exchangeCodeForToken(code) {
  // TODO: What does .send() do?
  // DONE: .send() takes an object of parameters and sends it to the 3rd party
  //       server

  // TODO: What do each of these key-value pairs mean?
  // DONE: These key-value pairs are different parameters that we are
  //       going to be sent to tokenServerUrl
  let response = await superagent
    .post(tokenServerUrl)
    .send({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: API_SERVER,
      grant_type: 'authorization_code',
    })
    .set('Content-Type', 'application/x-www-form-urlencoded');

  // TODO: What is this access token? What is it used for?
  // DONE: This access token can be used to make requests to 3rd party apis on
  //       on behalf of the user.
  let access_token = response.body.access_token;

  return access_token;
}

// TODO: JSDocs function comments
/**
 * Makes a request to get the remote user information from the 3rd party api
 * @param {string} token - The access token previously recieved from the auth server
 * @return {object} The user information recieved from the 3rd party api
 */
async function getRemoteUserInfo(token) {
  // TODO: What is remoteAPI used for?
  // DONE: remoteAPI is used to get the user information.
  let response = await superagent
    .get(remoteUserAPI)
    .set('user-agent', 'express-app')
    .set('Authorization', `Bearer ${token}`);

  let user = response.body;

  // LinkedIn Requires second call for email
  response = await superagent
    .get(remoteEmailAPI)
    .set('user-agent', 'express-app')
    .set('Authorization', `Bearer ${token}`);
  user.email = response.body.elements[0]['handle~'].emailAddress;
  return user;
}

// TODO: JSDocs function comments
/**
 * Saves the remote user as a current user
 * @param {object} remoteUser - The access code previously recieved from the auth server
 * @return {user} The user information recieved from the 3rd party api
 */
async function getUser(remoteUser) {
  // TODO: Why is the password set to plaintext 'oauthpassword' here?
  // DONE: The password is set to plaintext oauthpassword because is hashed with
  //       bcrypt on the users.save(userRecord)
  let userRecord = {
    email: remoteUser.email,
    username:
      remoteUser.localizedFirstName + ' ' + remoteUser.localizedLastName,
    password: 'oauthpassword',
  };

  let user = await users.save(userRecord);
  let token = users.generateToken(user);

  // TODO: What do the square brackets mean here?
  // DONE: The brackets here are saying that we are returning an array with the
  //       user object and the json web token
  return [user, token];
}

// TODO: JSDocs function comments
/**
 * Handles entire oauth process and logs to console
 * @param {object} req - The request object
 * @param {object} req - The response object
 * @param {callback} next - The next callback
 */
module.exports = async function authorize(req, res, next) {
  // TODO: Why do we want a try-catch block here?
  // DONE: We need the try catch here incase any of the requests throw errors
  try {
    let code = req.query.code;
    console.log('(1) CODE:', code);

    let remoteToken = await exchangeCodeForToken(code);
    console.log('(2) ACCESS TOKEN:', remoteToken);

    let remoteUser = await getRemoteUserInfo(remoteToken);
    console.log('(3) LINKEDIN USER', remoteUser);

    let [user, token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    console.log('(4) LOCAL USER', user);

    // TODO: Why do we need a next() here?
    // DONE: We call next() here becuase authorize is middleware for the /oauth
    //       route and we need to move forward with the request
    next();
  } catch (e) {
    // TODO: What does this next() call lead us to?
    // DONE: This next throws the error which could be caught with some error
    //       catching middleware
    next(`ERROR: ${e.message}`);
  }
};
