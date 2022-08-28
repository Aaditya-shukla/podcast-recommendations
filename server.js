const express = require('express');
const spacyNLP = require("spacy-nlp");
const cors = require('cors')
process.env.SE_PY2=true
// default port 6466
// start the server with the python client that exposes spacyIO (or use an existing socketIO server at IOPORT)
var serverPromise = spacyNLP.server({ port: 6466 });

const routes = require("./routes/api-routes");
require("./redis")
const app = express()
app.use(express.json())
app.use(cors())

app.use('/', routes)





app.get('/', function (req, res) {
    res.send('Hello World')
})

app.listen(5000, (err, response) => {
    if (err) {
        console.log("Server error ", err)
    } else {
        console.log("Server is running at 3000")
    }
})

