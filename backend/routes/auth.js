const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (dbPool, secretKey) => {
  const router = express.Router();

  // ================== TOKEN VERIFICATION ==================
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
      }
      req.user = decoded;
      next();
    });
  };

  // ================== REGISTER ==================
  router.post('/register', (req, res) => {
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

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const sql = `
      INSERT INTO users
      (first_name, last_name, country, dob, phone, email, password, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    dbPool.query(
      sql,
      [firstName, lastName, nationality, dateOfBirth, phone, email, password, paymentMethod],
      (err) => {
        if (err) {
          console.error('❌ Registration Error:', err);

          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists.' });
          }

          return res.status(500).json({ message: 'Registration failed due to server error.' });
        }

        res.status(201).json({ message: 'User registered successfully!' });
      }
    );
  });

  // ================== LOGIN ==================
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';

    dbPool.query(sql, [email], (err, results) => {
      if (err) {
        console.error('❌ Login DB Error:', err);
        return res.status(500).json({ message: 'Login failed due to server error.' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const user = results[0];

      // Plain-text password (matches your current DB)
      if (password !== user.password) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const payload = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name
      };

      const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });

      res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.email,
          country: user.country,
          paymentMethod: user.payment_method
        }
      });
    });
  });

  // ================== VERIFY TOKEN ==================
  router.get('/verify', verifyToken, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
  });

  return router;
};
