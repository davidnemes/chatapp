var express = require('express');
var router = express.Router();
const controller = require('../controllers/privcons.controller');
const authJwt = require('../middlewares/authJwt')


router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.post('/new', [authJwt.verifyToken], controller.askPermission)
router.post('/accept', [authJwt.verifyToken], controller.accept)
router.post('/reject', [authJwt.verifyToken], controller.reject)


module.exports = router;