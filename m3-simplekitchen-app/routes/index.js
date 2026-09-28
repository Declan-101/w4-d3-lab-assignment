const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
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

// View all registrations
router.get('/registrations', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrations', {
        title: 'Listing registrations',
        registrations
      });
    })
    .catch(() => {
      res.send('Sorry! Something went wrong.');
    });
}));

// Submit registration form
router.post('/register',
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),

    check('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const registration = new Registration(req.body);

      registration.save()
        .then(() => {
          res.render('thanks', {
            title: 'Thank You'
          });
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
        });
    } else {
      res.render('form', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body
      });
    }
  }
);

module.exports = router;