// URL :  /api/setting

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const settingController = require("../../controllers/setting/setting_controller")



//      EndPoints


router.get("/", settingController.getSettings);

router.get("/:keyOrID", settingController.getSettingByKeyOrID);

router.post("/", upload("setting-images").single("value"), settingController.addSetting);

router.patch("/:id", upload("setting-images").single("value"), settingController.updateSetting);

router.delete("/:id", settingController.deleteSetting);



module.exports = router