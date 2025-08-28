const express = require("express");
const path = require("path");

const app = express();

const server = app.listen(80, ()=>{
    console.log("server start!");
})

app.get('/', async(requestAnimationFrame, res)=>{
    res.send("hello world");
})