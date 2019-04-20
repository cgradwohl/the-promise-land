/**
 * Write a function called register to create a new user in our system. 
 * 
 * The required values to create a new user are email, password & name,
 * and are expected to be in the request body. 
 * 
 * req = {
 *   body: {
 *     email,
 *     password,
 *     name,
 *   }
 * }
 * 
 * This function also needs to create a chat user and a chat channel in
 * our dependant chat system. A chat user is required to create a chat
 * channel.
 * 
 * Finally the function should return a promise containing the newly
 * created user.
 * 
 * Please show how you would create the user given an incoming HTTP request.
 */

import {
  query, // query($query) -> Promise([ row, row, ... ])
} from './database';

import {
  createUser, // createUser($object) -> Promise($result)
  updateUser, // updateUser($id, $object) -> Promise($result)
} from './user';

import {
  createChatUser, // createChatUser($userId, $userName) -> Promise({ id })
  createChatChannel, // createChatChannel($chatUserId) -> Promise({ id, url })
} from './chat';

import Bcrypt from 'bcrypt'; // hashing utility lib
import Boom from 'boom'; // http error utility lib
import Joi from 'joi'; // schema validation utility lib

export const register = async (req) => {
  // 1. start transaction a mySQL transaction
  /**
   * MySQL transaction allows you to execute a set of MySQL 
   * operations to ensure that the database never contains 
   * the result of partial operations. In a set of operations, 
   * if one of them fails, the rollback occurs to restore the 
   * database to its original state. If no error occurs, the 
   * entire set of statements is committed to the database.
   * 
   * To start a transaction, you use the START TRANSACTION 
   * statement.
   */
  await query('START TRANSACTION');
  
  // 2. validate the request data
  const validation = Joi.validate(
    {
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().required(),
    },
    req.body,
  );

  if (validation.error) {
    throw Boom.badRequest(
      'One or more values are invalid',
      validation.error.details,
    );
  }

  // 3. validate there is no existing user
  const existing = await query('SELECT COUNT(*) FROM users WHERE email = ? LIMIT 1', [req.body.email]);

  if (existing.length > 0) {
    throw Boom.badRequest('A user already exists with that email');
  }


  // 4. encrypt the data
  const encrypted = await Bcrypt.hash(req.body.password, 10);

  // 5. create user in our system
  let user = await createUser({
    email: req.body.email,
    password: encrypted,
    name: req.body.name,
  });

  /**
   * try catch method for async await :)
   */
  try {
    const chatUser = await createChatUser(user.id, user.name);
    const chatChannel = await createChatChannel(chatUser.id);

    // 6. we need a way to connect our user to our dependant chat system user
    user = await updateUser(
      user.id,
      {
        channel: chatChannel.url,
      },
    );

    /**
     * To commit the current transaction and make its changes 
     * permanent, you use the COMMIT statement.
     */
    await query('COMMIT');
  } catch (error) {

    /**
     * To roll back the current transaction and cancel its 
     * changes, you use the ROLLBACK statement.
     */
    await query('ROLLBACK');

    throw Boom.badImplementation(error.message);
  }

  return user;
};