# Daily Planner MVP - 배포 가이드

## Railway 배포 (권장 - 무료)

Railway는 프론트엔드, 백엔드, 데이터베이스를 한 곳에서 배포할 수 있는 플랫폼입니다.

### 사전 준비
1. [Railway](https://railway.app) 계정 생성 (GitHub 로그인 권장)
2. 프로젝트를 GitHub에 푸시

### 배포 단계

#### Step 1: GitHub에 코드 푸시
```bash
git add .
git commit -m "chore: prepare for Railway deployment"
git push origin main
```

#### Step 2: Railway 프로젝트 생성
1. [Railway Dashboard](https://railway.app/dashboard)에 로그인
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. Repository 연결 (The end planner_antigravity)

#### Step 3: PostgreSQL 데이터베이스 추가
1. Railway 프로젝트에서 **+ New** 클릭
2. **Database** → **PostgreSQL** 선택
3. 자동으로 DB가 생성됨

#### Step 4: 백엔드 서비스 설정
1. **+ New** → **GitHub Repo** → 같은 레포 선택
2. **Settings** 탭:
   - **Root Directory**: `backend`
   - **Watch Patterns**: `backend/**`
3. **Variables** 탭에서 환경변수 설정:
   ```
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_DATABASE=${{Postgres.PGDATABASE}}
   PORT=3000
   ```
4. **Settings** → **Networking** → **Generate Domain** 클릭
5. 생성된 URL 복사 (예: `backend-xxx.up.railway.app`)

#### Step 5: 프론트엔드 서비스 설정
1. **+ New** → **GitHub Repo** → 같은 레포 선택
2. **Settings** 탭:
   - **Root Directory**: `frontend`
   - **Watch Patterns**: `frontend/**`
3. **Variables** 탭에서 환경변수 설정:
   ```
   VITE_API_URL=https://backend-xxx.up.railway.app
   ```
   (Step 4에서 복사한 백엔드 URL 사용)
4. **Settings** → **Networking** → **Generate Domain** 클릭

#### Step 6: 백엔드 CORS 설정 업데이트
1. 백엔드 서비스의 **Variables** 탭으로 이동
2. 아래 변수 추가:
   ```
   CORS_ORIGINS=https://frontend-xxx.up.railway.app
   ```
   (Step 5에서 생성된 프론트엔드 URL 사용)

### 배포 완료! 🎉
- 프론트엔드 URL로 접속하면 앱을 사용할 수 있습니다.
- Railway Free Plan: 월 $5 크레딧 제공 (소규모 프로젝트에 충분)

---

## 대안: Vercel + Railway

프론트엔드만 Vercel에 배포하고 싶다면:

### Vercel (프론트엔드)
1. [Vercel](https://vercel.com) 가입
2. Import Git Repository
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Environment Variables:
   - `VITE_API_URL`: Railway 백엔드 URL

### Railway (백엔드 + DB)
위 Step 3~4와 동일

---

## 환경 변수 요약

### Backend
| 변수명 | 설명 |
|--------|------|
| `DB_HOST` | PostgreSQL 호스트 |
| `DB_PORT` | PostgreSQL 포트 (5432) |
| `DB_USERNAME` | DB 사용자명 |
| `DB_PASSWORD` | DB 비밀번호 |
| `DB_DATABASE` | DB 이름 |
| `PORT` | 서버 포트 (Railway가 자동 설정) |
| `CORS_ORIGINS` | 허용할 프론트엔드 URL(들) |

### Frontend
| 변수명 | 설명 |
|--------|------|
| `VITE_API_URL` | 백엔드 API URL |

---

## 로컬 테스트 (배포 전 확인)

```bash
# 터미널 1: DB
docker-compose up -d

# 터미널 2: Backend
cd backend && npm run start

# 터미널 3: Frontend (production build)
cd frontend && npm run build && npx serve dist -s -l 5173
```
