const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')

const app = express()
app.use(bodyParser.json())

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 204
  }
app.use(cors(corsOptions))

app.listen(8000, ()=> { console.log("Server started!")});

app.route('/api/customers').get((req, res) => {
    res.send([{id: 1, name: "Joe"}, {id: 2, name: "Mike"}, {id:3, name: "George"}]        
    );
});

app.route('/api/customers/:id').get((req,res) => {   
    
    const id = req.params['id'];
    var customerName;

    if(id == 1){
        customerName = "Joe";
    }
    if(id == 2){
        customerName = "Mike";
    }
    if(id == 3){
        customerName = "George";
    }

    res.send(
        { id: id, name: customerName }
    );
})

app.route('/api/customers').post((req, res) => {
    res.send(201, req.body);
});

app.route('/api/customers/:customer').put((req, res) => {
    res.send(200, req.body);
});

app.route('/api/customers/:customer').delete((req, res) => {
    res.sendStatus(204);
});