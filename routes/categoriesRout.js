const router = require('express').Router();
const { createCategoreyControler, getAllCategoriesControler, deleteCategoryControler } = require('../controllers/categoriesControler');
const { verifyTokenAndAdmin } = require("../middlewares/verifayToken");
const validateOpjectId = require('../middlewares/validateOpjectId');

// /api/categories
router.route("/")
    .post(verifyTokenAndAdmin, createCategoreyControler)
    .get(getAllCategoriesControler);

// /api/categories/:id
router.route('/:id').delete( validateOpjectId, verifyTokenAndAdmin, deleteCategoryControler);

module.exports = router;