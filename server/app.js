var express = require('express');
var app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const spawn = require("child_process").spawn;
const port = 3002;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/score', function(req, res){
/*  const pythonProcess = spawn('python3',["./score.py", req.body.user.username, req.body.user.url]);
  pythonProcess.stdout.on('data', function(data) {
    res.send({username: data.toString()});  
  })*/
  console.log(req.body);
});

//app.listen(port, () => console.log(`listening on port ${port}!`));
app.listen(port);

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(8080);
console.log(`listening on port ${port}!`);
