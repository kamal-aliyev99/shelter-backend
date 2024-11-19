// URL :  /api/product

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const productController = require("../../controllers/product/product_controller");



//      EndPoints


router.get("/", productController.getProducts);

router.get("/:slugOrID", productController.getProductBySlugOrID);

router.post("/", upload("product-images").single("image"), productController.addProduct);  

router.patch("/:id", checkUpdateIDMiddleware, upload("product-images").single("image"), productController.updateProduct);

router.delete("/:id", productController.deleteProduct);  



module.exports = router