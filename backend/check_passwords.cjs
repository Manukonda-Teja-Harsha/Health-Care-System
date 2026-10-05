const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'healthcare_db'
  });
  
  const [users] = await conn.query('SELECT id, name, email, role, password_hash FROM users');
  console.log('Total users:', users.length);
  
  const candidates = [
    'admin123', 'patient123', 'doctor123',
    'password123', 'Password123', 'Admin@123', 'Patient@123', 'Doctor@123',
    '123456', 'secret'
  ];

  for (const u of users) {
    let matched = null;
    for (const c of candidates) {
      if (bcrypt.compareSync(c, u.password_hash)) {
        matched = c;
        break;
      }
    }
    console.log(`User: ${u.email} (${u.role}) => password: ${matched}`);
  }
  await conn.end();
})();
