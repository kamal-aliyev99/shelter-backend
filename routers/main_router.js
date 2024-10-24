const router = require("express").Router();
const urlNotFound = require("../middlewares/urlNotFound");
const errorHandling = require("../middlewares/errorHandling")

// R O U T E S

const langRouter = require("./lang/lang_router");


router.get("/", (req,res) => {
    res.status(200).send("Success!!")
})

router.use("/lang", langRouter);


router.use(errorHandling);

router.use(urlNotFound);

module.exports = router    // The END