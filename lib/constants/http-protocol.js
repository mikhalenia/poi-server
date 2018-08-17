const {status, message} = require('./status');

const httpStatus = {
  [status.SUCCESS]: 200,
  [status.POINT_SUCCESSFUL_SAVED]: 201,
  [status.CATEGORY_SUCCESSFUL_SAVED]: 201,
  [status.POINT_SUCCESSFUL_UPDATED]: 200,
  [status.INCORRECT_CATEGORY_NAME]: 400,
  [status.DB_CONNECTION_FAILED]: 500,
  [status.DB_QUERY_FAILED]: 500,
  [status.UNKNOWN_ERROR]: 500,
  [status.CATEGORY_DUPLICATE]: 409,
  [status.CATEGORY_NOT_EXISTS]: 400,
  [status.INCORRECT_BODY]: 400,
  [status.INCORRECT_CATEGORY_ID]: 400,
  [status.INCORRECT_POINT_NAME]: 400,
  [status.INCORRECT_POINT_ADDRESS]: 400,
  [status.INCORRECT_POINT_GPS]: 400,
  [status.POINT_DUPLICATE]: 400,
  [status.INCORRECT_POINT_ID]: 400,
  [status.POINT_NOT_EXISTS]: 400,
  [status.POINT_DUPLICATE_UPDATE]: 400,
  [status.INVALID_PARAM_SENT]: 500
};

const objectPath = {
  'POINT': '/point',
  'CATEGORY': '/category'
};

module.exports = {
  status,
  message,
  httpStatus,
  objectPath
};