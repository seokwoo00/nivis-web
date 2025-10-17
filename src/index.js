const express = require("express");
const path = require("path");

const app = express();

const server = app.listen(80, ()=>{
    console.log("server start!");
})

app.use(express.static('src'));

app.get('/', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'main.html');
    res.sendFile(filePath);
})

app.get('/write', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'write.html');
    res.sendFile(filePath);
})

app.get('/post', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'post.html');
    res.sendFile(filePath);
})