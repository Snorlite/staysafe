const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const { check, validationResult, oneOf, body } = require('express-validator');
const {getEmployee, getEmployees, getEmployeeByEmail, register} = require('../../persistence/db.js');

router.post(
  '/register',
  [
    check('user_email', 'Inserisci un indirizzo e-mail valido')
    .isEmail(),
    check('user_name', 'Il nome è obbligatorio')
    .not()
    .isEmpty(),
    check('user_birthDate').isISO8601().toDate(),
    check('user_surname', 'Il cognome è obbligatorio')
    .not()
    .isEmpty(),
    check('user_password', 'La password deve contenere almeno 6 caratteri')
    .isLength({ min: 6 }),
    check('user_job', 'La mansione è obbligatoria')
    .not()
    .isEmpty(),
    check('user_desk', 'La scrivania è obbligatoria')
    .isInt()
    .not()
    .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user already exists
       const employees = await getEmployeeByEmail(req.body.user_email)
       //let user = await User.findOne({ user_email : req.body.user_email });
       if (employees.length > 0) {
        return res.status(400).json({ errors: [{ msg: 'L\'indirizzo email inserito è già utilizzato'}] });
       }

      // Encryt password

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.user_password, salt);

      const roles = ['user', 'admin']

      const role = roles.includes(req.body.user_role) ? req.body.user_role : 'user'

      await register(req.body.user_name, req.body.user_surname, req.body.user_gender, req.body.user_birthDate, req.body.user_email, hashedPassword, req.body.user_job, req.body.user_role, req.body.user_desk)
      
      // Return jsonwebtoken (login after registration)
      const employeesAfterRegister = await getEmployeeByEmail(req.body.user_email)

/*
      const payload = {
        _id: employeesAfterRegister[0].IdEmployee,
        user_password: employeesAfterRegister[0].Password,
        user_name: employeesAfterRegister[0].Name,
        user_surname: employeesAfterRegister[0].Surname,
        user_gender: employeesAfterRegister[0].Gender,
        user_job: employeesAfterRegister[0].Job,
        user_role: employeesAfterRegister[0].Role,
        user_birthDate: employeesAfterRegister[0].Birthdate
      }*/

      jwt.sign(
        employeesAfterRegister[0],
        config.jwtToken,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ ...employeesAfterRegister[0],
            token });
        }
      );

    } catch(err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }

  }
);

router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const employees = await getEmployees()
      res.json(employees);
    } catch(err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  }
);

router.get(
  '/me',
  auth,
  async (req, res) => {
    try {
      const employees = await getEmployee(req.user.idEmployee)
      //const user = await User.findOne({ _id: req.user._id });
      if (employees.length == 0) {
        return res.status(400).json({ msg: 'User not found'});
      }
      res.json(employees[0]);
    } catch(err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  }
);
module.exports = router;
