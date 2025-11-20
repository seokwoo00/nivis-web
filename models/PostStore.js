const { readJson, writeJson, nextId } = require('./db');

const FILE = 'posts.json';

async function getAllPosts() {
  return await readJson(FILE, []);
}

async function getPostById(id) {
  const posts = await getAllPosts();
  const numId = Number(id);
  return posts.find(p => Number(p.id) === numId) || null;
}

async function createPost({ title, content, filePath, imagePath, authorId, category }) {
  const posts = await getAllPosts();
  const id = nextId(posts);
  const now = new Date().toISOString();
  const safeCategory = category || 'free';
  const post = {
    id,
    title,
    content,
    filePath: filePath || null,
    imagePath: imagePath || null,
    authorId: Number(authorId),
    category: safeCategory,
    createdAt: now,
    updatedAt: now
  };
  posts.push(post);
  await writeJson(FILE, posts);
  return post;
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost
};