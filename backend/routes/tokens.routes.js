var express = require('express');
var router = express.Router();
const controller = require('../controllers/tokens.controller');
const authJwt = require('../middlewares/authJwt')


router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.get('/ws', [authJwt.verifyToken], controller.wsCreateToken)
router.post('/accesstoken', controller.newAccessToken)


module.exports = router;