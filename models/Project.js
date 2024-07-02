const mongoose = require('mongoose');
const joi = require('joi');

//Project Schema
const projectSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//Populate Applicants for this project
projectSchema.virtual("applicants",{
    ref: "Applicant",
    foreignField: "projectId",
    localField: "_id",
})


//Project Model
const projectModel = mongoose.model("project", projectSchema);

//Validate create project
function validateCreateProject (obj) {
    const schema = joi.object({
        title: joi.string().trim().min(2).max(200).required(),
        description: joi.string().trim().min(10).required(),
        category: joi.string().trim().required(),
    });
    return schema.validate(obj);
};

//Validate update project
function validateUpdateProject (obj) {
    const schema = joi.object({
        title: joi.string().trim().min(2).max(200),
        description: joi.string().trim().min(10),
        category: joi.string().trim(),
    });
    return schema.validate(obj);
};

module.exports = {
    projectModel,
    validateCreateProject,
    validateUpdateProject
};