import test from 'node:test';
import assert from 'node:assert/strict';

import authController from '../src/controllers/auth.controller.js';
import userModel from '../src/models/user.model.js';

test('registerUserController uses a trusted bootstrap path for admin provisioning and ignores role from the request body', async () => {
  const originalFindOne = userModel.findOne;
  const originalCreate = userModel.create;
  const createdPayloads = [];

  userModel.findOne = async () => null;
  userModel.create = async (payload) => {
    createdPayloads.push(payload);
    return { _id: 'user-1', ...payload };
  };

  const createRes = () => ({
    statusCode: null,
    cookie() {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  });

  const originalBootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.ADMIN_BOOTSTRAP_TOKEN = 'bootstrap-secret';
  process.env.JWT_SECRET = 'test-secret';

  try {
    await authController.registerUserController(
      {
        body: {
          username: 'alice',
          email: 'alice@example.com',
          password: 'StrongPass1!',
          role: 'admin'
        },
        headers: {}
      },
      createRes()
    );

    assert.equal(createdPayloads[0].role, 'user');

    await authController.registerUserController(
      {
        body: {
          username: 'bob',
          email: 'bob@example.com',
          password: 'StrongPass1!',
          role: 'admin'
        },
        headers: {
          'x-admin-bootstrap-token': 'bootstrap-secret'
        }
      },
      createRes()
    );

    assert.equal(createdPayloads[1].role, 'admin');
  } finally {
    userModel.findOne = originalFindOne;
    userModel.create = originalCreate;
    if (originalBootstrapToken === undefined) {
      delete process.env.ADMIN_BOOTSTRAP_TOKEN;
    } else {
      process.env.ADMIN_BOOTSTRAP_TOKEN = originalBootstrapToken;
    }

    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }
});
