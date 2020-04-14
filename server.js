const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')

const app = express()
app.use(bodyParser.json())

var corsOptions = {
    origin: 'http://www.customers.com',
    optionsSuccessStatus: 204
  }
app.use(cors(corsOptions))

app.listen(8000, ()=> { console.log("Server started!")});

app.route('/api/customers').get((req, res) => {
    res.send(
        {
            customers: [{name: "Joe"}, {name: "Mike"}, {name: "George"}]
        }
    );
});

app.route('/api/customers/:customer').get((req,res) => {
    
    const customerName = req.params['customer'];
    res.send(
        { name: customerName }
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