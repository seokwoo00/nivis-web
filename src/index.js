const express = require("express");
const path = require("path");

const app = express();

const server = app.listen(80, ()=>{
    console.log("server start!");
})

app.get('/', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'main.html');
    res.sendFile(filePath);
})