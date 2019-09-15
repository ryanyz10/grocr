const express = require('express');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const uuidv3 = require('uuid/v3');
const app = express();
const port = 8000;
const time = (new Date()).getTime();
const seed = uuidv3(`${time}`,'1b671a64-40d5-491e-99b0-da01ff1f3341');
const users = new Map();
//const users = [];

app.use(bodyParser.json({
    limit: '50mb',
    type: 'application/json',
    extended: true
}))
    .use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));

app.post('/createUser', function(req,res){
    let tokenId = uuidv3(req.body.username,seed);
    if(users.has(tokenId) || !req.body.username
        || !req.body.email || !req.body.name
        || !req.body.password)
    {
        res.sendStatus(400);
    }
    else {
        let user = {};
        user.userame = req.body.username;
        user.email = req.body.email;
        user.name = req.body.name;
        user.password = req.body.password;
        user.products = [];
        user.pictures = [];
        users.set(tokenId, user);
        res.json(tokenId);
        res.end();
    }
});

//LOGIN
app.post('/*', function (req, res, next) {
    let head = req.headers;
    if (!head.token) {
        res.sendStatus(400);
    } else {
        if (users.has(head.token)) {
            req.token = head.token;
            next()
        } else {
            res.sendStatus(400);
        }

    }
});

app.post('/login', function(req,res) {
    if (req.token) {
    res.json(req.token);
    res.end();
    }
    else
        res.sendStatus(400);
});

app.post('/postImage', function(req,res){
    let id = `${users.get(req.token).username}-${new Date().getTime()}`;
    let data = {...req.body};
    base64Img.img("data:image/jpeg;base64,"+data.img, 'img/', `img-${id}`, function(err, filepath) {
        if(!err) {
            users.get(req.token).pictures.push(id);
        } else {
            res.sendStatus(400);
        }
    });
    res.sendStatus(200);
});

app.get('/getData', function(req,res){
    res.sendStatus(200);
});

app.use('/img/',express.static(__dirname + '/img/'));
app.listen(port, () => console.log('Listening on port ' + port));
