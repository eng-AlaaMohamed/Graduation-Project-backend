const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { Portfolio, validateCreatePortfolio, validateUpdatePortfolio } = require('../models/portfolio');
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary');


/**----------------------------------------------
 * @desc Create New portfolio
 * @route /api/portfolio
 * @method POST
 * @access private (Only logged in user)
------------------------------------------------*/
module.exports.createPortfolioControler = asyncHandler(async (req, res) => {
    //1- Validation for image
    if(!req.file) {
        return res.status(400).json({message: "no image provided"});
    }

    //2- Validation for data
    const { error } = validateCreatePortfolio(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }  

    //3- Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    //4- Create new portfolio and save it to DB
    const portfolio = await Portfolio.create({
        title: req.body.title,
        description: req.body.description,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id,
        },
        projectLink: req.body.projectLink,
    });

    //5- Send response to clint
    res.status(201).json(portfolio);

    //6- Remove image form the server
    fs.unlinkSync(imagePath);
});

/**----------------------------------------------
 * @desc Get Singel portfolio
 * @route /api/portfolio/:id
 * @method GET
 * @access private (Only logged in user)
------------------------------------------------*/
module.exports.getASingelPortfolios= asyncHandler(async (req, res) => {
    const portfolio = await Portfolio.findById(req.params.id);

    if(!portfolio) {
        return res.status(404).json({ message: "portfolio not found" });
    }
    res.status(200).json(portfolio);
});

/**----------------------------------------------
 * @desc   Delete portfolio
 * @route  /api/portfolio/:id
 * @method DELETE
 * @access private (owner the portfolio)
 ------------------------------------------------*/
 module.exports.deletePortfolioControler = asyncHandler( async (req, res) => {
    const portfolio = await Portfolio.findById(req.params.id);
    if(!portfolio) {
        return res.status(404).json({ message: "portfolio not found" });
    }

    if(req.user.id === portfolio.user.toString()) {
        await Portfolio.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'portfolio has been deleted successfully', portfolioId: portfolio._id });
    } else {
        res.status(403).json({ message: 'access denied, forbidden' })
    }

});


/**----------------------------------------------
 * @desc   Update Portfolio
 * @route  /api/Portfolio/:id
 * @method PUT
 * @access private (only owner of project)
 ------------------------------------------------*/
 module.exports.upDatePortfilioControler = asyncHandler( async (req, res) => {
    //1.Validation
    const { error } = validateUpdatePortfolio(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    };

    //2.Get the Portfolio from DB and check if Portfolio exist
    const portfolio = await  Portfolio.findById(req.params.id);
    if(!portfolio){
        return res.status(404).json({ message: "Portfolio not found" });
    };

    //3.Check if this project belong logged in user
    if(req.user.id !== portfolio.user.toString() ) {
        return res.status(403).json({ message: "access denied, you are not allowed" });
    };

    //4.Update project
    const updatePortfolio = await Portfolio.findByIdAndUpdate(req.params.id , {
        $set: {
            title: req.body.title,
            description: req.body.description,
            projectLink: req.body.projectLink
        }
    },{ new: true }).populate("user");

    //4.Send response to clint
    res.status(200).json(updatePortfolio);
 });


 /**----------------------------------------------
 * @desc   Update Portfolio Image
 * @route  /api/portfolio/update-image/:id
 * @method PUT
 * @access private (only owner of project)
 ------------------------------------------------*/
 module.exports.upDatePortfilioImageControler = asyncHandler( async (req, res) => {
    //1.Validation
    if(!req.file) {
        return res.status(400).json({ message: "no image provided" });
    };

    //2.Get the Portfolio from DB and check if Portfolio exist
    const portfolio = await  Portfolio.findById(req.params.id);
    if(!portfolio){
        return res.status(404).json({ message: "Portfolio not found" });
    };

    //3.Check if this project belong logged in user
    if(req.user.id !== portfolio.user.toString() ) {
        return res.status(403).json({ message: "access denied, you are not allowed" });
    };

    //4.delete Old image
    await cloudinaryRemoveImage(portfolio.image.publicId);

    //4.Upload new image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    //4.Update project
    const updatePortfolio = await Portfolio.findByIdAndUpdate(req.params.id , {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id,
            } 
        }
        },{ new: true });

    //Send response clint
    res.status(200).json(updatePortfolio);

    //remove image from server
    fs.unlinkSync(imagePath);
 });