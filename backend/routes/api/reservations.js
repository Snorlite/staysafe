const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult, oneOf } = require('express-validator');
const {getEmployee, getReservations, getReservationByDesk, getReservationsByEmployee, getReservationByKey, insertReservation, deleteReservation, getReservableDesks, getNumEmployeesByJobAndDeskArea} = require('../../persistence/db.js');

router.get(
    '/',
    async (req, res) => {
      try {
        const reservations = await getReservations()
        res.json(reservations);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );

  router.get(
    '/employee',
    auth,
    async (req, res) => {
      try {
        const reservations = await getReservationsByEmployee(req.user.idEmployee)
        res.json(reservations);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );

  router.get(
    '/job/:date',
    auth,
    async (req, res) => {
      try {
        const numEmployees = await getNumEmployeesByJobAndDeskArea(req.params.date)
        res.json(numEmployees);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  )
  
  router.get(
    '/id',
    [ 
      check('id_desk', 'Id desk is required')
      .isInt()
      .not()
      .isEmpty(),
      check('reservation_date', 'Reservation date must be a date')
      .isISO8601().toDate()
    ],
    async (req, res) => {
      try {
        const reservations = await getReservationByKey(req.body.id_desk, req.body.reservation_date)
        if (reservations.length == 0) {
          return res.status(400).json({ msg: 'Reservation not found '});
        }
        res.json(reservations[0]);
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(400).json({ msg: 'Reservation not found '});
        }
        res.status(500).send(err.message);
      }
    }
  );

  router.post(
    '/',
    [ auth,
      [
          check('id_desk', 'Id desk is required')
          .isInt()
          .not()
          .isEmpty(),
          check('reservation_date', 'Reservation date must be a date')
          .isISO8601().toDate()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() });
      }
      try {
        const employees = await getEmployee(req.user.idEmployee)
        if (employees.length == 0) {
          return res.status(400).json({ msg: 'User not found'});
        }

        const reservableDesks = await getReservableDesks(req.user.idEmployee, req.body.reservation_date)
  
        if (reservableDesks.map(d => d.idDesk == req.body.id_desk).length > 0) {
          await insertReservation(req.body.id_desk, req.body.reservation_date, new Date(Date.now()), req.user.idEmployee)
          const reservationsAfterInsert = await getReservationByKey(req.body.id_desk, req.body.reservation_date)

          res.json(reservationsAfterInsert[0]);
        
        } else {
          return res.status(400).json({ ...openAreaParameters[0],  msg: 'Reservation not possible'});
        }
      } catch(err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );
  
  router.delete(
    '/',
    [ auth,
      [
          check('id_desk', 'Id desk is required')
          .isInt()
          .not()
          .isEmpty(),
          check('reservation_date', 'Reservation date must be a date')
          .isISO8601().toDate()
      ]
    ],
    async (req, res) => {
      try {
        const employees = await getEmployee(req.user.idEmployee)
        if (employees.length == 0) {
          return res.status(400).json({ msg: 'User not found'});
        }

        await deleteReservation(req.body.id_desk, req.body.reservation_date)

        res.json({msg:"Desk removed"});

      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(400).json({ msg: 'Reservation not found' });
        }
        res.status(500).send(err.message);
      }
    }
  );
  
module.exports = router;