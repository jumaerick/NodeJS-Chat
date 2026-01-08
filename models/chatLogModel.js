import { mysqlDb, pgDb } from "../config/db.js";
import platformMapper from "../config/platformMapper.js";

const isTesting = process.env.NODE_ENV === "testing";
const mysqlPromise = !isTesting ? mysqlDb.promise() : null;

// ================= GET ALL =================
export const getAllChatLogs = async () => {
  if (isTesting) {
    const { rows } = await pgDb.query("SELECT * FROM chatbot_logs");
    return rows;
  }

  const [rows] = await mysqlPromise.query("SELECT * FROM chatbot_logs");
  return rows;
};

// ================= GET BY PLATFORM =================
export const getChatLogByPlatform = async (id) => {
  const platform = platformMapper.get(parseInt(id));

  if (isTesting) {
    const { rows } = await pgDb.query(
      "SELECT * FROM chatbot_logs WHERE LOWER(project) = $1",
      [platform]
    );
    return rows;
  }

  const [rows] = await mysqlPromise.query(
    "SELECT * FROM chatbot_logs WHERE LOWER(project) = ?",
    [platform]
  );

  return rows;
};

// ================= CREATE =================
export const createChatLog = async (
  message,
  user_id,
  project,
  remote_ip
) => {
  const lowerProject = project.toLowerCase();

  if (isTesting) {
    const query = `
      INSERT INTO chatbot_logs (message, user_id, project, remote_ip)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const { rows } = await pgDb.query(query, [
      message,
      user_id,
      lowerProject,
      remote_ip,
    ]);

    return rows[0];
  }

  const [result] = await mysqlPromise.query(
    "INSERT INTO chatbot_logs (message, user_id, project, remote_ip) VALUES (?, ?, ?, ?)",
    [message, user_id, lowerProject, remote_ip]
  );

  return {
    id: result.insertId,
    message,
    user_id,
    project: lowerProject,
    remote_ip,
  };
};

// ================= UPDATE =================
export const updateChatLog = async (id, name, email) => {
  if (isTesting) {
    await pgDb.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      [name, email, id]
    );
    return { id, name, email };
  }

  await mysqlPromise.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );

  return { id, name, email };
};

// ================= DELETE =================
export const deleteChatLog = async (id) => {
  if (isTesting) {
    await pgDb.query("DELETE FROM users WHERE id = $1", [id]);
    return { message: "User deleted successfully" };
  }

  await mysqlPromise.query("DELETE FROM users WHERE id = ?", [id]);
  return { message: "User deleted successfully" };
};
