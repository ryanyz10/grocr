const express = require('express');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const uuidv3 = require('uuid/v3');
const app = express();
const port = 8000;
const time = (new Date()).getTime();
const seed = uuidv3(`${time}`,'1b671a64-40d5-491e-99b0-da01ff1f3341');
const users = new Map();
const userMap = new Map();

// HAHA we are such good programmers :P
const FS_URL_BASE = "https://www.instabase.com/api/v1/drives";
const FLOW_URL_BASE = "https://www.instabase.com/api/v1";

const OCR_INPUT_DIR = "ryanyz10/my-repo/fs/Instabase Drive/ocr-text-extraction/input";
const EXTRACT_INPUT_DIR = "ryanyz10/my-repo/fs/Instabase Drive/information-extraction/input";

const OCR_URL = "ryanyz10/my-repo/fs/Instabase Drive/ocr-text-extraction/OCRFlow.ibflow";
const EXTRACT_URL = "ryanyz10/my-repo/fs/Instabase Drive/information-extraction/InformationExtractionFlow.ibflow";

const INSTABASE_TOKEN = "6DuAoNlviiYLTY42nBX5NP9pH0oS2v";

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
        user.receipts = [];
        user.inventory = {};
        users.set(tokenId, user);
        userMap.set(req.body.username, {password:req.body.password, token: tokenId});
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('token',tokenId);
        res.send(tokenId);
        res.end();
    }
});

app.post('/login', function(req,res) {
    console.log(req.headers);
    let userInfo = userMap.get(req.headers.username);
    if (userInfo) {
        if(req.headers.password === userInfo.password) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('token',userInfo.token);
            res.send(userInfo.token);
            res.end();
        }
    }
    else
        res.sendStatus(400);
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


app.post('/postImage', function(req,res){
    // let id = `${users.get(req.token).username}-${new Date().getTime()}`;
    let data = {...req.body};
    let jsonResponse = await fetch(`${FS_URL_BASE}/${EXTRACT_INPUT_DIR}/input.jpg`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INSTABASE_TOKEN}`, 
            'Instabase-API-Args': JSON.stringify({
                'type': 'file',
                'cursor': 0,
                'if_exists': 'overwrite',
                'mime_type': 'image/jpeg' 
            })
        },
        body: `data:image/png;base64,${data.img}`
    });

    if (jsonResponse.data.status === 'ERROR') {
        res.sendStatus(jsonResponse.data.statusCode);
    }

    jsonResponse = await fetch(`${FLOW_URL_BASE}/flow/run_flow_async`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INSTABASE_TOKEN}`
        },
        body: JSON.stringify({
            'input_dir': EXTRACT_INPUT_DIR,
            'ibflow_path': EXTRACT_URL,
            'output_has_run_id': false,
            'delete_out_dir': true
        })
    });

    if (jsonResponse.data.status === 'ERROR') {
        res.sendStatus(400);
    }

    const jobId = jsonResponse.data.data.job_id;
    const outputDir = jsonResponse.data.data.output_folder;
    jsonResponse = await fetch(`${FLOW_URL_BASE}/jobs/status?job_id=${jobId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INSTABASE_TOKEN}`
        }
    });

    while (jsonResponse.data.state !== 'DONE') {
        jsonResponse = await fetch(`${FLOW_URL_BASE}/jobs/status?job_id=${jobId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${INSTABASE_TOKEN}`
            }
        });
    }

    jsonResponse = await fetch(`${FLOW_URL_BASE}/flow/export/review_batch`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INSTABASE_TOKEN}`
        },
        body: JSON.stringify({
            "path": outputDir
        })
    });

    if (jsonResponse.data.status === 'ERROR') {
        res.sendStatus(400);
    }

    const receiptData = jsonResponse.data.csv_text;
    console.log(receiptData);
});

app.get('/getInventory', function(req,res){
    res.json(users.get(req.token).inventory);
    res.end();
});

app.get('/getReceipts', function(req,res){
    res.json(users.get(req.token).receipts);
    res.end();
});

app.use('/img/',express.static(__dirname + '/img/'));
app.listen(port, () => console.log('Listening on port ' + port));
