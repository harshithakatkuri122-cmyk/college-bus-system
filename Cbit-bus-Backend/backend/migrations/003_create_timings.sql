CREATE TABLE IF NOT EXISTS timings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT NOT NULL,
  stop_name VARCHAR(150) NOT NULL,
  arrival_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timings_route_id (route_id),
  CONSTRAINT fk_timings_route FOREIGN KEY (route_id) REFERENCES routes(route_no) ON DELETE CASCADE
);
