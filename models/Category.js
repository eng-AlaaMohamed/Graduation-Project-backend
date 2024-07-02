const mongoose = require('mongoose');
const joi = require('joi');

//Category Schema
const categorySchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
},{
    timestamps: true,
});

//Category model
const Category = mongoose.model("Category", categorySchema);

//Validate Create Category
function validateCreateCategory(obj) {
    const schema = joi.object({
        title: joi.string().trim().required().label("title")
    })
    return schema.validate(obj);
};

module.exports = {
    Category,
    validateCreateCategory
};