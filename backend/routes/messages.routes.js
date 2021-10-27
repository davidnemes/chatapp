var express = require('express');
var router = express.Router();
const controller = require('../controllers/messages.controller');
const authJwt = require('../middlewares/authJwt')


router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.get('/group/:groupId', [authJwt.verifyToken], controller.groupFindAll)
router.get('/private/:conId', [authJwt.verifyToken], controller.privateFindAll)


module.exports = router;