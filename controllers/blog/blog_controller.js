const blogModel = require("../../models/blog/blog_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const blogInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    image: Joi.string().allow(null),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required(),
                desc: Joi.string().allow(''),
                shortDesc: Joi.string().allow('')
            })
        )
        .min(1) 
        .required()
})

const blogUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    slug: Joi.string().max(255),
    image: Joi.string().allow(null),
    created_at: Joi.date(),
    updated_at: Joi.date(),   // YYYY-MM-DD
    translationID: Joi.number().positive(),
    langCode: Joi.string().max(10),
    title: Joi.string().max(255).required(),
    desc: Joi.string().allow(''),
    shortDesc: Joi.string().allow('')
})


const defaultLang = "en";

module.exports = {
    getBlogs,
    getBlogBySlugOrID,
    addBlog,
    updateBlog,
    deleteBlog
}


//      Get all blogs 

function getBlogs (req, res, next) {
    const {lang = defaultLang, search} = req.query;       

    blogModel.getBlogsWithLang(lang, search)  
        .then(blogs => {
            res.status(200).json(blogs);
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



//      Get Blog by ID / slug

function getBlogBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getBlogBySlugWithLang" :
    "getBlogByIDWithLang" 

    blogModel[modelFunction](param, lang) 
        .then(blog => {
            if (blog) {
                res.status(200).json(blog);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The blog Not Found",
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


//      Add Blog

function addBlog (req, res, next) {
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;
    const newBlog = {
        ...formData,    
        image: filePath
    }
    const {translation, ...blogData} = newBlog;

    const {error} = blogInsertSchema.validate(newBlog, {abortEarly: false})  
    
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

        blogModel.getBlogBySlug(blogData.slug)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${blogData.slug}' this slug already exist`,
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
                                        title: blogData.slug,
                                    })
                                }
                            });
    
                            blogModel.addBlog(blogData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "blog successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    filePath && fileDelete(filePath);
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding blog",
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
                    message: "Unexpected error occurred while adding blog",
                    error
                })
            })
    }
}

// const exampleNewBlog = {
//     slug: "blog-1",
//     image: null,
//     translation: [
//         {
//             langCode: "en",
//             title: "Blog 1",
//             desc: "",
//             shortDesc: ""
//         },
//         {
//             langCode: "az",
//             title: "Bloq 1",
//             desc: "",
//             shortDesc: ""
//         }
//     ]
// }



//      Update blog

function updateBlog(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;
    
    const {id: blogID, slug, image, updated_at, translationID, langCode, title, desc, shortDesc} = formData,
    blogData = {id: blogID, slug, image, updated_at},
    translationData = {id: translationID, blog_id: id, langCode, title, desc, shortDesc}; 
    
    

    if (filePath) {
        blogData.image = filePath
    } else {
        if (blogData.image !== null) {
            Reflect.deleteProperty(blogData, "image");
        }
    }   

    const {error} = blogUpdateSchema.validate(formData, {abortEarly: false})   

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
        blogModel.getBlogByID(id)
            .then(data => {
                if (data) {
                    blogModel.updateBlog(id, blogData, translationData)
                        .then(() =>{
                            Reflect.has(blogData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({
                                message: "blog updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating blog",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The blog not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating blog",
                    error
                })
            })
    }
}

// const exampleEditBlog = {
//     id: 1,
//     slug: "blog-1",
//     image: null,
//     created_at: "2024.05.22",   //  optional    
//     updated_at: "2024.05.22",   //  optional
//     translationID: 5,   
//     langCode: "en",
//     title: "Blog 1",
//     desc: "",
//     shortDesc: ""
// }



//      delete Blog

function deleteBlog(req, res, next) {
    const {id} = req.params;
    let imagePath;

    blogModel.getBlogByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                blogModel.deleteBlog(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting blog"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting blog",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The blog not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting blog",
                error
            })
        })
}




