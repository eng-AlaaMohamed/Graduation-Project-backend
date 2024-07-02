const asyncHandler = require('express-async-handler');
const { Applicant, validateApplicant } = require('../models/applicant');
const { userModel } = require('../models/User');

/**----------------------------------------------
 * @desc   Create New Applicant
 * @route  /api/applicants
 * @method POST
 * @access private (only logged in user)
 ------------------------------------------------*/
module.exports.createApplicantcontroler = asyncHandler( async (req, res) => {
const { error } = validateApplicant(req.body);

if(error) {
    return res.status(400).json({ message: error.details[0].message});
}

const usreApplicant = await Applicant.findOne({user: req.user.id, projectId: req.body.projectId});


if(usreApplicant) {
    return res.status(400).json({message: "تقدمت مسبقا"});
}

const profile = await userModel.findById(req.user.id);

const applicant = await Applicant.create({
    projectId: req.body.projectId,
    user: req.user.id,
    username: profile.username,
    profilePhoto: profile.profilePhoto,
    bio: profile.bio,
    description: profile.description,
    position: profile.position,
});    

res.status(201).json(applicant);
});