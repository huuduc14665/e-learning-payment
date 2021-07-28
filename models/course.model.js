const mongoose = require('mongoose');

//define course collection schema in MongoDB
const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject', //refer to collection subjects in DB in order to use populate
      required: true
  },
  instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', //refer to collection users in DB in order to use populate
      required: true
  },
  overview: {
    type: String
  },
  description: {
      type: String
  },
  objectives: [{
    type: String
  }],
  img_url: {
    type: String
  },
  price: {
      type: Number,
      required: true  
  },
  status: {
    type: String,
    default: "new"
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  type: {
    type: String,
    required: true
  },
  avgRate: {
    type: Number
  },
  reviewsNumber: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }]
});

//use schema for 'course' collection schema
const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;