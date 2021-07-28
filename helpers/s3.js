const AWS = require('aws-sdk');
const config = require('../config.json')

const s3 = new AWS.S3({
    accessKeyId: config.AWS_IAM_USER_KEY,
    secretAccessKey: config.AWS_IAM_USER_SECRET,
    Bucket: config.AWS_BUCKET_NAME
});

module.exports = s3;