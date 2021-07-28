const util = require('util');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const config = require('../config.json')
const s3Config = require('./s3');

const maxSize = 50 * 1024 * 1024; //Max is 50mb
const resourcesDir = "/resources/";
const tempDir = "/temp/"
const __basedir = path.resolve();

//define metadata function
const metadataFunction = function (req, file, cb) {
  cb(null, { fieldName: file.fieldname });
}


//define storages
let s3DocStorage = multerS3({
  s3: s3Config,
  bucket: config.AWS_BUCKET_NAME,
  metadata: metadataFunction,
  key: function (req, file, cb) {
    let newFileName = Date.now() + "-" + file.originalname;
    let fullPath = 'course_resources/' + req.params.course_id + '/' + newFileName;
    cb(null, fullPath  )
  }
});

let s3ImageStorage = multerS3({
  s3: s3Config,
  bucket: config.AWS_BUCKET_NAME,
  acl: 'public-read',
  metadata: metadataFunction,
  key: function (req, file, cb) {
    let newFileName = Date.now() + "-" + file.originalname;
    let fullPath = "public_assets/" + newFileName;
    cb(null, fullPath  )
  }
});

let videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + resourcesDir + req.params.section_id + "/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

let docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + resourcesDir + req.params.section_id + "/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

let imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

//upload function

let upload = multer({
  storage: s3DocStorage,
   fileFilter: function (_req, file, cb) { checkFileType(file, cb); },
   limits: {
       fileSize: maxSize 
   }
}).single("file");


let uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: maxSize },
  fileFilter: function (_req, file, cb) { checkFileType(file, cb); }
}).single("file");

let uploadImage = multer({
  storage: s3ImageStorage,
  limits: { fileSize: maxSize },
  fileFilter: function (_req, file, cb) { checkImageType(file, cb); }
}).single("image");

//filter functions to check file type
function checkFileType(file, cb) {
  //Name contains any UTF-8 or UTF-16 characters is not allowed since AWS S3 Object Key may have issues
  for (var i = 0; i < file.originalname.length; i++) {
    if (file.originalname.charCodeAt(i) > 127 || file.originalname.charCodeAt(i) === 47) return cb('File name is invalid. Please dont use any UTF-8 or UTF-16 character.');
  }
  // Allowed ext
  const fileExtensions = /doc|docx|ppt|rar|zip|txt|pdf|xls|xlsx/;
  const fileTypes = /doc|docx|vnd.ms-powerpoint|x-rar-compressed|zip|text|pdf|xls|xlsx/;
  // Check ext
  const extname = fileExtensions.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Only these files are allowed: doc, docx, ppt, rar, txt or pdf'); //Need to change this line
  }
}

function checkImageType(file, cb) {
  // Allowed ext
  const fileTypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Only these files are allowed: jpeg, jpg, png or gif'); //Need to change this line
  }
}
let uploadFileMiddleware = util.promisify(uploadDoc);
let uploadImageMiddleware = util.promisify(uploadImage);
let uploadFileS3Middleware = util.promisify(upload);


module.exports.upload = uploadFileS3Middleware;
module.exports.uploadDoc = uploadFileMiddleware;
module.exports.uploadImage = uploadImageMiddleware;