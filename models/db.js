const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function getFilePath(name) {
  return path.join(dataDir, name);
}

async function readJson(name, defaultValue) {
  const filePath = getFilePath(name);
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    if (!data.trim()) return defaultValue;
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return defaultValue;
    }
    throw err;
  }
}

async function writeJson(name, value) {
  const filePath = getFilePath(name);
  const tmpPath = filePath + '.tmp';
  const json = JSON.stringify(value, null, 2);
  await fs.promises.writeFile(tmpPath, json, 'utf-8');
  await fs.promises.rename(tmpPath, filePath);
}

function nextId(items) {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(i => Number(i.id) || 0)) + 1;
}

module.exports = {
  readJson,
  writeJson,
  nextId
};