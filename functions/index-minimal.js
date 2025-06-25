const functions = require('firebase-functions');
const app = require('./server-minimal');

exports.api = functions.https.onRequest(app);