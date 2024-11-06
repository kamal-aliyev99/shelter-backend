const db = require("../../config/db-config");

module.exports = {
    getStaticImages,
    getStaticImageByID,
    getStaticImageByKey,
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

function getStaticImageByKey (key) {    
    return db("staticImage")
        .where({key})
        .first()
}

function addStaticImage (newStaticImage) { 
    return db("staticImage")
        .insert(newStaticImage)
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