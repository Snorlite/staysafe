const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult, oneOf } = require('express-validator');
const {getEmployee, getEmployees, getEmployeeByEmail, getDesks, getDesk, getReservableDesks, getReservedDesks, getOwnableDesks, getDeskByOwnerEmployee, insertDesk, deleteDesk, getDeskByPosition} = require('../../persistence/db.js');

router.get(
    '/',
    async (req, res) => {
      try {
        const desks = await getDesks()
        res.json(desks);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );

  router.get(
    '/ownables',
    async (req, res) => {
      try {
        const desks = await getOwnableDesks()
        res.json(desks);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );

  router.get(
    '/reserved/:date',
    async (req, res) => {
      try {
        const desks = await getReservedDesks(req.params.date)
        res.json(desks);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );

  router.get(
    '/reservable/:date',
    auth,
    async (req, res) => {
      try {
        const desks = await getReservableDesks(req.user.idEmployee, req.params.date)
        res.json(desks);
      } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );
  
  router.get(
    '/:id',
    async (req, res) => {
      try {
        const desks = await getDesk(req.params.id)
        if (desks.length == 0) {
          return res.status(400).json({ msg: 'Desk not found '});
        }
        res.json(desks[0]);
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(400).json({ msg: 'Desk not found '});
        }
        res.status(500).send(err.message);
      }
    }
  );

  router.post(
    '/',
    [ auth,
      [
          check('desk_x', 'Desk x is required')
          .isInt()
          .not()
          .isEmpty(),
          check('desk_y', 'Course degree must be up, down, left or right')
              .isIn(['up', 'down', 'left', 'right']),
          check('desk_jolly', 'Desk jolly is required')
          .isIn([0,1]),
          check('desk_area', 'Desk area is required')
          .not()
          .isEmpty()
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
        if (employees[0].role !== "admin") {
            return res.status(401).json({ errors: [{ msg: 'User not authorized' }] });
        }
  
        await insertDesk(req.body.desk_x, req.body.desk_y, req.body.desk_jolly, req.body.desk_area)

        const desksAfterInsert = await getDeskByPosition(req.body.desk_x, req.body.desk_y, req.body.desk_area)

        res.json(desksAfterInsert[0]);
      } catch(err) {
        console.error(err.message);
        res.status(500).send(err.message);
      }
    }
  );
  
  router.delete(
    '/:id',
    auth,
    async (req, res) => {
      try {
        const employees = await getEmployee(req.user.idEmployee)
        if (employees.length == 0) {
          return res.status(400).json({ msg: 'User not found'});
        }
        if (employees[0].role !== "admin") {
            return res.status(401).json({ errors: [{ msg: 'User not authorized' }] });
        }

        await deleteDesk(req.params.id)

        res.json({msg:"Desk removed"});

      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(400).json({ msg: 'Desk not found' });
        }
        res.status(500).send(err.message);
      }
    }
  );
  
module.exports = router;