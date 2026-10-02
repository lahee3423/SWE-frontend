This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## 로컬 백엔드 연결과 계정

백엔드를 `http://127.0.0.1:8000`에서 실행한 뒤 `npm run dev`로 프론트엔드를 시작합니다.
브라우저에서는 `http://localhost:3000`을 사용합니다. `next.config.ts`가 `/api/*`, `/media/*`를
백엔드로 전달하므로 로그인 쿠키는 동일 출처의 HttpOnly 쿠키로 유지됩니다.
다른 백엔드 주소를 쓰려면 `.env.local`에 `BACKEND_URL`을 설정하고 Next.js를 재시작합니다.

- LOGIN → SIGN UP에서 이메일과 8~128자 비밀번호로 가입하면 자동 로그인됩니다.
- PHOTO UPLOAD는 실제 검색 API를 호출합니다. 로그인 상태에서 완료된 검색만 ARCHIVE에 저장됩니다.
- ARCHIVE에서 검색 사진/결과 재조회, 개별 삭제, 전체 삭제, 10분 이내 RETURN 복원이 가능합니다.
- 로그아웃하면 서버 세션이 폐기됩니다. 새로고침할 때 서버에서 로그인 상태를 복원합니다.
- TEST 메뉴는 기존 디자인 예시 화면입니다. 실제 업로드 결과와 분리되어 있습니다.
- SAVED는 기존 로컬 찜 데모 기능입니다. 계정별 DB 저장은 로그인/검색 기록에 적용되어 있습니다.

검증: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
로컬 환경의 Turbopack 포트 생성 오류를 피하도록 프로덕션 빌드는 Webpack을 사용합니다. 개발 서버는 기존 Next.js 설정을 유지합니다.
