// URL :  /api/user

const router = require("express").Router();
const multer = require("multer");
const upload = multer(); 
// const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID");
const userController = require("../../controllers/user/user_controller");


//      EndPoints


router.get("/allUsers", userController.getUsers);

// router.get("/:id", userController.getUserByID);

router.post("/login", upload.none(), userController.loginUser);

router.post("/register", userController.registerUser);  

// router.patch("/:id", checkUpdateIDMiddleware, userController.updateUser);  

// router.delete("/:id", userController.deleteUser);


module.exports = router

