// Route'as į customers sąrašą pagal autorizuotą prisijungusį admin_id'

const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const { databaseConfig } = require('../config');
const { authorize } = require('../middlewares/authentication');
const router = express.Router();

const newCustomerSchema = Joi.object({
  name: Joi.string().required(),
  surname: Joi.string().required(),
  email: Joi.string().required(),
  age: Joi.number().required(),
  admin_id: Joi.number().required()
});

router.get('/', authorize, async (request, response) => {
  try {
    const adminId = request.admin.admin_id;
    const con = await mysql.createConnection(databaseConfig);
    const [customers] = await con.query('SELECT * FROM customers WHERE admin_id = ?', [adminId]);

    con.end();
    response.send(customers);
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Try again' });
  }

});

router.post('/add', authorize, async (request, response) => {
  let addCustomerData = request.body;

  try {
    addCustomerData = await newCustomerSchema.validateAsync(addCustomerData);

    const adminId = request.admin.admin_id;
    const con = await mysql.createConnection(databaseConfig);
    const [databaseResponse] = await con.query('INSERT INTO customers SET ?', [addCustomerData]);

    con.end();
    response.send({ message: 'Customer added' });
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Try again' });
  }

});

module.exports = router;