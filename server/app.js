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
  const pythonProcess = spawn('python',["./score.py", req.body.user.username]);
  pythonProcess.stdout.on('data', function(data) {
    res.send({username :data.toString()});  
  })
});

app.listen(port, () => console.log(`listening on port ${port}!`));
