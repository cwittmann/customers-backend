const cors = require("cors");
const express = require("express");
const session = require("express-session");
const app = new express();
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local").Strategy;
const passwordHash = require("password-hash");
const mysql = require("mysql");

passport.use(
  new LocalStrategy(function (username, password, done) {
    sql = 'SELECT * FROM users WHERE userName = "' + username + '";';

    connection.query(sql, function (error, usersResult) {
      if (error) {
        console.log(error);
      }

      usersJSON = JSON.stringify(usersResult);
      users = JSON.parse(usersJSON);

      if (users.length === 0) {
        return done("unauthorized access", false);
      }

      user = users[0];
      result = passwordHash.verify(password, user.password);

      if (result) {
        return done(null, username);
      } else {
        return done("unauthorized access", false);
      }
    });
  })
);

passport.serializeUser(function (user, done) {
  if (user) done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

app.use(session({ secret: "anything", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.json());

const auth = () => {
  return (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
      if (error) res.status(400).json({ statusCode: 200, message: error });
      req.login(user, function (error) {
        if (error) return next(error);
        next();
      });
    })(req, res, next);
  };
};

var corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  database: "customers",
  user: "admin",
  password: "cW53a8x6",
});

connection.connect(function (error) {
  if (error) throw error;

  console.log("Connected to MySQL database!");
});

const isLoggedIn = (req, res, next) => {
  /* if (req.isAuthenticated()) {
    return next();
  } */

  return next();

  return res
    .status(400)
    .json({ statusCode: 400, message: "not authenticated" });
};

app.listen(8000, () => {
  console.log("Server started!");
});

// AUTHENTICATE
app.post("/api/authenticate", auth(), (req, res) => {
  res.status(200).json({ statusCode: 200, user: req.user });
});

// CHECK CONNECTION
app.get("/api/connect", (req, res) => {
  res.status(200).json({ statusCode: 200 });
});

// CUSTOMERS

app.get("/api/customers", isLoggedIn, (req, res) => {
  sql = "SELECT * FROM customer;";

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/customers/:id").get((req, res) => {
  const id = req.params["id"];
  sql = 'SELECT * FROM customer WHERE id = "' + id + '" LIMIT 1;';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/customers").post((req, res) => {
  let customer = req.body;
  let birthDateDate = new Date(customer.birthDate);
  let birthDateString = birthDateDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");
  let timestamp = new Date();
  let timestampString = timestamp.toISOString().slice(0, 10).replace("T", " ");

  sql =
    'INSERT INTO customer VALUES("' +
    customer.id +
    '", "' +
    customer.firstName +
    '", "' +
    customer.lastName +
    '", "' +
    customer.title +
    '", "' +
    customer.gender +
    '", "' +
    customer.job +
    '", "' +
    birthDateString +
    '", "' +
    customer.streetAddress +
    '", "' +
    customer.postalCode +
    '", "' +
    customer.city +
    '", "' +
    customer.country +
    '", "' +
    customer.currency +
    '", "' +
    customer.phone +
    '", "' +
    customer.eMail +
    '", "' +
    timestampString +
    '");';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/customers/:customer").put((req, res) => {
  let customer = req.body;
  let birthDateDate = new Date(customer.birthDate);
  let birthDateString = birthDateDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");

  sql =
    'UPDATE customer SET firstName="' +
    customer.firstName +
    '", lastName="' +
    customer.lastName +
    '", title="' +
    customer.title +
    '", gender="' +
    customer.gender +
    '", job="' +
    customer.job +
    '", birthDate="' +
    birthDateString +
    '", streetAddress="' +
    customer.streetAddress +
    '", postalCode="' +
    customer.postalCode +
    '", city="' +
    customer.city +
    '", country="' +
    customer.country +
    '", currency="' +
    customer.currency +
    '", phone="' +
    customer.phone +
    '", eMail="' +
    customer.eMail +
    '" WHERE id="' +
    customer.id +
    '";';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/customers/:id").delete((req, res) => {
  const id = req.params["id"];

  sql = 'DELETE FROM customer WHERE id="' + id + '";';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    res.sendStatus(204);
  });
});

