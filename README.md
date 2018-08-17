## POI```(Point of interest)``` REST API server module

## Install:
```
npm install git+ssh://git@github.com:mikhalenia/poi-server.git
```

## Usage:
- Start http:// server
```
const PoiServer = require('poi-server');
PoiServer.getInstance().init_http();
```
- HTTP:
```
# Send POST to /category to add some new category of points. Body:
{
  "name": "restaurants"
}
# Response
{
  "code": 1001,
  "result": {
    "category": {
      "categoryId": 1,
      "name": "restaurants"
    }
  },
  "message": "Category was successfully saved"
}
```
```
# Send POST to /point to add some new point. Body:
{
  "category_id": 1,
  "name": "Super bar #1",
  "address": "Some address of bar #1",
  "longitude": 13.337761,
  "latitude": 52.505757,
  "site": "http://bar1-site.de",
  "working_time": {
    "Thursday": "12PM–2AM",
    "Friday": "12PM–2AM",
    "Saturday": "12PM–2AM",
    "Sunday": "12PM–2AM",
    "Monday": "12PM–2AM",
    "Tuesday": "12PM–2AM",
    "Wednesday": "12PM–2AM"
  }
}
# Response
{
  "code": 1000,
  "result": {
    "point": {
      "pointId": 1,
      "categoryId": 1,
      "name": "Super bar #1",
      "address": "Some address of bar #1",
      "longitude": 13.337761,
      "latitude": 52.505757,
      "site": "http://bar1-site.de",
      "workingTime": {
        "Thursday": "12PM–2AM",
        "Friday": "12PM–2AM",
        "Saturday": "12PM–2AM",
        "Sunday": "12PM–2AM",
        "Monday": "12PM–2AM",
        "Tuesday": "12PM–2AM",
        "Wednesday": "12PM–2AM"
      }
    }
  },
  "message": "Point was successfully saved"
}
```
```
# Send PUT to /point/:point_id to change some point. Body:
{
  "category_id": 1,
  "name": "Super bar #1",
  "address": "Some address of bar #1",
  "longitude": 13.337761,
  "latitude": 52.505757,
  "site": "http://bar1-site.de",
  "working_time": {
    "Thursday": "9PM–2AM",
    "Friday": "9PM–2AM",
    "Saturday": "9PM–2AM",
    "Sunday": "9PM–2AM",
    "Monday": "9PM–2AM",
    "Tuesday": "9PM–2AM",
    "Wednesday": "9PM–2AM"
  }
}
# Response
{
    "code": 1002,
    "message": "Point was successfully updated"
}
```
```
# Send GET to /point to find some point near the current place. Get parameters:
-category_id
-longitude
-latitude
-radius(km)
-limit
# Example
/point?category_id=1&longitude=13.341591&latitude=52.505933&radius=2
#Response
{
  "code": 1003,
  "result": {
    "points": [
      {
        "pointId": 1,
        "categoryId": 1,
        "name": "Super bar #1",
        "address": "Some address of bar #1",
        "longitude": 13.337761,
        "latitude": 52.505757,
        "site": "http://bar1-site.de",
        "workingTime": {
          "Friday": "9PM–2AM",
          "Monday": "9PM–2AM",
          "Sunday": "9PM–2AM",
          "Tuesday": "9PM–2AM",
          "Saturday": "9PM–2AM",
          "Thursday": "9PM–2AM",
          "Wednesday": "9PM–2AM"
        }
      },
      {
        "pointId": 2,
        "categoryId": 1,
        "name": "Super bar #2",
        "address": "Some address of bar #2",
        "longitude": 13.334961,
        "latitude": 52.503334,
        "site": "",
        "workingTime": {}
      }
    ]
  },
  "message": "Ok"
}
```
```
# Possible codes:
-1000: 'Point was successfully saved',
-1001: 'Category was successfully saved',
-1002: 'Point was successfully updated',
-1003: 'Ok',
-2001: 'DB Connection failed',
-2002: 'DB Query failed',
-2003: 'Incorrect body',
-2004: 'Incorrect name of category',
-2005: 'This category is already exists',
-2006: 'Category is not exists',
-2007: 'Incorrect name of point',
-2008: 'Incorrect address of point',
-2009: 'Incorrect gps coordinates of point',
-2010: 'Incorrect category_id of point',
-2011: 'This point is already exists',
-2012: 'Incorrect point_id',
-2013: 'Point is not exists',
-2014 'Point with the same fields is already exists.',
-2015: 'Something went wrong. Invalid parameters sent.',
-0: 'Unknown error'
```

## Options:
`--help`: Give the help list

`--show-config`: Show default config and exit

`--config`: Path to configuration file

`--listen.http`: Listen on port for http:// server protocol requests

`--redis.host`: Connect to redis host

`--redis.port`: Redis port number to use for connection

`--redis.db`: Redis database to use

`--mysql.host`: Connect to MySQL host

`--mysql.port`: MySQL port number to use for connection

`--mysql.db`: MySQL database to use

`--mysql.user`: User name to use when connecting to MySQL server

`--mysql.secret`: Password to use when connecting to MySQL server

`--graphite.dsn`: DSN for graphite connection

`--graphite.prefix`: Prefix for graphite metrix

`--httpHeaders.access_control_allow_origin`: Access-Control-Allow-Origin