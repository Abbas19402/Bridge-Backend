const express = require("express");
const Joi = require("joi");
const joi = require('joi')

const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;




//get a list of all the records.
recordRoutes.route("/user").get(function (req, res) {
  let db_connect = dbo.getDb("Bridge");
  db_connect
    .collection("Users")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

//get a single record by id
recordRoutes.route("/user/:id").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("Users").findOne(myquery, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

// create a new record.
recordRoutes.route("/user/create").post(function (req, response) {
    let db_connect = dbo.getDb("Bridge");
    
    db_connect.collection("Users").find({"phone": req.body.phone, "name": req.body.name}).toArray((err , data) => {
        if(data.length == 0) {
            console.log("user hasnt been created yet!!");
            let user = {
                name: req.body.name,
                age: req.body.age,
                phone: req.body.phone,
                email: req.body.email
            };
        
            const schema = joi.object({
                name: Joi.string().required(),
                age: Joi.number().required(),
                phone: Joi.string().required(),
                email: Joi.string().email().required()
            })
        
            const { error , value } = schema.validate(user)
            if(error) {
                console.log('Validation Error');
                let responseObj = {
                    success: false,
                    data:value,
                    message: error.message,
                };
                console.log(res);
                response.json(responseObj);
                response.status(403);
            }
            db_connect.collection("Users").insertOne(user, function (err, res) {
                if (err) {
                    console.log("Inserting erroer");
                    throw err;
                }
                let responseObj = {
                    success: true,
                    data: value,
                    message: "User created succesfully",
                };
                response.json(responseObj);
                response.status(200);
            });
        } else {
            console.log("user has already been created!!");
            response.json({
                message: 'User with respective credentials already Exists!!',
                success: false
            })
            response.status(403)
            console.log(data);
        }
    })
});

// update a record by id.
recordRoutes.route("/update/:id").post(function (req, response) {
    let db_connect = dbo.getDb("Bridge");
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
      $set: {
        name: req.body.name,
        age: req.body.age,
        phone: req.body.phone,
        email: req.body.email,
    },
    };
    db_connect
        .collection("Users")
        .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            response.json(res);
        });
    });
    

// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
  let db_connect = dbo.getDb('Bridge');
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("Users").deleteOne(myquery, function (err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    response.json(obj);
  });
 });

module.exports = recordRoutes;
