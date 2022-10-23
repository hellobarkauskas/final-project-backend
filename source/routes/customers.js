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
    const [customers] = await con.query('SELECT customers.id, customers.name, customers.surname, customers.email, customers.age, admin.username AS admin_id FROM customers LEFT JOIN admin ON customers.admin_id = admin.id WHERE customers.admin_id = ?', [adminId]);

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

router.delete('/:customerId', async (request, response) => {
  const customerId = request.params.customerId;

  try {
    const con = await mysql.createConnection(databaseConfig);
    const [databaseResponse] = await con.query('DELETE FROM customers WHERE id = ?', [customerId]);

    con.end();
    response.send(databaseResponse);
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Try again' });
  }

});

router.patch('/:customerId', async (request, response) => {
  const customerId = request.params.customerId;
  const adminInput = request.body;

  try {
    const con = await mysql.createConnection(databaseConfig);
    const [databaseResponse] = await con.query('UPDATE customers SET ? WHERE id = ?', [adminInput, customerId]);

    con.end();
    response.send(databaseResponse);
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Try again' });
  }

});

module.exports = router;