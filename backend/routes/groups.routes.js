var express = require('express');
var router = express.Router();
const controller = require('../controllers/groups.controller');
const authJwt = require('../middlewares/authJwt')


router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.post('/askentry', [authJwt.verifyToken], controller.askEntry)
router.get('/members/:groupId', [authJwt.verifyToken], controller.findAllMember)


module.exports = router;