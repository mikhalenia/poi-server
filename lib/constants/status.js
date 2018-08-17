const status = {
  'POINT_SUCCESSFUL_SAVED': 1000,
  'CATEGORY_SUCCESSFUL_SAVED': 1001,
  'POINT_SUCCESSFUL_UPDATED': 1002,
  'SUCCESS': 1003,
  'DB_CONNECTION_FAILED': 2001,
  'DB_QUERY_FAILED': 2002,
  'INCORRECT_BODY': 2003,
  'INCORRECT_CATEGORY_NAME': 2004,
  'CATEGORY_DUPLICATE': 2005,
  'CATEGORY_NOT_EXISTS': 2006,
  'INCORRECT_POINT_NAME': 2007,
  'INCORRECT_POINT_ADDRESS': 2008,
  'INCORRECT_POINT_GPS': 2009,
  'INCORRECT_CATEGORY_ID': 2010,
  'POINT_DUPLICATE': 2011,
  'INCORRECT_POINT_ID': 2012,
  'POINT_NOT_EXISTS': 2013,
  'POINT_DUPLICATE_UPDATE': 2014,
  'INVALID_PARAM_SENT': 2015,
  'UNKNOWN_ERROR': 0
};

const message = {
  [status.POINT_SUCCESSFUL_SAVED]: 'Point was successfully saved',
  [status.CATEGORY_SUCCESSFUL_SAVED]: 'Category was successfully saved',
  [status.POINT_SUCCESSFUL_UPDATED]: 'Point was successfully updated',
  [status.SUCCESS]: 'Ok',
  [status.UNKNOWN_ERROR]: 'Unknown error',
  [status.DB_CONNECTION_FAILED]: 'DB Connection failed',
  [status.DB_QUERY_FAILED]: 'DB Query failed',
  [status.INCORRECT_BODY]: 'Incorrect body',
  [status.INCORRECT_CATEGORY_NAME]: 'Incorrect name of category',
  [status.CATEGORY_DUPLICATE]: 'This category is already exists',
  [status.CATEGORY_NOT_EXISTS]: 'Category is not exists',
  [status.INCORRECT_POINT_NAME]: 'Incorrect name of point',
  [status.INCORRECT_POINT_ADDRESS]: 'Incorrect address of point',
  [status.INCORRECT_POINT_GPS]: 'Incorrect gps coordinates of point',
  [status.INCORRECT_CATEGORY_ID]: 'Incorrect category_id of point',
  [status.POINT_DUPLICATE]: 'This point is already exists',
  [status.INCORRECT_POINT_ID]: 'Incorrect point_id',
  [status.POINT_NOT_EXISTS]: 'Point is not exists',
  [status.POINT_DUPLICATE_UPDATE]: 'Point with the same fields is already exists.',
  [status.INVALID_PARAM_SENT]: 'Something went wrong. Invalid parameters sent.'
};

module.exports = {
  status,
  message
};