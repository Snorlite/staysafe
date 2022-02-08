const mysql = require('mysql2/promise');
const helper = require('./helper.js')
const host = 'localhost';
const listPerPage = 10;

async function query(sql, params) {
  const connection = await mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'staysafe',
    dateStrings : true 
  });
  const [results, ] = await connection.execute(sql, params);

  return results;
}

async function getEmployees(){
  const rows = await query(
    `SELECT * FROM employee E`
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getEmployee(idEmployee){
  const rows = await query(
    `SELECT * FROM employee E WHERE E.idEmployee = ?`, 
    [idEmployee]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getEmployeeByEmail(email){
  //const offset = helper.getOffset(page, listPerPage);
  const rows = await query(
    `SELECT * FROM employee E WHERE E.email = ?`, 
    [email]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}


async function register(user_name, user_surname, user_gender, user_birthDate, user_email, user_password, user_job, user_role, user_desk) {
  const result = await query(
    `INSERT INTO employee (name, surname, gender, birthdate, email, password, job, role, idDesk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_name, user_surname, user_gender, user_birthDate, user_email, user_password, user_job, user_role, user_desk]
  );
  let message = 'Error in creating user';

  if (result.affectedRows) {
    message = 'User created successfully';
  }

  return {message};
}

// ----

async function getDesks() {
  const rows = await query(
    `SELECT * FROM desk D`
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getDesk(idDesk) {
  const rows = await query(
    `SELECT * FROM desk D WHERE D.idDesk = ?`,
    [idDesk]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getDesksByReservedEmployee(idEmployee) {
  const rows = await query(
    `SELECT D.* FROM desk D, reservation R WHERE D.idDesk = R.idDesk AND R.idEmployee = ?`,
    [idEmployee]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getDeskByOwnerEmployee(idEmployee) {
  const rows = await query(
    `SELECT D.* FROM desk D, employee E WHERE D.idDesk = E.idDesk AND E.idEmployee = ?`,
    [idEmployee]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getDeskByPosition(x, y, desk_area) {
  const rows = await query(
    `SELECT D.* FROM desk D WHERE D.x = ? AND D.yPosition = ? AND D.idDeskArea = ?`,
    [x, y, desk_area]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getReservedDesks(date) {
  const rows = await query(
    `SELECT * FROM desk D WHERE D.idDesk IN (SELECT D2.idDesk FROM desk D2, reservation R WHERE R.idDesk = D2.idDesk AND R.reservationDate = DATE(?))`,
    [date]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

/*

seleziona tra le scrivanie non occupate, e se il dipendente non ha già prenotato:
	se il numero delle scrivanie prenotato in data x / numero totale scrivanie è < 0.45
	se il numero delle scrivanie prenotate in data x appartenenti alla stessa area / numero scrivanie dell'area è < 0.65
	se il numero delle scrivanie prenotate in data x appartenti alla stessa area con stessa cordinata y top/down e x adiacente è 0
		allora seleziona desk se il dipendente è il suo proprietario
		altrimenti seleziona desk jolly

*/
async function getReservableDesks(idEmployee, date) {
  let rows = await query(
    `SELECT D.* FROM desk D WHERE D.idDesk NOT IN (SELECT D2.idDesk FROM desk D2, reservation R WHERE D2.idDesk = R.idDesk AND R.reservationDate = DATE(?)) AND ? NOT IN (SELECT idEmployee FROM reservation WHERE reservationDate = DATE(?)) AND 
    (CASE
    WHEN 
        ((SELECT COUNT(DISTINCT(R2.idDesk)) FROM reservation R2 WHERE R2.reservationDate = DATE(?)) / (SELECT COUNT(*) FROM desk) < 0.45
    AND (SELECT COUNT(DISTINCT(R3.idDesk)) FROM reservation R3, desk D3 WHERE R3.idDesk = D3.idDesk AND R3.reservationDate = DATE(?) AND D3.idDeskArea = D.idDeskArea) / (SELECT COUNT(*) FROM desk WHERE idDeskArea = D.idDeskArea) < 0.65
    AND (SELECT COUNT(DISTINCT(D4.idDesk)) FROM desk D4, reservation R4 WHERE R4.idDesk = D4.idDesk AND R4.reservationDate = DATE(?) AND D4.yPosition = D.yPosition AND (D4.yPosition = 'up' OR D4.yPosition = 'down') AND (D4.x = D.x - 1 OR D4.x = D.x + 1) AND D.idDeskArea = D4.idDeskArea) = 0
    
    ) THEN CASE WHEN (D.idDesk IN (SELECT idDesk FROM employee WHERE idEmployee = ?)  
                     ) THEN 1 ELSE 0 END 
    ELSE 0
    END) IN (1)`,
    [date, idEmployee, date, date, date, date, idEmployee]
  );

  if (helper.emptyOrRows(rows).length == 0) {
    rows = await query(`SELECT * FROM desk D WHERE D.jolly = 1 AND D.idDesk NOT IN (SELECT D2.idDesk FROM desk D2, reservation R WHERE R.idDesk = D2.idDesk AND R.reservationDate = DATE(?)) AND ? NOT IN (SELECT idEmployee FROM reservation WHERE reservationDate = DATE(?))`,
    [date, idEmployee, date]
    );
  }


  const data = helper.emptyOrRows(rows);

  return data;
}

async function getOwnableDesks() {
  const rows = await query(
    `SELECT * FROM desk D WHERE D.jolly = 0 AND D.idDesk NOT IN (SELECT D2.idDesk FROM desk D2, employee E WHERE D2.idDesk = E.idDesk)`,
    []
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getReservedDeskByKey(idDesk, date) {
  const rows = await query(
    `SELECT D.* FROM desk D, reservation R WHERE D.idDesk = R.idDesk AND D.idDesk = ? AND R.reservationDate = DATE(?)`,
    [idDesk, date]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function insertDesk(desk_x, desk_y, desk_jolly, desk_area) {
  const result = await query(
    `INSERT INTO desk (x, yPosition, jolly, idDeskArea) VALUES (?, ?, ?, ?)`,
    [desk_x, desk_y, desk_jolly, desk_area]
  );
  let message = 'Error in creating desk';

  if (result.affectedRows) {
    message = 'Desk created successfully';
  }

  return {message};
}

async function deleteDesk(id) {
  const result = await query(
    `DELETE FROM desk WHERE idDesk = ?`,
    [id]
  );
  let message = 'Error in deleting desk';

  if (result.affectedRows) {
    message = 'Desk deleted successfully';
  }

  return {message};
}

// ----

async function getReservations() {
  const rows = await query(
    `SELECT * FROM reservation R`
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getReservationByDesk(idDesk) {
  const rows = await query(
    `SELECT R.* FROM desk D, reservation R WHERE D.idDesk = R.idDesk AND R.idDesk = ?`,
    [idDesk]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getReservationsByEmployee(idEmployee) {
  const rows = await query(
    `SELECT * FROM reservation R WHERE R.idEmployee = ?`,
    [idEmployee]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getReservationByKey(idDesk, date) {
  const rows = await query(
    `SELECT * FROM reservation R WHERE R.idDesk = ? AND DATE(R.reservationDate) = DATE(?)`,
    [idDesk, date]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function getOpenAreaParameters(idDesk, date, idEmployee) {
  const rows = await query(
    `SELECT (SELECT COUNT(DISTINCT(R2.idDesk)) FROM reservation R2 WHERE R2.reservationDate = DATE(?)) / (SELECT COUNT(*) FROM desk) as total_capacity, (SELECT COUNT(DISTINCT(R3.idDesk)) FROM reservation R3, desk D3 WHERE R3.idDesk = D3.idDesk AND R3.reservationDate = DATE(?) AND D3.idDeskArea = D.idDeskArea) / (SELECT COUNT(*) FROM desk WHERE idDeskArea = D.idDeskArea) AS area_capacity, (SELECT COUNT(DISTINCT(D4.idDesk)) FROM desk D4, reservation R4 WHERE R4.idDesk = D4.idDesk AND R4.reservationDate = DATE(?) AND D4.yPosition = D.yPosition AND (D4.yPosition = 'up' OR D4.yPosition = 'down') AND (D4.x = D.x - 1 OR D4.x = D.x + 1) AND D.idDeskArea = D4.idDeskArea) AS adjacent_desks,(SELECT COUNT(*) FROM desk D, employee E WHERE D.idDesk = E.idDesk AND E.idDesk = ? AND E.idEmployee = ?) AS desk_ownership FROM desk D WHERE D.idDesk = ?`,
    [date, date, date, idDesk, idEmployee, idDesk]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

async function insertReservation(id_desk, reservation_date, timestamp, id_employee) {
  const result = await query(
    `INSERT INTO reservation (idDesk, reservationDate, timestamp, idEmployee) VALUES (?, ?, ?, ?)`,
    [id_desk, reservation_date, timestamp, id_employee]
  );
  let message = 'Error in creating reservation';

  if (result.affectedRows) {
    message = 'Reservation created successfully';
  }

  return {message};
}

async function deleteReservation(id_desk, reservation_date) {
  const result = await query(
    `DELETE FROM reservation WHERE idDesk = ? AND reservationDate = DATE(?)`,
    [id_desk, reservation_date]
  );
  let message = 'Error in deleting reservation';

  if (result.affectedRows) {
    message = 'Reservation deleted successfully';
  }

  return {message};
}

async function getNumEmployeesByJobAndDeskArea(reservation_date) {
  const rows = await query(
    `SELECT COUNT(E.idEmployee) AS numEmployees, D.idDeskArea, E.job FROM reservation R, desk D, employee E WHERE R.idDesk = D.idDesk AND R.idEmployee = E.idEmployee AND R.reservationDate = DATE(?) GROUP BY D.idDeskArea, E.job`,
    [reservation_date]
  );
  const data = helper.emptyOrRows(rows);

  return data;
}

module.exports = { query,
  getEmployees,
  getEmployee,
  getEmployeeByEmail,
  register,
  getDesks,
  getDesk,
  getDesksByReservedEmployee,
  getDeskByOwnerEmployee,
  getDeskByPosition,
  getReservedDesks,
  getReservableDesks,
  getOwnableDesks,
  insertDesk,
  deleteDesk,
  getReservations,
  getReservationByDesk,
  getReservationsByEmployee,
  getReservationByKey,
  getReservedDeskByKey,
  getOpenAreaParameters,
  insertReservation,
  deleteReservation,
  getNumEmployeesByJobAndDeskArea
};
