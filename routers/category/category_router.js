// URL :  /api/category

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const categoryController = require("../../controllers/category/category_controller");



//      EndPoints


router.get("/", categoryController.getCategories);

router.get("/:slugOrID", categoryController.getCategoryBySlugOrID);

router.post("/", upload("category-images").single("image"), categoryController.addCategory);  

router.patch("/:id", upload("category-images").single("image"), categoryController.updateCategory);

router.delete("/:id", categoryController.deleteCategory);  



module.exports = router