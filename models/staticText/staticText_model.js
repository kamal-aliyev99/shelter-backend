const db = require("../../config/db-config");

module.exports = {
    getStaticTexts,
    getStaticTextByID,
    getStaticTextByKey,
    addStaticText,
    updateStaticText,
    deleteStaticText
}

function getStaticTexts(lang) {
    return db("staticText")
}

function getStaticTextByID (id) {
    return db("staticText")
        .where({id})
        .first()
}

function getStaticTextByKey (key) {
    return db("staticText")
        .where({key})
        .first()
}
 
function addStaticText (staticTextData, translation) {
    return db.transaction(async trx => {
        try{
            const [staticTextID] = await trx("staticText").insert(staticTextData).returning("id");

            const translationData = translation.map(data => { // translation'da olmayan diller   ???
                return {
                    ...data,
                    staticText_id: staticTextID,
                }
            })

            await trx("staticText_translate").insert(translationData);

            return staticTextID;

        } catch (error) {
            return Promise.reject(new Error(error));
        }
    })
}

function updateStaticText () {
    return db("staticText")
}

function deleteStaticText () {
    return db("staticText")
}

