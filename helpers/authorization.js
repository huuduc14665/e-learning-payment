const jwt = require('express-jwt');
const { secret } = require('config.json');
const User = require('../models/user.model');
const Section = require('../models/section.model');
const Lecture = require('../models/lecture.model');
const Lesson = require('../models/lesson.model');
const Review = require('../models/review.model');
const Role = require('../helpers/role');
const Resource = require('../models/resource.model');



exports.authorize=function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    
    return [
        
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        (req, res, next) => {
            if (roles.length && !roles.includes(req.user.role)) {
                // user's role is not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // authentication and authorization successful
            res.locals.user = req.user;
            next();
        }
    ];
}

exports.authorizeIdentity = function () {
    return [
        (req, res ,next) => {
            if(req.method == "GET") { 
                if ((res.locals.user.role == Role.Instructor || res.locals.user.role == Role.Student) &&
                    res.locals.user.sub != req.params.id) 
                {
                    return res.status(401).json({ message: 'Unauthorized' });
                } 
            }
            else {
                if (req.params.id != res.locals.user.sub ) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
            }
            next();
        }
    ]
}

exports.authorizeCreatedCourse = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(401).json({ message: 'Provided user is not valid'});
                    }
                    if (user.createdCourses.includes(req.params.id)) {
                        next()
                    }
                    else {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }             
                }
            });
        }
    ];
}

exports.authorizeEnrolledCourse = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(401).json({ message: 'Provided user is not valid'});
                    }
                    if (user.enrolledCourses.includes(req.params.id)) {
                        next()
                    }
                    else {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }             
                }
            });
        }
    ];
}

exports.authorizeCreatedCourseWithSection = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(200).json({ message: 'Provided user is not valid'});
                    }
                    // if method is POST then the course_id is in req.body.course
                    if (req.method == "POST") {
                        if (req.body.course) {
                            if (!user.createdCourses.includes(req.body.course)) {
                                return res.status(401).json({ message: 'Unauthorized' });
                            }
                        }
                        next();
                    }
                    //else we need to find the section with the section_id in the params to get the course_id
                    else {
                        Section.findById(req.params.id, function (err, section) {
                            if (err) {
                                next(err);
                            }
                            else {
                                if (!section) {
                                    return res.status(200).json({ message: 'Provided section is not valid'});
                                }
                                if (!user.createdCourses.includes(section.course)) {
                                    return res.status(401).json({ message: 'Unauthorized' });
                                }
                                next();  
                            }
                        })
                    }
                }
            });
        }
    ];
}

exports.authorizeCreatedCourseWithLecture = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(200).json({ message: 'Provided user is not valid'});
                    }
                    // if method is POST then the course_id is in req.body.course
                    if (req.method == "POST") {
                        if (req.body.course) {
                            if (!user.createdCourses.includes(req.body.course)) {
                                return res.status(401).json({ message: 'Unauthorized' });
                            }
                        }
                        next();
                    }
                    //else we need to find the section with the lecture_id in the params to get the course_id
                    else {
                        Lecture.findById(req.params.id, function (err, lecture) {
                            if (err) {
                                next(error);
                            }
                            else {
                                if (!lecture) {
                                    return res.status(200).json({ message: 'Provided lecture is not valid'});
                                }
                                if (!user.createdCourses.includes(lecture.course)) {
                                    return res.status(401).json({ message: 'Unauthorized' });
                                }
                                next();                
                            }
                        })
                    }
                }
            });
        }
    ];
}

exports.authorizeCreatedCourseWithLesson = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(200).json({ message: 'Provided user is not valid'});
                    }
                    // if method is POST then the course_id is in req.body.course
                    if (req.method == "POST") {
                        if (req.body.course) {
                            if (!user.createdCourses.includes(req.body.course)) {
                                return res.status(401).json({ message: 'Unauthorized' });
                            }
                        }
                        next();
                    }
                    //else we need to find the section with the lesson_id in the params to get the course_id
                    else {
                        Lesson.findById(req.params.id, function (err, lesson) {
                            if (err) {
                                next(error);
                            }
                            else {
                                if (!lesson) {
                                    return res.status(200).json({ message: 'Provided lesson is not valid'});
                                }
                                if (!user.createdCourses.includes(lesson.course)) {
                                    return res.status(401).json({ message: 'Unauthorized' });
                                }
                                next();                
                            }
                        })
                    }
                }
            });
        }
    ];
}

