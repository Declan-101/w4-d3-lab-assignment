const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');

const basic = auth.basic({
    file: path.join(__dirname, '../users.htpasswd'),
});

// Simple Kitchen homepage
router.get('/', (req, res) => {
    res.render('index');
});

// Registration form
router.get('/register', (req, res) => {
    res.render('form', {
        title: 'Registration form'
    });
});

// View all registrations (password protected)
router.get('/registrations', basic.check((req, res) => {
    Registration.find()
        .then((registrations) => {
            res.render('registrations', {
                title: 'Listing registrations',
                registrations
            });
        })
        .catch((err) => {
            console.error(err);
            res.send('Sorry! Something went wrong.');
        });
}));

// Submit registration form
router.post('/register',
    [
        check('name')
            .trim()
            .notEmpty()
            .withMessage('Please enter a name'),

        check('email')
            .trim()
            .isEmail()
            .withMessage('Please enter a valid email'),

        check('username')
            .trim()
            .notEmpty()
            .withMessage('Please enter a username'),

        check('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('form', {
                title: 'Registration form',
                errors: errors.array(),
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username
                }
            });
        }

        try {
            // Hash password before saving
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // Create registration with hashed password
            const registration = new Registration({
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword
            });

            // Save to MongoDB
            await registration.save();

            // Show thank-you page
            res.render('thanks', {
                title: 'Thank You'
            });

        } catch (err) {
            console.error(err);
            res.status(500).send('Sorry! Something went wrong.');
        }
    }
);

module.exports = router;