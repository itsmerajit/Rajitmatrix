require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Replace with your email
        pass: process.env.GMAIL_APP_PASSWORD // Replace with your app password
    }
});

// Store messages in memory (replace with database in production)
const messages = [];

// Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Store message
        messages.push({
            id: Date.now(),
            name,
            email,
            message,
            date: new Date()
        });

        // Send email notification
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: `New Contact Form Message from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `
        });

        res.status(200).json({ success: true, message: 'Message received successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
});

// Get all messages (protected route in production)
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// Add this after your existing routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
