const db = require("../../config/db-config");

module.exports = {
    getStaticImages,
    getStaticImageByID,
    getStaticImageByPage,
    addStaticImage,
    updateStaticImage,
    deleteStaticImage
}

function getStaticImages () {
    return db("staticImage");
}

function getStaticImageByID (id) {
    return db("staticImage")
        .where({id})
        .first()
}

function getStaticImageByPage (page) {    
    return db("staticImage")
        .where({page})
        .first()
}

function addStaticImage (newBanner) { 
    return db("staticImage")
        .insert(newBanner)
        .returning("*")
        .then(([data]) => data)
}

function updateStaticImage (id, updateData) {
    return db("staticImage")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}

function deleteStaticImage (id) {
    return db("staticImage")
        .where({id})
        .del()
}