const productModel = require("../../models/product/product_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const productInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    category_id: Joi.number().positive().required(),
    image: Joi.string().allow(null),
    date: Joi.date().iso().allow(null, ''),   // YYYY-MM-DD
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required(),
                desc: Joi.string().allow(''),
                client: Joi.string().max(255).allow(''),
                location: Joi.string().max(255).allow('')
            })
        )
        .min(1) 
        .required()
})

const productUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    category_id: Joi.number().positive(),
    slug: Joi.string().max(255),
    image: Joi.string().allow(null),
    date: Joi.date().iso().allow(null, ''),
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(10),
    title: Joi.string().max(255).required(),
    desc: Joi.string().allow(''),
    client: Joi.string().max(255).allow(''),
    location: Joi.string().max(255).allow('') 
})


const defaultLang = "en";

module.exports = {
    getProducts,
    getProductBySlugOrID,
    addProduct,
    updateProduct,
    deleteProduct
}


//      Get all Products 

function getProducts (req, res, next) {
    const lang = req.query.lang || defaultLang;    

    productModel.getProductsWithLang(lang)  
        .then(products => {
            res.status(200).json(products);
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



//      Get Product by ID / slug

function getProductBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getProductBySlugWithLang" :
    "getProductByIDWithLang" 

    productModel[modelFunction](param, lang) 
        .then(product => {
            if (product) {
                res.status(200).json(product);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The product Not Found",
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


//      Add Product

function addProduct (req, res, next) {
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation)
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newProduct = {
        ...formData,    
        image: filePath
    }
    const {translation, ...productData} = newProduct;

    const {error} = productInsertSchema.validate(newProduct, {abortEarly: false})  
    
    if (error) {
        filePath && fileDelete(filePath);  
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

        productModel.getProductBySlug(productData.slug)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${productData.slug}' this slug already exist`,
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
                                        title: productData.slug,
                                    })
                                }
                            });
    
                            productModel.addProduct(productData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "Product successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    filePath && fileDelete(filePath);
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding product",
                                        error
                                    })
                                })  
                            
                        })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding product",
                    error
                })
            })
    }
}

// const exampleNewProduct = {
//     slug: "product1",
//     category_id: 1,
//     date: "2023-02-14",   // YYYY-MM-DD  (ISO)
//     image: null,
//     translation: [
//         {
//             langCode: "en",
//             title: "Product 1",
//             desc: "",
//             client: "",
//             location: ""
//         },
//         {
//             langCode: "az",
//             title: "Mehsul 1",
//             desc: "",
//             client: "",
//             location: ""
//         }
//     ]
// }



//      Update Product

function updateProduct(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    
    const {id: productID, slug, category_id, image, date, translationID, langCode, title, desc, client, location} = formData,
    productData = {id: productID, slug, category_id, image, date},
    translationData = {id: translationID, product_id: id, langCode, title, desc, client, location};     

    if (filePath) {
        productData.image = filePath
    } else {
        if (productData.image !== null) {
            Reflect.deleteProperty(productData, "image");
        }
    }   

    const {error} = productUpdateSchema.validate(formData, {abortEarly: false})   


    if (error) {
        filePath && fileDelete(filePath);
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
        productModel.getProductByID(id)
            .then(data => {
                if (data) {
                    productModel.updateProduct(id, productData, translationData)
                        .then(() =>{
                            Reflect.has(productData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({
                                message: "product updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating product",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The product not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating product",
                    error
                })
            })
    }
}

// const exampleEditProduct = {
//     id: 1,
//     slug: "test-1",
//     category_id: 1,
//     image: null,
//     date: "2024-01-02",
//     translationID: 5,
//     langCode: "en",
//     title: "Test",
//     desc: "",
//     client: "",
//     location: ""
// }



//      delete Product

function deleteProduct(req, res, next) {
    const {id} = req.params;
    let imagePath;

    productModel.getProductByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                productModel.deleteProduct(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting product"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting product",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The product not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting product",
                error
            })
        })
}




