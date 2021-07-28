const express = require('express');
const router = express.Router();


//index of routes
router.get('/', function (req, res) {
  res.send('API works!');
});


//export router
module.exports = router;
