const mongoose = require('mongoose');
const joi = require('joi');

//Verification Token Schema
const verificationTokenSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
},{
    timestamps: true,
});

//Verification Token model
const VerificationToken = mongoose.model("verificationToken", verificationTokenSchema);


module.exports = VerificationToken;