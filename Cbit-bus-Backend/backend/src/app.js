const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const catalogRoutes = require("./routes/catalog.routes");
const transportRoutes = require("./routes/transport.routes");
const assistantRoutes = require("./routes/assistant.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api", catalogRoutes);
app.use("/api", transportRoutes);
app.use("/api", assistantRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "CBIT Bus Backend Running 🚀"
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;