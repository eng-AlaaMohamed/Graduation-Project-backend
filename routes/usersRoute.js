const router = require('express').Router();
const {
    getAllUsersControler, 
    getUserProfileControler, 
    upDateUserProfileControler, 
    profilePhotoUploadControler, 
    getAllUsersControlerBublic, 
    getUsersCountControler,
    deleteUserProfileControler} = require('../controllers/usersControler');
const {verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthoraization} = require('../middlewares/verifayToken');
const validateObjectId = require('../middlewares/validateOpjectId');
const photoUpload = require('../middlewares/photoUpload');


// /api/users/profile
router.route('/profile').get( verifyTokenAndAdmin, getAllUsersControler );

// /api/users/profilefreelancers
router.route('/profilefreelancers').get( getAllUsersControlerBublic );

// /api/users/profile/:id
router.route('/profile/:id')
    .get( validateObjectId, getUserProfileControler)
    .put( validateObjectId, verifyTokenAndOnlyUser, upDateUserProfileControler)
    .delete( validateObjectId, verifyTokenAndAuthoraization, deleteUserProfileControler )


// /api/users/profile/profile-photo-upload
router.route('/profile/profile-photo-upload').post( verifyToken, photoUpload.single("image"), profilePhotoUploadControler );

// /api/users/count
router.route('/count').get( verifyToken, getUsersCountControler );



module.exports = router;