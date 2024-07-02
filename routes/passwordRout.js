const router = require('express').Router();
const {
    sendResetPasswordLinkControler,
    getResetPasswordLinkControler, 
    resetPasswordControler} = require('../controllers/passwordControler');


// /api/password/reset-password-link
router.post("/reset-password-link", sendResetPasswordLinkControler);


// /api/password/reset-password/:userId/:token
router.route("/reset-password/:userId/:token")
    .get(getResetPasswordLinkControler)
    .post(resetPasswordControler);

module.exports = router;