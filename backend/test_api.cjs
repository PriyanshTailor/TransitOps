const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool();
pool.query("SELECT * FROM users WHERE email='finance@demo.com'").then(res => {
  const user = res.rows[0];
  pool.query('SELECT name FROM roles WHERE id=$1', [user.role_id]).then(rRes => {
    const role = rRes.rows[0].name;
    const token = jwt.sign({ userId: user.id, companyId: user.company_id, role }, process.env.JWT_SECRET);
    
    fetch('http://localhost:5000/api/fuel', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(d => console.log('FUEL:', d)).catch(console.error);
      
    fetch('http://localhost:5000/api/vehicles', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(d => console.log('VEHICLES:', d)).catch(console.error);
  });
}).catch(console.error);
