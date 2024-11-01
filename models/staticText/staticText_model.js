const db = require("../../config/db-config");

module.exports = {
    getStaticTexts,

}

function getStaticTexts(lang) {
    return db("staticText")
}





