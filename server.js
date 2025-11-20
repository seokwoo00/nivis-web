const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// 업로드 디렉토리 보장
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// 뷰 엔진 설정 (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // views/layout.ejs 사용

// 미들웨어
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// 세션
app.use(session({
  secret: 'nivis-json-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// 로그인 정보 뷰에 전달
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  res.locals.currentUserNickname = req.session.nickname || null;
  next();
});

// 라우트
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

app.use('/auth', authRoutes);
app.use('/', postsRoutes);

// 404 처리
app.use((req, res) => {
  res.status(404).send('페이지를 찾을 수 없습니다.');
});

// 서버 시작
const port = 80;
app.listen(port, () => {
  console.log(`NIVIS(JSON) 서버가 포트 ${port}에서 실행 중입니다.`);
});