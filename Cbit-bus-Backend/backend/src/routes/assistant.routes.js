const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { askAssistant, askPublicAssistant } = require("../controllers/assistant.controller");

const router = express.Router();

router.post(
  "/assistant",
  authMiddleware,
  authorizeRoles("student"),
  askAssistant
);

router.post("/assistant/public", askPublicAssistant);

module.exports = router;
