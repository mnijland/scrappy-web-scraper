import fs from 'fs';
import path from 'path';
import os from 'os';

// Use /tmp on serverless (Vercel) since the project directory is read-only.
// In local development, use <project>/data as before.
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel
  ? path.join(os.tmpdir(), 'scrappy-data')
  : path.join(process.cwd(), 'data');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create data directory:', error.message);
}

export function getSessionFilePath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

export function getAllSessions() {
  try {
    if (!fs.existsSync(DATA_DIR)) return [];
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
  } catch (error) {
    console.error('Error listing sessions:', error);
    return [];
  }
}

export function getSession(id) {
  const filePath = getSessionFilePath(id);
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing session file ${id}:`, error);
    return null;
  }
}

export function saveSession(session) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = getSessionFilePath(session.id);
    session.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    return session;
  } catch (error) {
    console.error('Error saving session:', error);
    return session;
  }
}

export function deleteSession(id) {
  const filePath = getSessionFilePath(id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
