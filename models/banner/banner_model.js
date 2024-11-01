const db = require("../../config/db-config");

module.exports = {
    getBanners,
    getBannerByID,
    getBannerByPage,
    addBanner,
    updateBanner,
    deleteBanner
}

function getBanners () {
    return db("banner");
}

function getBannerByID (id) {
    return db("banner")
        .where({id})
        .first()
}

function getBannerByPage (page) {    
    return db("banner")
        .where({page})
        .first()
}

function addBanner (newBanner) { 
    return db("banner")
        .insert(newBanner)
        .returning("*")
        .then(([data]) => data)
}

function updateBanner (id, updateData) {
    return db("banner")
        .where({id})
        .update(updateData)
        .returning("*")
        .then(([data]) => data)
}

function deleteBanner (id) {
    return db("banner")
        .where({id})
        .del()
}