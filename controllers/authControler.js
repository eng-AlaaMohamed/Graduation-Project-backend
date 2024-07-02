const asyncHandler = require('express-async-handler');
const {userModel, validateRegisterUser, validateLoginUser} = require('../models/User');
const bcrypt = require('bcryptjs');
const VerificationToken = require('../models/VerificationToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

/**----------------------------------------------
 * @desc Register New User
 * @route /api/auth/register
 * @method POST
 * @access public
 ------------------------------------------------*/
module.exports.registerUserControler = asyncHandler(async (req, res) => {
//Validate Data
const {error} = validateRegisterUser(req.body);
if(error) {
    return res.status(400).json({message: error.details[0].message});
}
//Dose The User Exist ?
let user = await userModel.findOne({ email: req.body.email });
if(user) {
    return res.status(400).json({message: "User already exist"});
}
//Hashing Password
const salt = await bcrypt.genSalt(10);
const hashPassword = await bcrypt.hash(req.body.password, salt);
//New User And Save
user = new userModel({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
    bio: req.body.bio,
    description: req.body.description,
    category: req.body.category,
    position: req.body.position,
});
await user.save();

//Creating new verificatontoken & save it toDB
const verificatontoken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString('hex'),
})
await verificatontoken.save();

//Making the link
const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificatontoken.token}`;

//Putting the link into an html template
const htmltemplate = `
    <div>
        <p>اضغط علي الرابط الموجود في الاسفل للتحقق من البريد الاكتروني الخاص بك</p>
        <a href="${link}">تحقق</a>
    </div>`;

//Sending Email To User
await sendEmail(user.email,"التحقق من بريدك الخاص", htmltemplate);

//Send a response to clint
res.status(201).json({message: 'ارسلنا الي بريدك الالكتروني , نرجو التحقق من البريد الخاص بك'});
});


/**----------------------------------------------
 * @desc Login User
 * @route /api/auth/login
 * @method POST
 * @access public
 ------------------------------------------------*/
module.exports.loginUserControler = asyncHandler( async (req, res) => {
//Validate Data
const {error} = validateLoginUser(req.body);
if(error) {
    return res.status(400).json({message: error.details[0].message});
}
//Dose The User Exist
const user = await userModel.findOne({ email: req.body.email });
if(!user) {
    return res.status(400).json({message: "invalid email or password"});
}
//Check Password
const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
if(!isPasswordMatch) {
    return res.status(400).json({message: "invalid email or password"});
}

if(!user.isAccountVerified) {
    return res.status(400).json({message: 'ارسلنا الي بريدك الالكتروني , نرجو التحقق من البريد الخاص بك'});
}

//Generate Token
const token = user.generateAuthToken();
//Send Response To Clint
res.status(200).json({
    id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
    position: user.position,
    category: user.category,
    email: user.email,
})
});


/**----------------------------------------------
 * @desc Verify User Account
 * @route /api/auth/:userId/verify/:token
 * @method GET
 * @access public
 ------------------------------------------------*/
module.exports.verifyUserAccountControler = asyncHandler(async (req, res) => {

const user = await userModel.findById(req.params.userId);

if(!user) {
    return res.status(400).json({message: "invalid link"});
}

const verificatontoken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
});

user.isAccountVerified = true;
await user.save();

await verificatontoken.deleteOne();

res.status(200).json({message: "Your Account Verified"});
});