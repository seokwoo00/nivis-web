const { readJson, writeJson, nextId } = require('./db');

const FILE = 'users.json';

async function getAllUsers() {
  return await readJson(FILE, []);
}

async function findByUsername(username) {
  const users = await getAllUsers();
  return users.find(u => u.username === username) || null;
}

async function findById(id) {
  const users = await getAllUsers();
  const numId = Number(id);
  return users.find(u => Number(u.id) === numId) || null;
}

async function createUser({ username, passwordHash, nickname }) {
  const users = await getAllUsers();
  const id = nextId(users);
  const user = { id, username, passwordHash, nickname, createdAt: new Date().toISOString() };
  users.push(user);
  await writeJson(FILE, users);
  return user;
}

module.exports = {
  getAllUsers,
  findByUsername,
  findById,
  createUser
};