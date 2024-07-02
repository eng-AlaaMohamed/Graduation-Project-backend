const mongoose = require('mongoose');
const joi = require('joi');

//Applicant Schema
const applicantSchema = mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
            publicId: null,
        }
    },
    bio:{
        type: String,
    },
    description: {
        type: String,
    },
    position:{
        type: String,
    },
},{
    timestamps: true,
});

//Applicant Model
const Applicant = mongoose.model("Applicant", applicantSchema);

//Validate Applicant
function validateApplicant (obj) {
    const schema = joi.object({
        projectId: joi.string().required(),
    });
    return schema.validate(obj);
};

module.exports = {
    Applicant,
    validateApplicant
};