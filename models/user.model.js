const mongoose = require('mongoose');
const Role = require('../helpers/role');

//define user collection schema in MongoDB
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true
  },
  password: {
    type: String,
    // required: true //comment this because of using passportjs
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  birthday: {
    type: Date,
    default: Date.now
  },
  gender: {
    type: String,
    default: "other"
  },
  role: {
    type: String,
    default: Role.Student,
    required: true
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "active"
  },
  attempts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attemp'
  }]
});

//use schema for 'User' collection schema
const User = mongoose.model('User', UserSchema);

module.exports = User;