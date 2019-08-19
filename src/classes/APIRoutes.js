let compression = require('compression');
let bodyParser = require('body-parser');
let Key = require('../models/Key.js');

let API_BASE_PATH = '/api';

let statusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  REDIRECT: 302,
  MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502
};

class APIRoutes {
  constructor(api) {
    api.use(compression());
    api.use(
      bodyParser.json({
        limit: '50mb'
      })
    );

    this.api = api;

    this.defineRoutes();
  }

  defineRoutes() {
    let api = this.api;

    api.post('/activate/:key', (req, res, next) => {
      Key.findOne(
        {
          key: req.params.key
        },
        (err, key) => {
          if (err) {
            return res.status(statusCodes.SERVER_ERROR).json({
              message:
                'There was an error updating the key with your information. Please reset and try again.',
              errors: [
                {
                  path: API_BASE_PATH + req.path
                }
              ]
            });
          } else if (key) {
            if (
              !key.activated ||
              (key.machineId === req.body.machineId && key.activated)
            ) {
              next();
            } else if (key.machineId !== req.body.machineId) {
              return res.status(statusCodes.FORBIDDEN).json({
                message:
                  'This key has already been activated to another device.',
                errors: [
                  {
                    path: API_BASE_PATH + req.path
                  }
                ]
              });
            } else {
              return res.status(statusCodes.SERVER_ERROR).json({
                message: 'Error activating key, please contact developers.',
                errors: [
                  {
                    path: API_BASE_PATH + req.path
                  }
                ]
              });
            }
          } else {
            return res.status(statusCodes.NOT_FOUND).json({
              message: 'Key not found',
              errors: [
                {
                  path: API_BASE_PATH + req.path
                }
              ]
            });
          }
        }
      );
    });
    api.post('/activate/:key', (req, res) => {
      console.log(req.body);
      Key.findOneAndUpdate(
        {
          key: req.params.key
        },
        {
          $set: {
            activated: true,
            machineId: req.body.machineId
          }
        },
        {
          new: true
        },
        (err, key) => {
          if (err) {
            return res.status(statusCodes.SERVER_ERROR).json({
              message:
                'There was an error updating the key with your information. Please try again or reset the key.',
              errors: [
                {
                  path: API_BASE_PATH + req.path
                }
              ]
            });
          } else {
            if (
              key.activated &&
              key.machineId &&
              key.machineId === req.body.machineId
            ) {
              return res.status(statusCodes.OK).json({
                message: 'Key activated!',
                key: req.params.key,
                errors: null
              });
            } else {
              return res.status(statusCodes.SERVER_ERROR).json({
                message:
                  'There was an error updating the key with your information. Please try again or reset the key.',
                errors: [
                  {
                    path: API_BASE_PATH + req.path
                  }
                ]
              });
            }
          }
        }
      );
    });
    api.all('/activate/:key', (req, res) => {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: 'Invalid method',
        errors: [
          {
            path: API_BASE_PATH + req.path
          }
        ]
      });
    });

    api.post('/deactivate/:key', (req, res, next) => {
      Key.findOne(
        {
          key: req.params.key
        },
        (err, key) => {
          if (err) {
            return res.status(statusCodes.SERVER_ERROR).json({
              message:
                'There was an error deactivating your key, please try again',
              errors: [
                {
                  path: API_BASE_PATH + req.path
                }
              ]
            });
          } else if (key) {
            if (key.activated && key.machineId === req.body.machineId) {
              next();
            } else if (!key.activated) {
              return res.status(statusCodes.BAD_REQUEST).json({
                message: 'This key is currently not activated.',
                errors: [
                  {
                    path: API_BASE_PATH + req.path
                  }
                ]
              });
            } else if (key.machineId !== req.body.machineId) {
              return res.status(statusCodes.FORBIDDEN).json({
                message: 'This key is currently activated to another device.',
                errors: [
                  {
                    path: API_BASE_PATH + req.path
                  }
                ]
              });
            } else {
              return res.status(statusCodes.SERVER_ERROR).json({
                message: 'Error activating key, please contact developers.',
                errors: [
                  {
                    path: API_BASE_PATH + req.path
                  }
                ]
              });
            }
          } else {
            return res.status(statusCodes.NOT_FOUND).json({
              message: 'Key not found',
              errors: [
                {
                  path: API_BASE_PATH + req.path
                }
              ]
            });
          }
        }
      );
    });
    api.post('/deactivate/:key', (req, res) => {
      Key.findOneAndUpdate(
        {
          key: req.params.key
        },
        {
          $set: {
            activated: false,
            machineId: undefined
          }
        },
        {
          new: true
        },
        (err, key) => {
          if (err) {
            return res.status(statusCodes.SERVER_ERROR).json({
              message:
                'There was an error deactivating your key, please try again',
              errors: [
                {
                  path: API_BASE_PATH + req.path
                }
              ]
            });
          } else {
            return res.status(statusCodes.OK).json({
              message: 'Key deactivated!',
              errors: null
            });
          }
        }
      );
    });
    api.all('/deactivate/:key', (req, res) => {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: 'Invalid method',
        errors: [
          {
            path: API_BASE_PATH + req.path
          }
        ]
      });
    });

    api.all('*', (req, res) => {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: API_BASE_PATH + req.path + ' is an invalid path',
        errors: [
          {
            path: API_BASE_PATH + req.path
          }
        ]
      });
    });
  }
}

module.exports = APIRoutes;
