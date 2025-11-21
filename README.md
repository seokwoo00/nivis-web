# NIVIS 게시판 

## 기능

- 메인 페이지
  - 상단 메뉴바 (4개 메뉴)
  - 우측 상단 로그인 / 회원가입 버튼 (로그인 시 로그아웃으로 전환)
  - 게시글 카드 형태 리스트
- 게시글 작성
  - 제목, 내용
  - 일반 파일 업로드
  - 이미지 업로드
- 회원 시스템
  - 회원가입 (아이디, 비밀번호, 닉네임)
  - 로그인 / 로그아웃
- 댓글 시스템
  - 댓글
  - 1단계 대댓글 (대댓글에 다시 댓글은 불가)
- 데이터 저장
  - `data/users.json`, `data/posts.json`, `data/comments.json` 에 저장

## 개발 환경 준비

### 1. Node.js 설치

Windows 또는 WSL(Ubuntu)에 Node.js LTS 버전을 설치

### 2. 의존성 설치

```bash
npm install
```

### 3. 서버 실행

```bash
npm run dev   # nodemon이 설치되어 있을 경우
# 또는
npm start
```

브라우저에서 `http://localhost:3000` 으로 접속
