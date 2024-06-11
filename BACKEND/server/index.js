const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('./authMiddleware');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YlfarFira123_', 
    database: 'forms_db'
});

db.connect(err => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('MySQL Connected...');
});

app.use(bodyParser.json());
app.use(cors());

// Registrasi pengguna
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(400).send({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({ message: 'Registration failed' });
    }
});

// Autentikasi pengguna
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, 'yourSecretKey', { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({ message: 'Login failed' });
    }
});


// Mendapatkan data pengguna
app.get('/api/auth', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (rows.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server Error');
    }
});

// Mendapatkan formulir berdasarkan userId
app.post('/api/forms', authMiddleware, async (req, res) => {
    const { title, description } = req.body;
    try {
        const result = await db.promise().query(
            'INSERT INTO forms (title, description, user_id) VALUES (?, ?, ?)',
            [title, description, req.userId]
        );
        res.status(201).send({ id: result[0].insertId, title, description });
    } catch (error) {
        console.error('Error inserting form:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/api/forms', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const [rows] = await db.promise().query(
            'SELECT * FROM forms WHERE user_id = ?',
            [userId]
        );
        res.send(rows);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).send('Server Error');
    }
});

app.put('/api/forms/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
        const result = await db.promise().query(
            'UPDATE forms SET title = ?, description = ? WHERE id = ? AND user_id = ?',
            [title, description, id, req.userId]
        );
        res.send({ message: 'Form updated' });
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).send('Server Error');
    }
});


app.delete('/api/forms/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.promise().query(
            'DELETE FROM forms WHERE id = ? AND user_id = ?',
            [id, req.userId]
        );
        if (result[0].affectedRows === 0) {
            return res.status(404).send({ message: 'Form not found' });
        }
        res.send({ message: 'Form deleted' });
    } catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
