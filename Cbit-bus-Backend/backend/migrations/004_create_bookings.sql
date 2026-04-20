CREATE TABLE IF NOT EXISTS bookings (
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
);
