const categoryModel = require("../../models/category/category_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const categoryInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    productType_id: Joi.number().positive().required(),
    image: Joi.string().allow(null),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required()
            })
        )
        .min(1) 
        .required()
})

const categoryUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    productType_id: Joi.number().positive(),
    slug: Joi.string().max(255),
    image: Joi.string().allow(null),
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(10),
    title: Joi.string().max(255).required(),
})


const defaultLang = "en";

module.exports = {
    getCategories,
    getCategoryBySlugOrID,
    addCategory,
    updateCategory,
    deleteCategory
}


//      Get all Categories 

function getCategories (req, res, next) {
    const lang = req.query.lang || defaultLang;    

    categoryModel.getCategoriesWithLang(lang)  
        .then(categories => {
            res.status(200).json(categories);
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



//      Get Category by ID / slug

function getCategoryBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getCategoryBySlugWithLang" :
    "getCategoryByIDWithLang" 

    categoryModel[modelFunction](param, lang) 
        .then(category => {
            if (category) {
                res.status(200).json(category);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The category Not Found",
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


//      Add Category

function addCategory (req, res, next) {
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newCategory = {
        ...formData,    
        image: filePath
    }
    const {translation, ...categoryData} = newCategory;

    const {error} = categoryInsertSchema.validate(newCategory, {abortEarly: false})  
    
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

        categoryModel.getCategoryBySlug(categoryData.slug)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${categoryData.slug}' this slug already exist`,
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
                                        title: categoryData.slug,
                                    })
                                }
                            });
    
                            categoryModel.addCategory(categoryData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "Category successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    filePath && fileDelete(filePath);
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding Category",
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
                    message: "Unexpected error occurred while adding Category",
                    error
                })
            })
    }
}

// const exampleNewCategory = {
//     slug: "mini_bunker",
//     productType_id: 1,
//     image: null,
//     translation: [
//         {
//             langCode: "en",
//             title: "Mini bunker"
//         },
//         {
//             langCode: "az",
//             title: "Balaca bunker"
//         }
//     ]
// }



//      Update Category

function updateCategory(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    
    const {id: categoryID, slug, productType_id, image, translationID, langCode, title} = formData,
    categoryData = {id: categoryID, slug, productType_id, image},
    translationData = {id: translationID, category_id: id, langCode, title};

    if (filePath) {
        categoryData.image = filePath
    } else {
        if (categoryData.image !== null) {
            Reflect.deleteProperty(categoryData, "image");
        }
    }   

    const {error} = categoryUpdateSchema.validate(formData, {abortEarly: false})   


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
        categoryModel.getCategoryByID(id)
            .then(data => {
                if (data) {
                    categoryModel.updateCategory(id, categoryData, translationData)
                        .then(() =>{
                            Reflect.has(categoryData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({
                                message: "Category updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating category",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The category not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating category",
                    error
                })
            })
    }
}

// const exampleEditCategory = {
//     id: 1,
//     slug: "test-1",
//     productType_id: 1,
//     image: null,
//     translationID: 5,
//     langCode: "en",
//     title: "Test",
// }



//      delete Category

function deleteCategory(req, res, next) {
    const {id} = req.params;
    let imagePath;

    categoryModel.getCategoryByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                categoryModel.deleteCategory(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting category"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting category",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The category not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting category",
                error
            })
        })
}




