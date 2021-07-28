const mongoose = require('mongoose');

//define UserProgress collection schema in MongoDB
const UserProgressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
    },
    progresses: [{
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        },
        passedLessons: [{
            type: String
        }],
        currentLesson: {
            type: Number,
            default: 0
        },
    }],
    certificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    }
});
module.exports = mongoose.model('UserProgress', UserProgressSchema);