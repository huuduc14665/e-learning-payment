const express = require('express');
const router = express.Router();
const paymentRoutes = require('./payment.route')


//index of routes
router.get('/', function (req, res) {
  res.send('API works!');
});

router.use('/payment', paymentRoutes);

//export router
module.exports = router;
