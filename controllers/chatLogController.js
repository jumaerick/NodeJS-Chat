import * as ChatLog from '../models/chatLogModel.js';

export const getChatLogs = async (req, res) => {
  try {
    const chatsLogs = await ChatLog.getAllChatLogs();
    if (!chatsLogs) return res.status(404).json({ error: 'Chatlogs not found' });
    res.json(chatsLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatLogByPlatform = async (req, res) => {
  try {
    const chatsLogs = await ChatLog.getChatLogByPlatform(req.params.id);
    // for empty chats
    if (chatsLogs.length===0) return res.status(404).json({ error: 'Chatlogs not found' });
    res.json(chatsLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createChatLog = async (req, res) => {

  console.log('req:', req?.body);
  try {
    const { message, user_id, project, remote_ip } = req.body;
    const newChatLog = await ChatLog.createChatLog(message, user_id, project, remote_ip);
    res.status(201).json(newChatLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
