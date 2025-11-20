const { readJson, writeJson, nextId } = require('./db');

const FILE = 'comments.json';

async function getAllComments() {
  return await readJson(FILE, []);
}

async function getCommentsByPostId(postId) {
  const comments = await getAllComments();
  const id = Number(postId);
  return comments.filter(c => Number(c.postId) === id);
}

async function createComment({ postId, authorId, content, parentCommentId = null }) {
  const comments = await getAllComments();
  const id = nextId(comments);
  const now = new Date().toISOString();
  const comment = {
    id,
    postId: Number(postId),
    authorId: Number(authorId),
    content,
    parentCommentId: parentCommentId ? Number(parentCommentId) : null,
    createdAt: now,
    updatedAt: now
  };
  comments.push(comment);
  await writeJson(FILE, comments);
  return comment;
}

module.exports = {
  getAllComments,
  getCommentsByPostId,
  createComment
};