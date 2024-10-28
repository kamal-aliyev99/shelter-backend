const fs = require("fs");

function fileDelete (filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.log(`File couldn't delete: '${filePath}'`);
        } else {
            console.log(`file successfully deleted: '${filePath}'`);
        }
    })
}

module.exports = fileDelete