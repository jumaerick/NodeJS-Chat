import {mysqlDb} from '../config/db.js';
import platformMapper from  '../config/platformMapper.js'

let mysqlPromise;

mysqlPromise = mysqlDb.promise();

export const getAllChatLogs = async () => {
  const [rows] = await mysqlPromise.query('SELECT * FROM chatbot_logs');
  return rows;
};

//convert the project entries to lower case 
export const getChatLogByPlatform = async (id) => {
  var convertedId = parseInt(id);
const [rows] = await mysqlPromise.query(
  'SELECT * FROM chatbot_logs WHERE LOWER(project) = ?',
  [platformMapper.get(convertedId)]
);

  return rows;
};

export const createChatLog = async (message, user_id, project, remote_ip) => {
  // Convert project to lowercase
  const lowerProject = project.toLowerCase();

  const [result] = await mysqlPromise.query(
    'INSERT INTO chatbot_logs (message, user_id, project, remote_ip) VALUES (?, ?, ?, ?)',
    [message, user_id, lowerProject, remote_ip]
  );

  return { id: result.insertId, message, user_id, project: lowerProject, remote_ip };
};


export const updateChatLog = async (id, name, email) => {
  await mysqlPromise.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [
    name,
    email,
    id,
  ]);
  return { id, name, email };
};

export const deleteChatLog = async (id) => {
  await mysqlPromise.query('DELETE FROM users WHERE id = ?', [id]);
  return { message: 'User deleted successfully' };
};
