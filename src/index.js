const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const server = app.listen(80, ()=>{
    console.log("server start!");
})
app.use(express.urlencoded({extended:false}));
app.use(express.static('src'));
app.use(express.static('storage'));
app.use(express.json());  
app.get('/', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'main.html');
    res.sendFile(filePath);
})

app.get('/write', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'write.html');

    res.sendFile(filePath);
})

app.post('/write', async (req, res) => { 
    console.log(req);
    const { title, content } = req.body;
    let date = Date.now();
    let json = 
    {
    "post_name":title,
    "date":date,
    "view":0,
    "content":content
    };
    fs.writeFileSync(`../storage/${title}_${date}.json`,JSON.stringify(json))
})
app.get('/post', async (req, res) => { 
    var filePath = path.join(__dirname, 'html', 'post.html');
    res.sendFile(filePath);
})