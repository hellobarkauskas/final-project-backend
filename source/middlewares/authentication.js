// Token autorizacijos konfigūracija

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const authorize = (request, response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return response.status(400).send({ error: 'Token is missing' });
  }

  const token = authorization.split(' ')[1];

  try {
    const tokenData = jwt.verify(token, jwtSecret);

    request.admin = {
      admin_id: tokenData.admin_id,
    }

    console.log(request.admin);

    next();
  } catch (error) {
    response.status(401).send({ error: 'Access unauthorized' });
  }
};

module.exports = { authorize }