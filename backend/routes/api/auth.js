const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const { check, validationResult } = require('express-validator');
const {getEmployee, getEmployeeByEmail} = require('../../persistence/db.js');

router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const employees = await getEmployee(req.user.idEmployee)
      //const user = await User.findById(req.user._id).select('-password');
      if (employees.length == 0) {
        return res.status(400).json({ msg: "This user doesn\'t exist"});
      }
      res.json(employees[0]);
    } catch(err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.post(
  '/',
  [
    check('user_email', 'Inserisci l\'e-mail')
    .not()
    .isEmpty(),
    check('user_password', 'Inserisci la password')
    .not()
    .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user exists
      const employees = await getEmployeeByEmail(req.body.user_email)
      //let user = await User.findOne({ user_email : req.body.user_email });
      if (employees.length == 0) {
        return res.status(400).json({ errors: [{ msg: 'Credenziali non valide' }] });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(req.body.user_password, employees[0].password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Credenziali non valide' }] });
      }

      // Return jsonwebtoken

     /* const payload = {
        user
      };*/



      const payload = {
        _id: employees[0].idEmployee,
        user_password: employees[0].password,
        user_name: employees[0].name,
        user_surname: employees[0].surname,
        user_gender: employees[0].gender,
        user_job: employees[0].job,
        user_role: employees[0].role,
        user_birthDate: employees[0].birthdate
      }

      jwt.sign(
        employees[0],
        config.jwtToken,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ ...employees[0],
            token });
        }
      );

    } catch(err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }

  }
);
module.exports = router;
