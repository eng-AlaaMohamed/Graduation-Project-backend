const router = require('express').Router();
const {
    createOpjectControler,
    getAllProjsctsControler,
    getSingleProjsctsControler,
    getProjsctsCountControler, 
    deleteProjectControler, 
    upDateProjectControler, 
} = require('../controllers/projectControler');
    
const { verifyToken } = require('../middlewares/verifayToken');
const validObjectId = require('../middlewares/validateOpjectId');
const validateOpjectId = require('../middlewares/validateOpjectId');

// /api/projects
router
    .route('/')
    .post(verifyToken ,createOpjectControler)
    .get(getAllProjsctsControler);

// /api/projects/count
router.route('/count').get(getProjsctsCountControler);


// /api/projects/:id
router.route('/:id')
    .get(validObjectId, getSingleProjsctsControler)
    .delete(validateOpjectId, verifyToken, deleteProjectControler)
    .put(validObjectId, verifyToken, upDateProjectControler);

module.exports = router;