const asyncHandler = require('express-async-handler');
const { projectModel, validateCreateProject, validateUpdateProject } = require("../models/Project");
const { Applicant } = require("../models/applicant");
// const { post } = require('../routes/projectsRoute');


/**----------------------------------------------
 * @desc   Create New Project
 * @route  /api/projects
 * @method POST
 * @access private (only logged in user)
 ------------------------------------------------*/
 module.exports.createOpjectControler = asyncHandler(async (req, res) => {
    //Validate data
    const { error } = validateCreateProject(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    };
    //Create new opject and save in DB
    const opject = await projectModel.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
    });
    //Send response to clint
    res.status(201).json(opject);
 });


 /**----------------------------------------------
 * @desc   Get all Projects
 * @route  /api/projects
 * @method GET
 * @access public
 ------------------------------------------------*/
 module.exports.getAllProjsctsControler = asyncHandler( async (req, res) => {
        const PROJECT_PER_PAGE = 5;
        const {pageNumber, category} = req.query;
        let projects;

        if(pageNumber) {
            projects = await projectModel.find()
                .skip((pageNumber - 1) * PROJECT_PER_PAGE)
                .limit(PROJECT_PER_PAGE)
                .sort({ createdAt: -1 })
                .populate("user" , ['-password']);
        } else if (category) {
            projects = await projectModel.find({ category })
                .sort({ createdAt: -1 })
                .populate("user" , ['-password']);
        } else {
            projects = await projectModel.find()
                .sort({ createdAt: -1 })
                .populate("user" , ['-password']);
        }
        res.status(200).json(projects);
 });


/**----------------------------------------------
 * @desc   Get Single Projects
 * @route  /api/projects/:id
 * @method GET
 * @access public
 ------------------------------------------------*/
 module.exports.getSingleProjsctsControler = asyncHandler( async (req, res) => {
    const project = await projectModel.findById(req.params.id)
            .populate("user", ["-password"])
            .populate("applicants");

    if(!project) {
        return res.status(404).json({ message: "project not found" });
    }

    res.status(200).json(project);
});


/**----------------------------------------------
 * @desc   Get Projects count
 * @route  /api/projects/count
 * @method GET
 * @access public
 ------------------------------------------------*/
 module.exports.getProjsctsCountControler = asyncHandler( async (req, res) => {
    const count = await projectModel.collection.count();
    res.status(200).json(count);
});

/**----------------------------------------------
 * @desc   Delete Projects
 * @route  /api/projects/:id
 * @method DELETE
 * @access private (only admin or owner the project)
 ------------------------------------------------*/
module.exports.deleteProjectControler = asyncHandler( async (req, res) => {
    const project = await projectModel.findById(req.params.id);
    if(!project) {
        return res.status(404).json({ message: "project not found" });
    }

    if(req.user.isAdmin || req.user.id === project.user.toString()) {
        await projectModel.findByIdAndDelete(req.params.id);
        //Delete All Applicants that belong to this project
        await Applicant.deleteMany({ projectId: project._id });
        
        res.status(200).json({ message: 'project has been deleted successfully', projectId: project._id });
    } else {
        res.status(403).json({ message: 'access denied, forbidden' })
    }

});


/**----------------------------------------------
 * @desc   Update Projects
 * @route  /api/project/:id
 * @method PUT
 * @access private (only owner of project)
 ------------------------------------------------*/
 module.exports.upDateProjectControler = asyncHandler( async (req, res) => {
    //1.Validation
    const { error } = validateUpdateProject(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    };

    //2.Get the project from DB and check if project exist
    const project = await  projectModel.findById(req.params.id);
    if(!project){
        return res.status(404).json({ message: "project not found" });
    };

    //3.Check if this project belong logged in user
    if(req.user.id !== project.user.toString() ) {
        return res.status(403).json({ message: "access denied, you are not allowed" });
    };

    //4.Update project
    const updateProject = await projectModel.findByIdAndUpdate(req.params.id , {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        }
    },{ new: true }).populate("user", ['-password']);

    //4.Send response to clint
    res.status(200).json(updateProject);
 });