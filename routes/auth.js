// routes/auth.js (CommonJS)
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

module.exports = (db, secretKey) => {

  // ===================================================
  // 0. MIDDLEWARE: Token Verification
  // ===================================================
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
      req.user = decoded;
      next();
    });
  };

  router.verifyToken = verifyToken;

  // ===================================================
  // 1. REGISTRATION ROUTE
  // ===================================================
  router.post('/register', async (req, res) => {
    const {
      firstName,
      lastName,
      nationality, 
      dateOfBirth,
      phone,
      email,
      password,
      paymentMethod
    } = req.body;

    if (!firstName || !lastName || !password || !email || !nationality || !dateOfBirth) {
      return res.status(400).json({
        message: 'Please provide all required fields: names, date of birth, nationality, email, and password.'
      });
    }

   // try {
  //     const sql = `
  //       INSERT INTO users 
  //       (first_name, last_name, country, dob, phone, email, password, payment_method)
  //       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  //     `;

  //     db.query(sql, [
  //       firstName,
  //       lastName,
  //       nationality,
  //       dateOfBirth,
  //       phone,
  //       email,
  //       password,
  //       paymentMethod
  //     ], (err, result) => {
  //       if (err) {
  //         console.error('Database Registration Error:', err.message);
  //         if (err.code === 'ER_DUP_ENTRY') {
  //           return res.status(409).json({ message: 'Email already exists.' });
  //         }
  //         return res.status(500).json({
  //           message: 'Registration failed due to a server error. Check database columns.'
  //         });
  //       }
  //       return res.status(201).json({ message: 'User registered successfully!' });
  //     });
  //   } catch (error) {
  //     console.error('Registration Catch Block Error:', error);
  //     res.status(500).json({ message: 'Internal server error during registration.' });
  //   }
  // });
  
   const sql = `
      INSERT INTO users 
      (first_name, last_name, country, dob, phone, email, password, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    try {
      const result = await db.query(sql, [
        firstName,
        lastName,
        nationality,
        dateOfBirth,
        phone,
        email,
        password,
        paymentMethod
      ]);
      res.status(201).json({ message: 'User registered successfully!', user: result.rows[0] });
    } catch (err) {
      console.error('Database Registration Error:', err.message);
      if (err.code === '23505') { // Postgres unique violation
        return res.status(409).json({ message: 'Email already exists.' });
      }
      res.status(500).json({ message: 'Registration failed due to a server error.' });
    }
  });
  // ===================================================
  // 2. LOGIN ROUTE
  // ===================================================
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database Login Error:', err);
        return res.status(500).json({ message: 'Login failed due to a server error.' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const user = results[0];

      try {
        // Plain text password comparison
        if (password !== user.password) {
          return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const payload = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name
        };

        const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });

        const userData = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.email,
          country: user.country,
          paymentMethod: user.payment_method
        };

        res.json({ message: 'Login successful!', user: userData, token });
      } catch (error) {
        console.error('Authentication (Bcrypt/JWT) error:', error);
        res.status(500).json({ message: 'Login failed due to an internal server issue.' });
      }
    });
  });

  // ===================================================
  // 3. TOKEN VERIFICATION ROUTE
  // ===================================================
  router.get('/verify', verifyToken, (req, res) => {
    // If we reach here, the token is valid (verified by middleware)
    res.json({ 
      message: 'Token is valid', 
      user: req.user 
    });
  });

  return router;
};
