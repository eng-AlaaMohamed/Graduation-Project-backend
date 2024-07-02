const router = require('express').Router();
const { createApplicantcontroler} = require('../controllers/applicantControler');
const { verifyToken } = require('../middlewares/verifayToken');


// /api/applicants
router.route('/')
    .post(verifyToken, createApplicantcontroler);

module.exports = router;