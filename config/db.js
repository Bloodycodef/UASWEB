const mysql = require('mysql2')


const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '221203',
    database : 'user_auth',
})

db.connect((err) => {
    if (err) {
        console.error('Gagal connect ke database:', err.message);
        return;
    }
    console.log('kamu sudah berhasil connect ke database sayangku');
});

module.exports = db;