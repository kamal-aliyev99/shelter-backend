const productTypeModel = require("../../models/productType/productType_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const productTypeInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required(),
            })
        )
        .min(1) // arrayda min 1 obj olmalidi - for slug
        .required()
})

const productTypeUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    slug: Joi.string().max(255),
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(10),
    title: Joi.string().max(255).required(),
})


const defaultLang = "en";

module.exports = {
    getProductTypes,
    getProductTypeBySlugOrID,
    addProductType,
    updateproductType,
    deleteProductType
}


//      Get all productTypes 

function getProductTypes (req, res, next) {
    const lang = req.query.lang || defaultLang;    

    productTypeModel.getProductTypesWithLang(lang)  
        .then(productTypes => {
            res.status(200).json(productTypes);
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                }
            )
        })
}



//      Get productType by ID / slug

function getProductTypeBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getProductTypeBySlugWithLang" :
    "getProductTypeByIDWithLang" 

    productTypeModel[modelFunction](param, lang) 
        .then(productType => {
            if (productType) {
                res.status(200).json(productType);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The productType Not Found",
                    }
                )
            }
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                }
            )
        })
}


//      Add ProductType

function addProductType (req, res, next) {
    const formData = {...req.body};

    const {translation, ...productTypeData} = formData;

    const {error} = productTypeInsertSchema.validate(formData, {abortEarly: false})  
    
    if (error) {
        const errors = error.details.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {

        productTypeModel.getProductTypeBySlug(productTypeData.slug)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  
                        message: `'${productTypeData.slug}' this slug already exist`,
                        data
                    })
                } else {
                    langModel.getLangs()
                        .then(langs => {    
                            langs.forEach(lang => {
                                const existLang = translation.some(tr => tr.langCode === lang.langCode)
    
                                if (!existLang) {
                                    translation.push({
                                        langCode: lang.langCode,
                                        title: productTypeData.slug,
                                    })
                                }
                            });
    
                            productTypeModel.addProductType(productTypeData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "ProductType successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding ProductType",
                                        error
                                    })
                                })  
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding ProductType",
                    error
                })
            })
    }
}

// const exampleNewProductType = {
//     slug: "shelter",
//     translation: [
//         {
//             langCode: "en",
//             title: "Shelter"
//         },
//         {
//             langCode: "az",
//             title: "Siginacaq"
//         }
//     ]
// }



//      Update productType

function updateproductType(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    
    const {id: productTypeID, slug, translationID, langCode, title} = formData,
    productTypeData = {id: productTypeID, slug},
    translationData = {id: translationID, productType_id: id, langCode, title};

    const {error} = productTypeUpdateSchema.validate(formData, {abortEarly: false})   

    if (error) {
        const errors = error.details.map(err => ({ 
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        productTypeModel.getProductTypeByID(id)
            .then(data => {
                if (data) {
                    productTypeModel.updateProductType(id, productTypeData, translationData)
                        .then(() =>{
                            res.status(200).json({
                                message: "ProductType updated successfully"
                            })
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating productType",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The productType not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating productType",
                    error
                })
            })
    }
}

// const exampleEditProductType = {
//     id: 1,
//     slug: "test-1",
//     translationID: 3,
//     langCode: "en",
//     title: "Test"
// }



//      delete ProductType

function deleteProductType(req, res, next) {
    const {id} = req.params;

    productTypeModel.getProductTypeByID(id)
        .then(data => {
            if (data) {
                productTypeModel.deleteProductType(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting productType"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting productType",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The productType not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting productType",
                error
            })
        })
}




