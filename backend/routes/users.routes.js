var express = require('express');
var router = express.Router();
const controller = require("../controllers/users.controller");
const authJwt = require('../middlewares/authJwt')

const multer = require("multer")
const upload = multer({ dest: "public/images" })

router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// router.get('/', controller.getHtml);
router.get('/', [authJwt.verifyToken], controller.findAll)

router.post('/login', controller.login)
router.post('/signup', controller.signup)
router.put('/newun', [authJwt.verifyToken], controller.changeUn)
router.put('/newpw', [authJwt.verifyToken], controller.changePw)
router.put('/newprofpic', [authJwt.verifyToken], [upload.single("profpic")], controller.changeProfpic)

router.delete('/', [authJwt.verifyToken], controller.deleteUser)


module.exports = router;
