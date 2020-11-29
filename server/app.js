var express = require('express');
var app = express();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, './uploads')
  },
  filename: (req, file, cb)=>{
    //set custom username here
    //can also use req.body freely
    cb(null, file.originalname + '.wav')} 
})
var upload = multer({storage: storage});

const cors = require('cors');
const bodyParser = require('body-parser');
const spawn = require("child_process").spawn;
const port = 3002;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/score', upload.single("audio_data"), function(req, res){
  const pythonProcess = spawn('python3',["./score.py", req.body.username, req.file.path]);
  pythonProcess.stdout.on('data', function(data) {
    res.send({username: data.toString()});  
  })
  console.log(req.file);
});

app.listen(port);

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(8080);
console.log(`listening on port ${port}!`);
