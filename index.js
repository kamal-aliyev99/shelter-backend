require('dotenv').config();

const express = require("express");
const server = express();
const cors = require("cors");
const path = require("path")

server.use(cors());
server.use(express.json())
server.use('/public', express.static(path.join(__dirname, 'public')));


/* Middlewares */

const mainRouter = require("./routers/main_router")

server.use("/api", mainRouter);

server.listen(3030, () => {
    console.log("http://localhost:3030 is ready"); 
})
