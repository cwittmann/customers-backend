const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mysql = require('mysql'); 

const app = express()
app.use(bodyParser.json())

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 204
  }
app.use(cors(corsOptions))

const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    database: "customers",
    user: "admin",
    password: "cW53a8x6"
});

connection.connect(function(error) {
    if (error) throw error;

    console.log("Connected to MySQL database!");
  });

app.listen(8000, ()=> { console.log("Server started!")});

app.route('/api/customers').get((req, res) => {
    
    sql = "SELECT * FROM customer;";

    connection.query(sql, function(error,result) {
        if (error) throw error;

        resultJSON = JSON.stringify(result);        
        res.send(resultJSON);
    });
});

app.route('/api/customers/:id').get((req,res) => {   
    
    const id = req.params['id'];
    sql = 'SELECT * FROM customer WHERE id = "' + id + '" LIMIT 1;';    

    connection.query(sql, function(error,result) {
        if (error) throw error;

        resultJSON = JSON.stringify(result);                
        res.send(resultJSON);
    });
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