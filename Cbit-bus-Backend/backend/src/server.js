require("dotenv").config();
const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

function getAssistantProviderConfig() {
  if (process.env.GROQ_API_KEY) {
    return {
      provider: "groq",
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      endpoint: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      endpoint: "https://api.openai.com/v1",
    };
  }

  return {
    provider: "fallback",
    model: "none",
    endpoint: "none",
  };
}

db.getConnection()
  .then(async connection => {
    console.log("MySQL Connected ✅");
    connection.release();

    const [dbName] = await db.execute("SELECT DATABASE() AS db");
    console.log("BACKEND USING DB:", dbName);

    const assistantConfig = getAssistantProviderConfig();
    const ruleMode = String(process.env.ASSISTANT_RULE_MODE || "off").toLowerCase() === "on" ? "on" : "off";
    console.log(
      `[CHATBOT AI] provider=${assistantConfig.provider} model=${assistantConfig.model} endpoint=${assistantConfig.endpoint}`
    );
    console.log(`[CHATBOT AI] rule_replies=${ruleMode}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed ❌");
    console.error(err);
  });