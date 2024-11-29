const fs = require("fs");

function fileDelete (filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (error) => {
            if (error) {
                console.log({
                    message: `File couldn't delete: '${filePath}'`,
                    error
                });
            } else {
                console.log(`file successfully deleted: '${filePath}'`);
            }
        })
    } else {
        console.log(`'${filePath}' file is not exist`);
    }
}

module.exports = fileDelete