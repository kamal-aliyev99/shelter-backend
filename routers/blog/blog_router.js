// URL :  /api/blog

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const setUpdateMiddleware = require("../../middlewares/setUpdateDate"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const blogController = require("../../controllers/blog/blog_controller");



//      EndPoints


router.get("/", blogController.getBlogs);

router.get("/:slugOrID", blogController.getBlogBySlugOrID);

router.post("/", upload("blog-images").single("image"), blogController.addBlog);  

router.patch("/:id", checkUpdateIDMiddleware, upload("blog-images").single("image"), setUpdateMiddleware, blogController.updateBlog);

router.delete("/:id", blogController.deleteBlog);  


module.exports = router