exports.authorizeCreatedCourseWithResource = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(200).json({ message: 'Provided user is not valid'});
                    }
                    // if method is POST then the course_id is in req.body.course
                    if (req.method == "POST") {
                        if (req.body.lecture) {
                            Lecture.findById(req.body.lecture, function(err, lecture) {
                                if (err) {
                                    next(err);
                                }
                                else {
                                    if (!lecture) {
                                        return res.status(200).json({ message: 'Provided lecture is not valid'});
                                    }
                                    if (!user.createdCourses.includes(lecture.course)) {
                                        return res.status(401).json({ message: 'Unauthorized' });
                                    }
                                }
                            })
                        }
                        next();
                    }
                    //else we need to find the section with the lecture_id in the params to get the course_id
                    else {
                        Resource.findById(req.params.id, function (err, resource) {
                            if (err) {
                                next(error);
                            }
                            else {
                                if (!resource) {
                                    return res.status(200).json({ message: 'Provided resource is not valid'});
                                }
                                Lecture.findById(resource.lecture, function(err, lecture) {
                                    if (err) {
                                        next(err);
                                    }
                                    else {
                                        if (!lecture) {
                                            return res.status(200).json({ message: 'Provided lecture is not valid'});
                                        }
                                        if (!user.createdCourses.includes(lecture.course)) {
                                            return res.status(401).json({ message: 'Unauthorized' });
                                        }
                                    }
                                })
                                next();                
                            }
                        })
                    }
                }
            });
        }
    ];
}

exports.authorizeCourseWithFile = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(200).json({ message: 'Provided user is not valid'});
                    }
                    if(req.method == "GET") {
                        if ((res.locals.user.role == Role.Student || res.locals.user.role == Role.Instructor) &&
                        (!user.enrolledCourses.includes(req.params.course_id) && !user.createdCourses.includes(req.params.course_id)))
                        {
                            return res.status(401).json({ message: 'Unauthorized' });
                        }
                    }
                    else {
                        if (!user.createdCourses.includes(req.params.course_id)) {
                            return res.status(401).json({ message: 'Unauthorized' });
                        }
                    }
                    next()
                }
            });
        }
    ];
}

exports.authorizeCourseWithReview = function () {
    return [
        (req, res , next) => {
            User.findById(req.user.sub, function (err, user) {
                if (err) {
                    next(err);
                }
                else {
                    if (!user) {
                        return res.status(200).json({ message: 'Provided user is not valid'});
                    }
                    // if method is POST then the course_id is in req.body.course
                    if (req.method == "POST") {
                        if (req.body.course) {
                            if (!user.enrolledCourses.includes(req.body.course)) {
                                return res.status(401).json({ message: 'Unauthorized' });
                            }
                        }
                        next();
                    }
                    //else we need to find the review with the review_id in the params to get the course_id
                    else {
                        Review.findById(req.params.id, function (err, review) {
                            if (err) {
                                next(error);
                            }
                            else {
                                if (!review) {
                                    return res.status(200).json({ message: 'Provided review is not valid'});
                                }
                                if (req.method == "PUT") {
                                    //Only insstructor of the course can make reply
                                    if (!user.createdCourses.includes(review.course)) {
                                        return res.status(401).json({ message: 'Unauthorized' });
                                    }
                                    next(); 
                                }
                                else { //DELETE Method
                                    if(!(user.role == Role.Admin || user.role == Role.Moderator)) {
                                        //Not Moderator, Admin then only user who made the review can delete
                                        if (review.user != user._id) {
                                            return res.status(401).json({ message: 'Unauthorized' });
                                        }
                                    }
                                    next(); 
                                }
                            }
                        })
                    }
                }
            });
        }
    ];
}