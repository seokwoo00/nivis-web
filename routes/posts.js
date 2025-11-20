const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const PostStore = require('../models/PostStore');
const CommentStore = require('../models/CommentStore');
const UserStore = require('../models/UserStore');

// 카테고리 설정
const CATEGORY_CONFIG = {
  archive: { label: '자료실', className: 'nv-tag-archive' },
  notice: { label: '공지사항', className: 'nv-tag-notice' },
  free: { label: '자유게시판', className: 'nv-tag-free' }
};

function resolveCategory(cat) {
  if (!cat) return 'free';
  if (CATEGORY_CONFIG[cat]) return cat;
  return 'free';
}

// 로그인 확인 미들웨어
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

// Multer 설정 (파일 / 이미지 업로드)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({ storage });

// 공통으로 포스트 목록 포맷팅
async function buildPostList(filterCategory = null) {
  const posts = await PostStore.getAllPosts();
  const users = await UserStore.getAllUsers();
  const userMap = new Map(users.map(u => [Number(u.id), u]));

  let filtered = posts.slice();
  if (filterCategory) {
    filtered = filtered.filter(p => resolveCategory(p.category) === filterCategory);
  }

  return filtered
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(p => {
      const catKey = resolveCategory(p.category);
      const cfg = CATEGORY_CONFIG[catKey];
      return {
        ...p,
        categoryKey: catKey,
        categoryLabel: cfg.label,
        categoryClass: cfg.className,
        authorNickname: userMap.get(Number(p.authorId)) ? userMap.get(Number(p.authorId)).nickname : '알 수 없음',
        createdAtFormatted: new Date(p.createdAt).toLocaleString('ko-KR')
      };
    });
}

// 메인 페이지 - 전체 게시글
router.get('/', async (req, res) => {
  try {
    const posts = await buildPostList(null);
    res.render('index', { title: 'NIVIS - 메인', posts, boardTitle: '전체 글' });
  } catch (err) {
    console.error(err);
    res.status(500).send('게시글 목록을 불러오는 중 오류가 발생했습니다.');
  }
});

// 자료실
router.get('/board/archive', async (req, res) => {
  try {
    const posts = await buildPostList('archive');
    res.render('index', { title: '자료실 - NIVIS', posts, boardTitle: '자료실' });
  } catch (err) {
    console.error(err);
    res.status(500).send('게시글 목록을 불러오는 중 오류가 발생했습니다.');
  }
});

// 공지사항
router.get('/board/notice', async (req, res) => {
  try {
    const posts = await buildPostList('notice');
    res.render('index', { title: '공지사항 - NIVIS', posts, boardTitle: '공지사항' });
  } catch (err) {
    console.error(err);
    res.status(500).send('게시글 목록을 불러오는 중 오류가 발생했습니다.');
  }
});

// 자유게시판
router.get('/board/free', async (req, res) => {
  try {
    const posts = await buildPostList('free');
    res.render('index', { title: '자유게시판 - NIVIS', posts, boardTitle: '자유게시판' });
  } catch (err) {
    console.error(err);
    res.status(500).send('게시글 목록을 불러오는 중 오류가 발생했습니다.');
  }
});

// 작성 페이지
router.get('/posts/new', requireLogin, (req, res) => {
  res.render('new_post', { title: '새 글 작성 - NIVIS' });
});

// 게시글 작성 처리
router.post('/posts', requireLogin, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const file = req.files && req.files['file'] ? req.files['file'][0] : null;
    const image = req.files && req.files['image'] ? req.files['image'][0] : null;

    const catKey = resolveCategory(category);

    await PostStore.createPost({
      title,
      content,
      filePath: file ? '/uploads/' + file.filename : null,
      imagePath: image ? '/uploads/' + image.filename : null,
      authorId: req.session.userId,
      category: catKey
    });

    // 작성 후 해당 게시판으로 이동
    if (catKey === 'archive') return res.redirect('/board/archive');
    if (catKey === 'notice') return res.redirect('/board/notice');
    if (catKey === 'free') return res.redirect('/board/free');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('게시글 작성 중 오류가 발생했습니다.');
  }
});

// 게시글 상세 + 댓글
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await PostStore.getPostById(postId);
    if (!post) return res.status(404).send('게시글을 찾을 수 없습니다.');

    const author = await UserStore.findById(post.authorId);
    const catKey = resolveCategory(post.category);
    const cfg = CATEGORY_CONFIG[catKey];

    const postView = {
      ...post,
      categoryKey: catKey,
      categoryLabel: cfg.label,
      categoryClass: cfg.className,
      authorNickname: author ? author.nickname : '알 수 없음',
      createdAtFormatted: new Date(post.createdAt).toLocaleString('ko-KR')
    };

    const comments = await CommentStore.getCommentsByPostId(postId);
    const users = await UserStore.getAllUsers();
    const userMap = new Map(users.map(u => [Number(u.id), u]));

    const enrichedComments = comments
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(c => ({
        ...c,
        authorNickname: userMap.get(Number(c.authorId)) ? userMap.get(Number(c.authorId)).nickname : '알 수 없음',
        createdAtFormatted: new Date(c.createdAt).toLocaleString('ko-KR')
      }));

    const rootComments = enrichedComments.filter(c => !c.parentCommentId);
    const repliesByParent = {};
    enrichedComments.forEach(c => {
      if (c.parentCommentId) {
        const parentId = String(c.parentCommentId);
        if (!repliesByParent[parentId]) repliesByParent[parentId] = [];
        repliesByParent[parentId].push(c);
      }
    });

    res.render('post_detail', {
      title: post.title + ' - NIVIS',
      post: postView,
      rootComments,
      repliesByParent
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('게시글 조회 중 오류가 발생했습니다.');
  }
});

// 댓글 작성
router.post('/posts/:id/comments', requireLogin, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    await CommentStore.createComment({
      postId,
      authorId: req.session.userId,
      content
    });

    res.redirect('/posts/' + postId);
  } catch (err) {
    console.error(err);
    res.status(500).send('댓글 작성 중 오류가 발생했습니다.');
  }
});

// 대댓글 작성 (1단계만 허용)
router.post('/comments/:id/replies', requireLogin, async (req, res) => {
  try {
    const parentCommentId = req.params.id;
    const { content } = req.body;

    const allComments = await CommentStore.getAllComments();
    const parent = allComments.find(c => Number(c.id) === Number(parentCommentId));
    if (!parent) {
      return res.status(404).send('댓글을 찾을 수 없습니다.');
    }

    if (parent.parentCommentId) {
      return res.status(400).send('이 댓글에는 더 이상 답글을 달 수 없습니다.');
    }

    await CommentStore.createComment({
      postId: parent.postId,
      authorId: req.session.userId,
      content,
      parentCommentId: parent.id
    });

    res.redirect('/posts/' + parent.postId);
  } catch (err) {
    console.error(err);
    res.status(500).send('답글 작성 중 오류가 발생했습니다.');
  }
});

module.exports = router;