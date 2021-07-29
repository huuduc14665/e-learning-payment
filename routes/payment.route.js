
var express = require('express');
var router = express.Router();
const Payment = require('../models/payment.model')
const User = require('../models/user.model')
const Course = require('../models/course.model')
const UserProgress = require('../models/userProgress.model')
const { ObjectId } = require('mongodb');
const Authorization = require('../helpers/authorization')
const Constants = require('../helpers/constants')


router.post('/create_payment_url', Authorization.authorize(), function (req, res, next) {
    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var config = require('../config.json');
    var dateFormat = require('dateformat');


    var tmnCode = config.vnp_TmnCode;
    var secretKey = config.vnp_HashSecret;
    var vnpUrl = config.vnp_Url;
    var returnUrl = config.vnp_ReturnUrl;

    var date = new Date();

    var createDate = dateFormat(date, 'yyyymmddHHmmss');
    var orderId = Date.now();
    var amount = req.body.amount;
    var bankCode = req.body.bankCode;

    var orderInfo = req.body.orderDescription;
    var orderType = req.body.orderType;
    var locale = req.body.language;
    var currCode = req.body.currency;
    if (currCode === null || currCode === '' || currCode == undefined) {
        currCode = 'VND';
    }
    if (locale === null || locale === '' || locale == undefined) {
        locale = 'vn';
    }
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl + '/' + req.body.course;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '' || bankCode !== undefined) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    var sha256 = require('sha256');

    var secureHash = sha256(signData);

    vnp_Params['vnp_SecureHashType'] = 'SHA256';
    vnp_Params['vnp_SecureHash'] = secureHash;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

    const payment = new Payment({
        orderId: orderId,
        amount: amount,
        currency: currCode,
        course: req.body.course,
        user: res.locals.user.sub,
        paid: false
    });
    console.log(currCode);
    console.log(payment);

    payment.save(function (err, savedPayment) {
        if (err) {
            console.log("error");
            return res.status(200).json({ message: err });
        }
        else {
            console.log("success");
            res.status(200).json({ code: '00', data: vnpUrl })
        }
    })
});


router.get('/vnpay_ipn', function (req, res, next) {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var config = require('../config.json');
    var secretKey = config.vnp_HashSecret;

    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    var sha256 = require('sha256');

    var checkSum = sha256(signData);

    if (secureHash === checkSum) {
        var orderId = vnp_Params['vnp_TxnRef'];
        var rspCode = vnp_Params['vnp_ResponseCode'];
        console.log(vnp_Params['vnp_CreateDate'])
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        Payment.findOne({ orderId: orderId }, function (err, payment) {
            if (err) console.log(err);
            else {
                if (payment) {
                    payment.paid = true;
                    payment.save(function (err, saved) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            User.findById(payment.user, function (err, user) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    if (user) {
                                        Course.findById(payment.course, function (err, course) {
                                            if (err) console.log(err);
                                            else {
                                                console.log(course);
                                                if (!course) console.log("The courseId in payment is not valid");
                                                user.enrolledCourses.push(ObjectId(course._id));

                                                user.save(function (err, updatedUser) {
                                                    if (err) {
                                                        next(err);
                                                    }
                                                    else {
                                                        if (course.type == Constants.COURSE_TYPES.PROGRAMING) {
                                                            userProgress = new UserProgress({
                                                                user: payment.user,
                                                                course: course._id,
                                                            });
                                                            userProgress.save(function (err) {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                                else {
                                                                    res.status(200).json({ RspCode: '00', Message: 'success' })
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            console.log(updatedUser);
                                                            res.status(200).json({ RspCode: '00', Message: 'success' })
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else {
                                        console.log("Provided userId in payment is not valid");
                                    }
                                }
                            })
                        }
                    })
                }
                else {
                    console.log("No paymen was found");
                    res.status(200).json({ RspCode: '00', Message: 'success' });
                    
                }
            }

        })

    }
    else {
        res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
    }
});

function sortObject(o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

module.exports = router;