const mongoose = require('mongoose');
const joi = require('joi');

//Project Schema
const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlenght: 2,
        maxlenght: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlenght: 10,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: Object,
        default: {
            url: "",
            publicId: null,
        }
    },
    projectLink: {
        type: String,
    }
}, {
    timestamps: true,
});


//Portfolio Mpdel
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

//ValidateCreatePortfolio
function validateCreatePortfolio (obj) {
    const schema = joi.object({
        title: joi.string().trim().min(2).max(200).required(),
        description: joi.string().trim().min(2).required(),
        projectLink: joi.string().trim(),
    });
    return schema.validate(obj);
}

//ValidateUpdatePortfolio
function validateUpdatePortfolio (obj) {
    const schema = joi.object({
        title: joi.string().trim().min(2).max(200),
        description: joi.string().trim().min(2),
        projectLink: joi.string().trim(),
    });
    return schema.validate(obj);
}

module.exports = {
    Portfolio,
    validateCreatePortfolio,
    validateUpdatePortfolio
}