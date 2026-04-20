const db = require("../config/db");

function getCurrentAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 6) {
    return `${year}-${year + 1}`;
  }

  return `${year - 1}-${year}`;
}

async function ensureBookingsTable(executor = db) {
  await executor.execute(
    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      bus_id INT NOT NULL,
      route_no INT NULL,
      seat_no INT NULL,
      academic_year VARCHAR(20) NOT NULL,
      status ENUM('active', 'renewed', 'changed') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_bookings_student_year (student_id, academic_year),
      INDEX idx_bookings_student_created (student_id, created_at),
      INDEX idx_bookings_bus_id (bus_id)
    )`
  );
}

async function createBookingRecord(executor, payload) {
  const {
    studentId,
    busId,
    routeNo = null,
    seatNo = null,
    academicYear = getCurrentAcademicYear(),
    status = "active",
  } = payload;

  if (!Number.isInteger(Number(studentId)) || !Number.isInteger(Number(busId))) {
    throw new Error("studentId and busId are required");
  }

  await ensureBookingsTable(executor);

  await executor.execute(
    `INSERT INTO bookings (student_id, bus_id, route_no, seat_no, academic_year, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [Number(studentId), Number(busId), routeNo, seatNo, academicYear, status]
  );
}

async function getLatestBooking(executor, studentId) {
  await ensureBookingsTable(executor);

  const [rows] = await executor.execute(
    `SELECT id, student_id, bus_id, route_no, seat_no, academic_year, status, created_at
     FROM bookings
     WHERE student_id = ?
     ORDER BY academic_year DESC, id DESC
     LIMIT 1`,
    [studentId]
  );

  return rows[0] || null;
}

async function hasAcademicYearBooking(executor, studentId, academicYear) {
  await ensureBookingsTable(executor);

  const [rows] = await executor.execute(
    `SELECT id
     FROM bookings
     WHERE student_id = ?
       AND academic_year = ?
     LIMIT 1`,
    [studentId, academicYear]
  );

  return rows.length > 0;
}

module.exports = {
  getCurrentAcademicYear,
  ensureBookingsTable,
  createBookingRecord,
  getLatestBooking,
  hasAcademicYearBooking,
};
