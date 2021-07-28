const nodemailer = require("nodemailer");
const config = require('../config.json');
const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;



const oAuth2Client = new OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URL);
oAuth2Client.setCredentials({refresh_token: config.GOOGLE_REFRESH_TOKEN});

const accessToken = oAuth2Client.getAccessToken().catch(err => {console.log("Warning: Google OAuth refresh token is expired and need to be refreshed.")});
const emailService = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
        type: "OAuth2",
        user: config.EMAIL_USERNAME,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken
    },
    tls: {
        rejectUnauthorized: false
      }
});



module.exports = emailService;