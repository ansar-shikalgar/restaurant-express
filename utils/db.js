const mysql2 = require('mysql2');

const pool = mysql2.createPool({
    host: 'trolley.proxy.rlwy.net',
    port: 23266,
    user: 'root',
    password: 'rwiTfNekjoDwmuhMLmSVzNJkSaBPHXzg',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
