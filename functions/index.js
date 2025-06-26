const functions = require('firebase-functions');
const app = require('./server-test');

exports.api = functions.https.onRequest(app);