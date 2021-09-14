var express = require('express');
var router = express.Router();
const controller = require("../controllers/users.controller");
const wsController = require('../controllers/ws.controller');
const authJwt = require('../middlewares/authJwt')


router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// router.get('/', controller.getHtml);
router.post('/login', controller.login)
router.post('/signup', controller.signup)
router.get('/', [authJwt.verifyToken], controller.findAll)
router.get('/wstoken', [authJwt.verifyToken], wsController.wsCreateToken)


module.exports = router;
