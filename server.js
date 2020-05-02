const cors = require("cors");
const express = require("express");
const session = require("express-session");
const app = new express();
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local").Strategy;
const passwordHash = require("password-hash");
const Pool = require("pg").Pool;

/* const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "customers",
  password: "cW2600bx",
  port: 3000,
}); */

const pool = new Pool({
  user: "iwnxcavlhdnosl",
  host: "ec2-52-71-85-210.compute-1.amazonaws.com",
  database: "d9h2fi140j4pe3",
  password: "c319701958a8a75ae9d5ea7eae7e13db92367a25538dd9f1dfe2722968b65049",
  port: 5432,
});

pool.on("error", function (error) {
  console.log(error.message, error.stack);
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username],
      (error, usersResult) => {
        if (error) {
          console.log(error);
        }

        if (usersResult.rows.length === 0) {
          return done("unauthorized access", false);
        }

        user = usersResult.rows[0];
        result = passwordHash.verify(password, user.password);

        if (result) {
          return done(null, user.id);
        } else {
          return done("unauthorized access", false);
        }
      }
    );
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

// REGISTER
app.post("/api/register", (req, res) => {
  let user = req.body;
  hashPassword = passwordHash.generate(user.password);

  pool.query(
    "INSERT INTO users VALUES($1, $2, $3, $4, $5, $6)",
    [
      user.id,
      user.firstname,
      user.lastname,
      user.username,
      hashPassword,
      user.email,
    ],
    function (error, result) {
      if (error) throw error;

      resultJSON = JSON.stringify(result);
      res.send(resultJSON);
    }
  );
});

// CHECK CONNECTION
app.get("/api/connect", (req, res) => {
  res.status(200).json({ statusCode: 200 });
});

// CUSTOMERS

