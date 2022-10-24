// Admin route'as su registracija ir autorizuotu prisijungimu

const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { databaseConfig, jwtSecret } = require('../config');
const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

router.post('/register', async (request, response) => {
  let registerData = request.body;

  try {
    registerData = await registerSchema.validateAsync(registerData);
  } catch (error) {
    return response.status(400).send({ error: 'Missing required field information' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(registerData.password);
    registerData.password = hashedPassword;

    const con = await mysql.createConnection(databaseConfig);
    const [databaseResponse] = await con.query('INSERT INTO admin SET ?', [registerData]);

    con.end();
    response.send({ message: 'Account created!' });
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Please try again' });
  }

});

router.post('/login', async (request, response) => {
  let loginData = request.body;

  try {
    loginData = await loginSchema.validateAsync(loginData);
  } catch (error) {
    return response.status(400).send({ error: 'Wrong username or password. Please try again' });
  }

  try {
    const con = await mysql.createConnection(databaseConfig);
    const [admin] = await con.query('SELECT password, id FROM admin WHERE username = ?', [loginData.username]);

    con.end();

    if (!admin.length) {
      return response.status(400).send({ error: 'Wrong username or password. Please try again' });
    }

    const isPasswordValid = bcrypt.compareSync(loginData.password, admin[0].password);

    if (!isPasswordValid) {
      return response.status(400).send({ error: 'Wrong username or password. Please try again' });
    }

    const token = jwt.sign({ admin_id: admin[0].id }, jwtSecret);

    console.log(token, admin[0].id);

    response.send({ token: token, admin_id: admin[0].id });
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Please try again' });
  }

});

router.get('/users', async (request, response) => {
  try {
    const con = await mysql.createConnection(databaseConfig);
    const [users] = await con.query('SELECT * FROM admin');

    con.end();
    response.send(users);
  } catch (error) {
    response.status(500).send({ error: 'Unexpected error. Try again'});
    console.log(error);
  }

});

module.exports = router;