const db = require("../../config/db-config");

module.exports = {
    getLangs,
    getLangByID
}

function getLangs () {
    return db("lang");
}

function getLangByID (id) {
    return db("lang")
        .where({id})
        .first()
}

function addLang (newLang) {
    return db("lang")
        
}