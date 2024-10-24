const langModel = require("../../models/lang/lang_model");

const multer = require("multer");
const Joi = require("joi");

const upload = multer();

module.exports = {
    getLangs,
    getLangByID
}


//      G E T    A L L    L A N G U A G E S

function getLangs (req, res, next) {
    langModel.getLangs()
        .then(langs => {
            res.status(200).json(langs);
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    errorMessage: "Internal Server Error",
                    error
                }
            )
        })
}



//      G E T    L A N G   b y   I D

function getLangByID (req, res, next) {
    const {id} = req.params;

    langModel.getLangByID(id)
        .then(lang => {
            if (lang) {
                res.status(200).json(lang);
            } else {
                next(
                    {
                        statusCode: 404,
                        errorMessage: "Language Not Found",
                    }
                )
            }
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    errorMessage: "Internal Server Error",
                    error
                }
            )
        })
}