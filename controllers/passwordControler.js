const asyncHandler = require('express-async-handler');
const {userModel, validateEmail, validateNewPassword} = require('../models/User');
const bcrypt = require('bcryptjs');
const VerificationToken = require('../models/VerificationToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');



/**----------------------------------------------
* @desc    Send Reset Password Link
* @route   /api/password/reset-password-link
* @method  POST
* @access  public
 ------------------------------------------------*/
 module.exports.sendResetPasswordLinkControler = asyncHandler( async (req, res) => {
    //1-Validate
    const {error} = validateEmail(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    };
    //2-Get The User From DB By Email
    const user = await userModel.findOne({ email: req.body.email });
    if(!user) {
        return res.status(404).json({ message: "user with given email dose not sxist!" })
    };
    //3-Creating verificationToken
    let verificationToken = await VerificationToken.findOne({ userId: user._id });
    if(!verificationToken) {
         verificationToken = new VerificationToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString('hex')
        });
        await verificationToken.save();
    };
    //4-Creating Link
    const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;
    //5-Creating Html template
    const htmlTemplate = `<a href="${link}"> اضغط علي هذا الرابط لاعادة تعيين كلمة المرور الخاصه بك`;
    //6-sending Email
    await sendEmail(user.email, "تغيير كلمة المرور", htmlTemplate);
    //7-Response to clint
    res.status(200).json({
        message: "تم ارسال الرابط الخاص باعادة تعيين كلمة المرور الي بريدك الخاص , تحقق من البريد الالكتروني"
    });
 });


/**----------------------------------------------
* @desc    Get Reset Password Link
* @route   /api/password/reset-password/:userId/:token
* @method  GET
* @access  public
 ------------------------------------------------*/
 module.exports.getResetPasswordLinkControler = asyncHandler( async (req, res) => {
    const user = await userModel.findById(req.params.userId);
    if(!user) {
        return res.status(400).json({message: "invalid link"});
    };

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token,
    });
    if(!verificationToken) {
        return res.status(400).json({message: "invalid link"});
    };

    res.status(200).json({message: "valid url"})
 });


/**----------------------------------------------
* @desc     Reset Password 
* @route   /api/password/reset-password/:userId/:token
* @method  POST
* @access  public
 ------------------------------------------------*/
 module.exports.resetPasswordControler = asyncHandler( async (req, res) => {
    const {error} = validateNewPassword(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    };
    
    const user = await userModel.findById(req.params.userId);
    if(!user) {
        return res.status(400).json({ message: "invalid link!" })
    };

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token
    });
    if(!verificationToken) {
        return res.status(400).json({ message: "invalid link!" })
    };

    if(!user.isAccountVerified) {
        user.isAccountVerified = true;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    await user.save();
    await verificationToken.deleteOne();

    res.status(200).json({message: "تم تغيير كلمة المرور بنجاح, قم بتسجيل الدخول"})
 })