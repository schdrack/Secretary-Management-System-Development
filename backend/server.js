const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const pdf = require('html-pdf');
const ExcelJS = require('exceljs');

const app = express();
const port = 3001;

app.use(cors({
    origin: 'http://localhost:3000', // React frontend
    credentials: true
}));

app.use(bodyParser.json());
app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // if using http (not https), secure must be false
}));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // your MySQL password
    database: 'secretary_db'
});

db.connect(err => {
    if (err) {
        console.error('MySQL connection error:', err);
        process.exit(1); // Stop app if DB connection fails
    } else {
        console.log('Connected to MySQL');
    }
});

// User Registration
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, "secretary")';
    db.query(sql, [username, email, hashedPassword], (err) => {
        if (err) {
            console.error('Registration error:', err);
            return res.status(500).json({ error: 'Failed to register user' });
        }
        res.json({ message: 'User registered successfully' });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password required");
    }
    const sql = "SELECT * FROM Users WHERE username = ?";
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Login query error:', err);
            return res.status(500).send("Server error");
        }
        if (result.length === 0) return res.status(401).send("Invalid credentials");

        const user = result[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) return res.status(401).send("Invalid credentials");

        req.session.user = {
            userId: user.userId,
            username: user.username,
            email: user.email,
            role: user.role
        };
        res.json(req.session.user);
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Clear cookie on logout
        res.json({ message: 'Logged out' });
    });
});

// Get Logged In User
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Create Client
app.post('/api/clients', (req, res) => {
    const { name, contactInfo, address, notes } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Client name is required' });
    }
    const sql = 'INSERT INTO Clients (name, contactInfo, address, notes) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, contactInfo || '', address || '', notes || ''], (err) => {
        if (err) {
            console.error('Create client error:', err);
            return res.status(500).json({ error: 'Failed to create client' });
        }
        res.json({ message: 'Client created successfully' });
    });
});

// Get All Clients
app.get('/api/clients', (req, res) => {
    db.query('SELECT clientId, name, contactInfo, address, notes FROM Clients', (err, results) => {
        if (err) {
            console.error('Fetch clients error:', err);
            return res.status(500).json({ error: 'Failed to fetch clients' });
        }
        res.json(results);
    });
});

// Get All Users
app.get('/api/users', (req, res) => {
    db.query('SELECT userId, username, email, role FROM Users', (err, results) => {
        if (err) {
            console.error('Fetch users error:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(results);
    });
});

// Create New User
app.post('/api/users', (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, role], (err) => {
        if (err) {
            console.error('Create user error:', err);
            return res.status(500).json({ error: 'Failed to add user' });
        }
        res.json({ message: 'User added successfully' });
    });
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Users WHERE userId = ?', [id], (err) => {
        if (err) {
            console.error('Delete user error:', err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// Update Client
app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const { name, contactInfo, address, notes } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Client name is required' });
    }
    const sql = 'UPDATE Clients SET name=?, contactInfo=?, address=?, notes=? WHERE clientId=?';
    db.query(sql, [name, contactInfo || '', address || '', notes || '', id], (err) => {
        if (err) {
            console.error('Update client error:', err);
            return res.status(500).json({ error: 'Failed to update client' });
        }
        res.json({ message: 'Client updated successfully' });
    });
});

// Delete Client
app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Clients WHERE clientId = ?', [id], (err) => {
        if (err) {
            console.error('Delete client error:', err);
            return res.status(500).json({ error: 'Failed to delete client' });
        }
        res.json({ message: 'Client deleted successfully' });
    });
});

// Generate PDF Report
app.get('/api/reports/pdf', (req, res) => {
    db.query('SELECT * FROM Clients', (err, clients) => {
        if (err) {
            console.error('PDF report query error:', err);
            return res.status(500).json({ error: 'Failed to generate PDF report' });
        }
        const html = `
            <h1>Client Report</h1>
            <p>Total Clients: ${clients.length}</p>
            <ul>${clients.map(c => `<li>${c.name} - ${c.contactInfo}</li>`).join('')}</ul>
        `;
        pdf.create(html).toBuffer((err, buffer) => {
            if (err) {
                console.error('PDF creation error:', err);
                return res.status(500).json({ error: 'Failed to generate PDF report' });
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.send(buffer);
        });
    });
});

// Generate Excel Report
app.get('/api/reports/excel', (req, res) => {
    db.query('SELECT * FROM Clients', async (err, clients) => {
        if (err) {
            console.error('Excel report query error:', err);
            return res.status(500).json({ error: 'Failed to generate Excel report' });
        }
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Clients');

            sheet.columns = [
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Contact Info', key: 'contactInfo', width: 30 },
                { header: 'Address', key: 'address', width: 30 },
                { header: 'Notes', key: 'notes', width: 40 }
            ];

            clients.forEach(client => sheet.addRow(client));

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=client-report.xlsx');

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Excel generation error:', error);
            res.status(500).json({ error: 'Failed to generate Excel report' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