// ORDERS

app.route("/api/orders").get((req, res) => {
  sql = "SELECT * FROM orders;";

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/orders/:id").get((req, res) => {
  const id = req.params["id"];
  sql = 'SELECT * FROM orders WHERE id = "' + id + '" LIMIT 1;';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/ordersOfCustomer/:customerId").get((req, res) => {
  const customerId = req.params["customerId"];
  sql = 'SELECT * FROM orders WHERE customerId = "' + customerId + '";';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/orders").post((req, res) => {
  let order = req.body;
  let currentDate = new Date();
  let currentDateString = currentDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");

  sql =
    'INSERT INTO orders VALUES("' +
    order.id +
    '", "' +
    order.customerId +
    '", "' +
    order.productId +
    '", "' +
    currentDateString +
    '", "' +
    order.status +
    '", "' +
    order.amount +
    '", "' +
    currentDateString +
    '");';
  console.log(sql);

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/orders/:order").put((req, res) => {
  let order = req.body;
  let orderDate = new Date(order.date);
  let orderDateString = orderDate.toISOString().slice(0, 10).replace("T", " ");
  let currentDate = new Date();
  let currentDateString = currentDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");

  sql =
    'UPDATE orders SET customerId="' +
    order.customerId +
    '", productId="' +
    order.productId +
    '", date="' +
    orderDateString +
    '", status="' +
    order.status +
    '", amount="' +
    order.amount +
    '", timestamp="' +
    currentDateString +
    '" WHERE id="' +
    order.id +
    '";';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/orders/:id").delete((req, res) => {
  const id = req.params["id"];

  sql = 'DELETE FROM orders WHERE id="' + id + '";';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    res.sendStatus(204);
  });
});

// PRODUCTS

app.route("/api/products").get((req, res) => {
  sql = "SELECT * FROM product;";

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

app.route("/api/products/:id").get((req, res) => {
  const id = req.params["id"];
  sql = 'SELECT * FROM product WHERE id = "' + id + '" LIMIT 1;';

  connection.query(sql, function (error, result) {
    if (error) throw error;

    resultJSON = JSON.stringify(result);
    res.send(resultJSON);
  });
});

/* app.route('/api/generateOrders').get((req, res) => {
    sqlCustomer = "SELECT * FROM customer;";
    sqlProduct = "SELECT * FROM product;";

    orders = [];

    connection.query(sqlCustomer, function(error,customerResult) {
        if (error) throw error;

        customersJSON = JSON.stringify(customerResult);        
        customers = JSON.parse(customersJSON);

        connection.query(sqlProduct, function(error,productResult) {
            if (error) throw error;
    
            productsJSON = JSON.stringify(productResult);        
            products = JSON.parse(productsJSON);
            
            for (var i = 0; i < customers.length; i++){
                console.log(i);
                const numberOfProducts = Math.floor(Math.random() * Math.floor(5));      
      
                var customer = customers[i];

                for(var j = 0; j < numberOfProducts; j++){                   
                  const id = uuidv4();
                  const status = Math.floor(Math.random() * Math.floor(4));
                  const amount = Math.floor(Math.random() * Math.floor(20));
      
                  let currentDate = new Date();    
                  let currentDateString = currentDate.toISOString().slice(0, 10).replace('T', ' ');

                  const productIndex = Math.floor(Math.random() * Math.floor(1000));
                  const product = products[productIndex];
                  const order = {id: id, customerId: customer.id, productId: product.id, date: currentDateString, status: status, amount: amount, timestamp: currentDateString};        
                  orders.push(order);
                }
            }

            for (var i = 0; i < orders.length; i++){
                var order = orders[i];

                sql = 'INSERT INTO orders VALUES("' + order.id + '", "' + order.customerId + '", "' + order.productId + '", "' + order.date + '", "' + order.status + '", "' + order.amount + '", "' + order.timestamp + '");'
                console.log(sql);

                connection.query(sql, function(error,result) {
                    if (error) throw error;           
                    
                }); 
                
            }
        });
    });    
}); */
