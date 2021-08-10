const mysql = require('mysql2');

var pool = mysql.createPool({
    "user": "root",
    "password": "root",
    "database": "ecommerce",
    "host": "localhost",
    "port": 3306
});



module.exports = pool;
