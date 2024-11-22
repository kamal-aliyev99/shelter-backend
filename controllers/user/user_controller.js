const userModel = require("../../models/user/user_model");

const Joi = require("joi");
const bcrypt = require("bcrypt");

const userInsertSchema = Joi.object({
    fullName: Joi.string().max(255).required(),
    username: Joi.string()
        .pattern(/^\S+$/)  // bosluq olmamalidir
        .min(3).max(255)
        .required()
        .messages({
            'string.pattern.base': 'The username must not contain spaces.',
        }),
    email: Joi.string().max(255).required(),
    password: Joi.string()
        .pattern(/^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/) // min 8, en az - 1 boyuk, 1 kicik herf, 1 reqem, bosluqsuz
        .max(255)
        .required()
        .messages({  
            'string.pattern.base': 'The password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, and 1 number, and must not contain spaces.',
            'string.max': 'The password must not exceed 255 characters.',
            'string.empty': 'The password field cannot be empty.'
        })
})

const loginSchema = Joi.object({
    login: Joi.string().max(255).required(),
    password: Joi.string().min(8).max(255).required()
})

// const userUpdateSchema = Joi.object({
//     id: Joi.number().positive().required(),
//     created_at: Joi.date(),
//     isRead: Joi.boolean().required(),

//     fullName: Joi.string().max(255),
//     phone: Joi.string().max(255),
//     email: Joi.string().max(255),
//     message: Joi.string(),
//     findUs_id: Joi.number().min(0),
//     findUs_other: Joi.string().max(255),
// })

module.exports = {
    getUsers,
    // getUserByID,
    loginUser,
    registerUser,
    // updateIsReadUser,
    // deleteUser
}


//      G E T    A L L    U S E R

function getUsers (req, res, next) {
    userModel.getUsers()  
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error",
                error
            })
        })
}




//      G E T    U S E R   b y   ID

// function getUserbyID (req, res, next) {
//     const {id} = req.params;

//     contactBaseModel.getContactBaseByID(id)
//         .then(contactBase => {
//             if (contactBase) {
//                 res.status(200).json(contactBase);
//             } else {
//                 next(
//                     {
//                         statusCode: 404,
//                         message: "The contactBase Not Found",
//                     }
//                 )
//             }
//         })
//         .catch(error => {
//             next(
//                 {
//                     statusCode: 500,
//                     message: "Internal Server Error",
//                     error
//                 }
//             )
//         })
// }




//      L O G I N    U S E R    username | email  &  password

function loginUser (req, res, next) {
    const loginData = req.body;

    const {error} = loginSchema.validate(loginData, {abortEarly: false})    
    
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
        userModel.checkLoginData(loginData.login)
            .then(async data => {
                if (data) {
                    const isPasswordValid = await bcrypt.compare(loginData.password, data.password_hash);

                    if (isPasswordValid) {
                        userModel.getUserByID(data.id)
                            .then(data => {
                                res.status(200).json(data)
                            })
                    } else {
                        next({
                            statusCode: 401,
                            message: "Login unsuccessfuly. Invalid password.",
                        })
                    }
                    
                } else {
                    next({
                        statusCode: 404,
                        message: "User Not Found",
                    })
                }
                    
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                })
            })

    }


    // userModel.loginUser(id)
    //     .then(userData => {
    //         if (userData) {
    //             res.status(200).json(userData);
    //         } else {
    //             next(
    //                 {
    //                     statusCode: 404,
    //                     message: "The user Not Found",
    //                 }
    //             )
    //         }
    //     })
    //     .catch(error => {
    //         next(
    //             {
    //                 statusCode: 500,
    //                 message: "Internal Server Error",
    //                 error
    //             }
    //         )
    //     })
}
// const exampleLoginData ={
//     login: "test@gmail.com",  // username or email
//     password: "12345"
// }




//      A D D    U S E R   

async function registerUser (req, res, next) {   
    const {password, ...userData} = req.body;   
    
    const {error} = userInsertSchema.validate(req.body, {abortEarly: false})    
    
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
        userModel.checkExistUsernameOrEmail(userData.username, userData.email)
            .then( data => {
                if (data?.username == userData.username) {
                    next({
                        statusCode: 409,  
                        message: `'${userData.username}' username already exist`
                    })
                } else if (data?.email == userData.email) {
                    next({
                        statusCode: 409,  
                        message: `'${userData.email}' email already exist`
                    })
                } else {
                    // Password Hash
                    const saltRounds = 10;

                    bcrypt.hash(password, saltRounds)
                        .then( hashedPassword => {
                            userData.password_hash = hashedPassword;

                            userModel.registerUser(userData)
                                .then(addedUser => {
                                    res.status(201).json({
                                        message: "User registration successfully",
                                        data: addedUser
                                    });
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while registration",
                                        error
                                    })
                                })

                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected occurred while registration",
                    error
                })
            })            
    }
}

// const exampleAddUser = {
//     fullName: "Kamal Aliyev",
//     username: "+994557895623",
//     email: "test@mail.com",
//     password: "Lorem Ipsum"
// }




//      U P D A T E    contactBase

// function updateIsReadContactBase (req, res, next) {
//     const {id} = req.params;
//     const isRead = req.body.isRead;
//     const formData = {...req.body};   

//     const {error} = contactBaseUpdateSchema.validate(formData, {abortEarly: false})   

//     if (error) {
//         const errors = error.details.map(err => ({ 
//             field: err.context.key,
//             message: err.message
//         }));

//         next({
//             statusCode: 400,
//             message: "Bad Request: The server could not understand the request because of invalid syntax.",
//             errors
//         })  
        
//     } else {
//         contactBaseModel.getContactBaseByID(id)
//             .then(data => {
//                 if (data) {
//                     contactBaseModel.updateIsReadContactBase(id, isRead)
//                         .then(updatedData => {
//                             res.status(200).json({ message: "ContactBase updated successfully", data: updatedData });
//                         })
//                         .catch(error => {
//                             next({
//                                 statusCode: 500,
//                                 message: "Internal Server Error: An error occurred while updating contactBase",
//                                 error
//                             })
//                         })
//                 } else {
//                     next({
//                         statusCode: 404,
//                         message: "The contactBase not found"
//                     })
//                 }
//             })
//             .catch(error => {
//                 next({
//                     statusCode: 500,
//                     message: "Internal Server Error: Unexpected occurred while updating contactBase",
//                     error
//                 })
//             })
//     }
// }

// const updateForm = {
//     id: 1,
//     fullName: "Kamal Aliyev",
//     phone: "+994557895623",
//     email: "test@mail.com",
//     message: "Lorem Ipsum",
//     findUs_id: 0,  // 0 => other
//     findUs_other: "LinkedIn",
//     created_at: "2024-11-20"   // ISO format
// }



//      D E L E T E    contactBase

// function deleteContactBase (req, res, next) {
//     const {id} = req.params;

//     contactBaseModel.getContactBaseByID(id)
//         .then(data => {
//             if (data) {
//                 contactBaseModel.deleteContactBase(id)
//                     .then(deletedCount => {
//                         if (deletedCount) {
//                             res.status(204).end();
//                         } else {
//                             next({
//                                 statusCode: 500,
//                                 message: "Internal Server Error: An error occurred while deleting Form from contactBase"
//                             })
//                         }
//                     }) 
//                     .catch(error => {
//                         next({
//                             statusCode: 500,
//                             message: "Internal Server Error: Unexpected occurred while deleting Form from contactBase",
//                             error
//                         })
//                     })

//             } else {
//                 next({
//                     statusCode: 404,
//                     message: "The form not found"
//                 })
//             }
//         })
// }