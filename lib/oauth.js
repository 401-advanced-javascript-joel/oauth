'use strict';

// GitHub OAuth Implementation
// https://developer.github.com/apps/building-oauth-apps/

// External Resources
const superagent = require('superagent');
const users = require('./users.js');

// Environment Variables
const tokenServerUrl = process.env.TOKEN_SERVER;
const remoteAPI = process.env.REMOTE_API;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_SERVER = process.env.API_SERVER;

// TODO: JSDocs function comments
async function exchangeCodeForToken(code) {
    // TODO: What does .send() do?
    let response = await superagent.post(tokenServerUrl).send({
        // TODO: What do each of these key-value pairs mean?
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: API_SERVER,
        grant_type: 'authorization_code',
    });

    // TODO: What is this access token? What is it used for?
    let access_token = response.body.access_token;

    return access_token;
}

// TODO: JSDocs function comments
async function getRemoteUserInfo(token) {
    // TODO: What is remoteAPI used for?
    let response = await superagent
        .get(remoteAPI)
        .set('user-agent', 'express-app')
        .set('Authorization', `token ${token}`);

    let user = response.body;

    return user;
}

// TODO: JSDocs function comments
async function getUser(remoteUser) {
    // TODO: Why is the password set to plaintext 'oauthpassword' here?
    let userRecord = {
        username: remoteUser.login,
        password: 'oauthpassword',
    };

    let user = await users.save(userRecord);
    let token = users.generateToken(user);

    // TODO: What do the square brackets mean here?
    return [user, token];
}

// TODO: JSDocs function comments
module.exports = async function authorize(req, res, next) {
    // TODO: Why do we want a try-catch block here?
    try {
        let code = req.query.code;
        console.log('(1) CODE:', code);

        let remoteToken = await exchangeCodeForToken(code);
        console.log('(2) ACCESS TOKEN:', remoteToken);

        let remoteUser = await getRemoteUserInfo(remoteToken);
        console.log('(3) GITHUB USER', remoteUser);

        let [user, token] = await getUser(remoteUser);
        req.user = user;
        req.token = token;
        console.log('(4) LOCAL USER', user);

        // TODO: Why do we need a next() here?
        next();
    } catch (e) {
        // TODO: What does this next() call lead us to?
        next(`ERROR: ${e.message}`);
    }
};
