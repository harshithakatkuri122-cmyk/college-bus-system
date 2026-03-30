CREATE TABLE IF NOT EXISTS bus_incharges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  designation VARCHAR(100) DEFAULT 'Bus Incharge',
  route_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bus_incharges_route FOREIGN KEY (route_id) REFERENCES routes(route_no) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'Pending',
  method VARCHAR(30) DEFAULT 'Online',
  txn_ref VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO bus_incharges (user_id, name, designation)
SELECT
  u.id,
  COALESCE(f.name, u.college_id) AS name,
  'Bus Incharge' AS designation
FROM users u
LEFT JOIN faculty f ON f.user_id = u.id
LEFT JOIN bus_incharges bi ON bi.user_id = u.id
WHERE u.role = 'bus-incharge'
  AND bi.user_id IS NULL;
