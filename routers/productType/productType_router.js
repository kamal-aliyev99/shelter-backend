// URL :  /api/productType

const router = require("express").Router();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const productTypeController = require("../../controllers/productType/productType_controller"); 



//      EndPoints


router.get("/", productTypeController.getProductTypes);

router.get("/:slugOrID", productTypeController.getProductTypeBySlugOrID);

router.post("/", productTypeController.addProductType);  

router.patch("/:id", checkUpdateIDMiddleware, productTypeController.updateproductType);

router.delete("/:id", productTypeController.deleteProductType);  



module.exports = router