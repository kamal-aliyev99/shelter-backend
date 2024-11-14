const express = require("express");
const server = express();
server.use(express.json())
server.use('/public', express.static('public'));

/* Middlewares */

const mainRouter = require("./routers/main_router")

server.use("/api", mainRouter);

server.listen(3030, () => {
    console.log("http://localhost:3030 is ready"); 
})
