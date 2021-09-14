var express = require('express');
var router = express.Router();
const authJwt = require('../middlewares/authJwt')


/* GET home page. */
router.get('/', [authJwt.verifyToken], function(req, res, next) {
  res.send('valami uzenet');
});

module.exports = router;
