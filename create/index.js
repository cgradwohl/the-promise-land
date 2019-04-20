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

import Bcrypt from 'bcrypt';
import Boom from 'boom';
import Joi from 'joi';

/**
 * The goal of register(req) is to create a new member within our system
 * 
 * The required values to create a new user are email, password & name
 * 
 * Once a user is created in our system, we also need to create a user
 * and a channel in our dependent Chat system. A chat user is required
 * to create a chat channel.
 * 
 * Please show how you would create the user given an incoming HTTP request
 * and return a promise containing the newly created user.
 * 
 * req = {
 *  body: {
 *    email,
 *    password,
 *    name,
 *  }
 * }
 */

export const register = async (req) => {
  await query('START TRANSACTION');
  
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

  const existing = await query('SELECT COUNT(*) FROM users WHERE email = ? LIMIT 1', [req.body.email]);

  if (existing.length > 0) {
    throw Boom.badRequest('A user already exists with that email');
  }

  const encrypted = await Bcrypt.hash(req.body.password, 10);

  let user = await createUser({
    email: req.body.email,
    password: encrypted,
    name: req.body.name,
  });

  try {
    const chatUser = await createChatUser(user.id, user.name);
    const chatChannel = await createChatChannel(chatUser.id);

    user = await updateUser(
      user.id,
      {
        channel: chatChannel.url,
      },
    );

    await query('COMMIT');
  } catch (error) {
    await query('ROLLBACK');

    throw Boom.badImplementation(error.message);
  }

  return user;
};