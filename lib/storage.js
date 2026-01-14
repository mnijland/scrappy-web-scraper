const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

export function getSessionFilePath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

export function getAllSessions() {
  const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));
  const sessions = files.map(file => {
    try {
      const data = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading session file ${file}:`, error);
      return null;
    }
  }).filter(Boolean);
  
  // Sort by updated at desc
  return sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getSession(id) {
  const filePath = getSessionFilePath(id);
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

export function saveSession(session) {
  const filePath = getSessionFilePath(session.id);
  session.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
  return session;
}

export function deleteSession(id) {
  const filePath = getSessionFilePath(id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
