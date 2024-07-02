const router = require("express").Router();
const {
    createPortfolioControler, 
    getASingelPortfolios, 
    deletePortfolioControler,
    upDatePortfilioControler,
    upDatePortfilioImageControler,
} = require("../controllers/portfolioControler");
const photoUpload = require("../middlewares/photoUpload");
const validateOpjectId = require("../middlewares/validateOpjectId");
const { verifyToken } = require("../middlewares/verifayToken");

// /api/portfolio
router.route('/')
    .post(verifyToken, photoUpload.single("image"), createPortfolioControler);

// /api/portfolio/:id
router.route('/:id')
    .get(validateOpjectId, getASingelPortfolios)
    .delete(validateOpjectId,verifyToken, deletePortfolioControler)
    .put(validateOpjectId,verifyToken, upDatePortfilioControler);

// api/portfolio/update-image/:id
router.route('/update-image/:id')
    .put(validateOpjectId, verifyToken, photoUpload.single('image'), upDatePortfilioImageControler);

module.exports = router;