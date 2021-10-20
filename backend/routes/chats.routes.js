var express = require('express');
var router = express.Router();
const controller = require('../controllers/chats.controller');
const authJwt = require('../middlewares/authJwt')


router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.get('/:userId', [authJwt.verifyToken], controller.findAll)


module.exports = router;