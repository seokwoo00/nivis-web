const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const UserStore = require('../models/UserStore');

// 회원가입 페이지
router.get('/signup', (req, res) => {
  res.render('signup', { title: '회원가입 - NIVIS', error: null });
});

// 회원가입 처리
router.post('/signup', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password || !nickname) {
      return res.render('signup', { title: '회원가입 - NIVIS', error: '모든 필드를 입력하세요.' });
    }

    const existing = await UserStore.findByUsername(username);
    if (existing) {
      return res.render('signup', { title: '회원가입 - NIVIS', error: '이미 존재하는 아이디입니다.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await UserStore.createUser({ username, passwordHash: hash, nickname });

    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('signup', { title: '회원가입 - NIVIS', error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 페이지
router.get('/login', (req, res) => {
  res.render('login', { title: '로그인 - NIVIS', error: null });
});

// 로그인 처리
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserStore.findByUsername(username);
    if (!user) {
      return res.render('login', { title: '로그인 - NIVIS', error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.render('login', { title: '로그인 - NIVIS', error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { title: '로그인 - NIVIS', error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;