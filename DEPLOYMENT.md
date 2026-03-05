# Daily Planner MVP - 배포 가이드

## Neon 데이터베이스 설정 (권장 - 무료)

Neon은 서버리스 PostgreSQL을 제공하는 플랫폼입니다.

### 1. Neon DB 생성
1. [Neon](https://neon.tech) 접속 및 로그인 (GitHub 로그인 권장)
2. **New Project** 클릭
3. 데이터베이스 이름 생성 후 **Create Project** 클릭
4. 대시보드에서 `DATABASE_URL` 연결 문자열 복사
   (예: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`)

### 2. 백엔드 배포 (Vercel 또는 기타 호스팅)
NestJS 백엔드를 Vercel 등에 배포합니다.
환경 변수 (`.env`) 설정에 방금 복사한 Neon의 `DATABASE_URL`을 추가해야 합니다.

**백엔드 필수 환경변수:**
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
CORS_ORIGINS=https://your-frontend-domain.vercel.app
PORT=3000
JWT_SECRET=your-secret-key
```

### 3. 프론트엔드 배포 (Vercel)
Next.js 프론트엔드를 Vercel에 배포합니다.

1. [Vercel](https://vercel.com) 로그인
2. **Add New...** -> **Project** 클릭
3. 저장소 선택 후 **Root Directory**를 `frontend`로 설정
4. **Environment Variables** 추가:
   - `NEXT_PUBLIC_API_URL`: 배포된 백엔드 URL
5. **Deploy** 클릭

---

## 환경 변수 요약

### Backend
| 변수명 | 설명 |
|--------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 문자열 |
| `PORT` | 서버 포트 (보통 자동 설정됨) |
| `CORS_ORIGINS` | 허용할 프론트엔드 URL |
| `JWT_SECRET` | 인증용 시크릿 키 |

### Frontend
| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL |

---

## 로컬 테스트 (배포 전 확인)

로컬에서 Neon 데이터베이스와 연결하여 테스트하려면:

1. `backend/.env` 파일에 Neon의 `DATABASE_URL` 추가
2. 터미널 1 (Backend):
   ```bash
   cd backend && npm run start:dev
   ```
3. 터미널 2 (Frontend):
   ```bash
   cd frontend && npm run dev
   ```
