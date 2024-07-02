const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');

//User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
            publicId: null,
        }
    },
    bio: {
        type: String,
    },
    position:{
        type: String,
    },
    bio:{
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//Populate Projects That belong tothis user when he/she git his/hir profile
UserSchema.virtual("projects",{
    ref: "project",
    foreignField: "user",
    localField: "_id",
});

//Populate Portfolio That belong tothis user when he/she git his/hir profile
UserSchema.virtual("portfolio",{
    ref: "Portfolio",
    foreignField: "user",
    localField: "_id",
});


//Generate User Token
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({id: this._id, isAdmin: this.isAdmin}, process.env.JWT_SECRET)
}

// User model export
const userModel = mongoose.model('User', UserSchema);

//Validate Register User
function validateRegisterUser (obj) {
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100).required(),
        email: joi.string().trim().min(2).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
        bio: joi.string().trim().required(),
        description: joi.string().trim().min(10).required(),
        category: joi.string().trim().required(),
        position: joi.string().trim().min(8).max(100).required(),
    })
    return schema.validate(obj)
}

//Validate Login User
function validateLoginUser (obj) {
    const schema = joi.object({
        email: joi.string().trim().min(2).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}

//Validate Update User
function validateUpdateUser (obj) {
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100),
        password: joi.string().trim().min(8),
        bio: joi.string(),
        description: joi.string(),
    })
    return schema.validate(obj)
}

//Validate Email
function validateEmail (obj) {
    const schema = joi.object({
        email: joi.string().trim().min(2).max(100).required().email(),
    })
    return schema.validate(obj)
}

//Validate New Password
function validateNewPassword (obj) {
    const schema = joi.object({
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}

module.exports = {
    userModel,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword,
}