const {cloudinaryUploadImage, cloudinaryRemoveImage} = require('../utils/cloudinary');
const {userModel, validateUpdateUser} = require('../models/User');
const asyncHandler = require('express-async-handler');
const { projectModel } = require('../models/Project');
const { Applicant } = require('../models/applicant');
const bcrybt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

/**----------------------------------------------
 * @desc Get All Users Profile
 * @route /api/users/profile
 * @method GET
 * @access private (Only Admin)
------------------------------------------------*/
module.exports.getAllUsersControler = asyncHandler ( async (req, res) => {
  const users = await userModel.find().select('-password').populate("projects");
  res.status(200).json(users);
});


/**----------------------------------------------
 * @desc Get All Users Profile
 * @route /api/users/profilefreelancers
 * @method GET
 * @access public
------------------------------------------------*/
module.exports.getAllUsersControlerBublic = asyncHandler ( async (req, res) => {
const USRE_PER_PAGE = 10;
const {pageNumber, category} = req.query;
let users;

if(pageNumber) {
    users = await userModel.find().select('-password').populate("projects")
      .skip((pageNumber - 1) *  USRE_PER_PAGE)
      .limit( USRE_PER_PAGE)
      .sort({ createdAt: -1 })
} else if (category) {
    users = await userModel.find({category}).populate("projects")
      .sort({ createdAt: -1 })
} else {
    users = await userModel.find().populate("projects")
    .sort({ createdAt: -1 })
}
res.status(200).json(users);

// const users = await userModel.find().select('-password');
// res.status(200).json(users);
})


/**----------------------------------------------
 * @desc Get User Profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
------------------------------------------------*/
module.exports.getUserProfileControler = asyncHandler ( async (req, res) => {
  const user = await userModel.findById(req.params.id).select('-password').populate("projects").populate("portfolio");
  if(!user) {
    return res.status(404).json({message : 'User Not Found'});
  }
  res.status(200).json(user);
});


/**----------------------------------------------
 * @desc Update User Profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (Only user himself)
------------------------------------------------*/
module.exports.upDateUserProfileControler = asyncHandler ( async (req, res) => {
const { error } = validateUpdateUser(req.body);
if(error) {
  return res.status(400).json({ message: error.details[0].message });
};

//Hashing Password
if(req.body.password) {
  const salt = await bcrybt.genSalt(10);
  req.body.password = await bcrybt.hash(req.body.password, salt);
};

//Update User
const upDateUser = await userModel.findByIdAndUpdate(req.params.id, {
  $set: {
    username: req.body.username,
    password: req.body.password,
    bio: req.body.bio,
    description: req.body.description,
  }
}, {new: true}).select('-password').populate("projects");

res.status(200).json(upDateUser);
});


/**----------------------------------------------
 * @desc  Profile Photo Upload
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (Only Logged in user)
------------------------------------------------*/
module.exports.profilePhotoUploadControler = asyncHandler( async (req, res) => {
//1.Validate
if(!req.file) {
  return res.status(400).json({ message: "no file provided" })
}

//2.Get the path to the image
const imagePath = path.join(__dirname,`../images/${req.file.filename}`);

//3.Upload image cloudinary
const result = await cloudinaryUploadImage(imagePath);


//4.the user from DBGet 
const user = await userModel.findById(req.user.id);

//5.Delete old profile photo if exist
if(user.profilePhoto.publicId !== null) {
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
};

//6.Change the profile photo faild in DB
user.profilePhoto = {
  url: result.secure_url,
  publicId: result.public_id,
}
await user.save();

//7.Send response to clint
res.status(200).json({
  message: "your profile photo uploaded successfully",
  profilePhoto: {url: result.secure_url, publicId: result.public_id},
});

//8.Remove image from server
fs.unlinkSync(imagePath);
});


/**----------------------------------------------
 * @desc Get Users count
 * @route /api/users/count
 * @method GET
 * @access private (Only Admin)
------------------------------------------------*/
module.exports.getUsersCountControler = asyncHandler ( async (req, res) => {
const count = await userModel.collection.count();
res.status(200).json(count);
})


/**----------------------------------------------
 * @desc Delete Users Profile (Acount)
 * @route /api/users/profile/:id
 * @method DELETE
 * @access private (Only Admin)
------------------------------------------------*/
module.exports.deleteUserProfileControler = asyncHandler ( async (req, res) => {
//1-get the user from DB
const user = await userModel.findById(req.params.id);
if(!user) {
  return res.status(404).json({message: "user not found"});
}

//2-Delete the profile picture from cloudinary
if(user.profilePhoto.publicId !== null){
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
}

//3-Delete user projects && Applicants
await projectModel.deleteMany({user: user._id})
await Applicant.deleteMany({user: user._id})

//delete the user
await userModel.findByIdAndDelete(req.params.id);

//send a response to clinte
res.status(200).json({message: "your profile has been deleted"})
});