app.get("/api/customers", isLoggedIn, (req, res) => {
  pool.query("SELECT * FROM customer", function (error, result) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

app.route("/api/customers/:id").get((req, res) => {
  const id = req.params["id"];
  pool.query("SELECT * FROM customer WHERE id=$1 LIMIT 1", [id], function (
    error,
    result
  ) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

app.route("/api/customers").post((req, res) => {
  let customer = req.body;
  let birthdateDate = new Date(customer.birthdate);
  let birthdateString = birthdateDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");
  let timestamp = new Date();
  let timestampString = timestamp.toISOString().slice(0, 10).replace("T", " ");

  pool.query(
    "INSERT INTO customer VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
    [
      customer.id,
      customer.firstname,
      customer.lastname,
      customer.title,
      customer.gender,
      customer.job,
      birthdateString,
      customer.streetaddress,
      customer.postalcode,
      customer.city,
      customer.country,
      customer.currency,
      customer.phone,
      customer.email,
      timestampString,
    ],
    function (error, result) {
      if (error) throw error;

      res.status(200).send(result.rows);
    }
  );
});

app.route("/api/customers/:customer").put((req, res) => {
  let customer = req.body;
  let birthdateDate = new Date(customer.birthdate);
  let birthdateString = birthdateDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");
  let timestamp = new Date();
  let timestampString = timestamp.toISOString().slice(0, 10).replace("T", " ");

  pool.query(
    "UPDATE customer SET firstname=$1, lastname=$2, title=$3, gender=$4, job=$5, birthdate=$6, streetaddress=$7, postalcode=$8, city=$9, country=$10, currency=$11, phone=$12, email=$13, timestamp=$14 WHERE ID=$15",
    [
      customer.firstname,
      customer.lastname,
      customer.title,
      customer.gender,
      customer.job,
      birthdateString,
      customer.streetaddress,
      customer.postalcode,
      customer.city,
      customer.country,
      customer.currency,
      customer.phone,
      customer.email,
      timestampString,
      customer.id,
    ],
    function (error, result) {
      if (error) throw error;

      res.status(200).send(result.rows);
    }
  );
});

app.route("/api/customers/:id").delete((req, res) => {
  const id = req.params["id"];

  pool.query("DELETE FROM customer WHERE id=$1", [id], function (
    error,
    result
  ) {
    if (error) throw error;

    res.sendStatus(204);
  });
});

// ORDERS

app.route("/api/orders").get((req, res) => {
  pool.query("SELECT * FROM orders", function (error, result) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

app.route("/api/orders/:id").get((req, res) => {
  const id = req.params["id"];

  pool.query("SELECT * FROM orders WHERE id=$1 LIMIT 1", [id], function (
    error,
    result
  ) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

app.route("/api/ordersOfCustomer/:customerid").get((req, res) => {
  const customerid = req.params["customerid"];

  pool.query(
    'SELECT * FROM orders WHERE "customerid"=$1',
    [customerid],
    function (error, result) {
      if (error) throw error;

      res.status(200).send(result.rows);
    }
  );
});

app.route("/api/orders").post((req, res) => {
  let order = req.body;
  let currentDate = new Date();
  let currentDateString = currentDate
    .toISOString()
    .slice(0, 10)
    .replace("T", " ");

  pool.query(
    "INSERT INTO orders VALUES($1, $2, $3, $4, $5, $6, $7)",
    [
      order.id,
      order.customerid,
      order.productid,
      currentDateString,
      order.status,
      order.amount,
      currentDateString,
    ],
    function (error, result) {
      if (error) throw error;

      res.status(200).send(result.rows);
    }
  );
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

  pool.query(
    "UPDATE orders SET customerid=$1, productid=$2, date=$3, status=$4, amount=$5, timestamp=$6 WHERE id=$7",
    [
      order.customerid,
      order.productid,
      orderDateString,
      order.status,
      order.amount,
      currentDateString,
      order.id,
    ],
    function (error, result) {
      if (error) throw error;

      res.status(200).send(result.rows);
    }
  );
});

app.route("/api/orders/:id").delete((req, res) => {
  const id = req.params["id"];

  pool.query("DELETE FROM orders WHERE id=$1", [id], function (error, result) {
    if (error) throw error;

    res.sendStatus(204);
  });
});

// PRODUCTS

app.route("/api/products").get((req, res) => {
  pool.query("SELECT * FROM product", function (error, result) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

app.route("/api/products/:id").get((req, res) => {
  const id = req.params["id"];

  pool.query("SELECT * FROM product WHERE id=$1 LIMIT 1", [id], function (
    error,
    result
  ) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

// USERS

app.route("/api/users/:id").get((req, res) => {
  const id = req.params["id"];

  pool.query("SELECT * FROM users WHERE id=$1 LIMIT 1", [id], function (
    error,
    result
  ) {
    if (error) throw error;

    res.status(200).send(result.rows);
  });
});

/* app.route('/api/generateOrders').get((req, res) => {
    sqlCustomer = 'SELECT * FROM customer;';
    sqlProduct = 'SELECT * FROM product;';

    orders = [];

    pool.query(sqlCustomer, function(error,customerResult) {
        if (error) throw error;

        customersJSON = JSON.stringify(customerResult);        
        customers = JSON.parse(customersJSON);

        pool.query(sqlProduct, function(error,productResult) {
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
                  const order = {id: id, customerid: customer.id, productid: product.id, date: currentDateString, status: status, amount: amount, timestamp: currentDateString};        
                  orders.push(order);
                }
            }

            for (var i = 0; i < orders.length; i++){
                var order = orders[i];

                sql = 'INSERT INTO orders VALUES('' + order.id + '', '' + order.customerid + '', '' + order.productid + '', '' + order.date + '', '' + order.status + '', '' + order.amount + '', '' + order.timestamp + '');'
                console.log(sql);

                pool.query(sql, function(error,result) {
                    if (error) throw error;           
                    
                }); 
                
            }
        });
    });    
}); */
