# VibeLog - 구현 계획서

## 목표 설명 (Goal Description)
개발자 중심의 코딩 챌린지 웹 애플리케이션 "VibeLog"를 구축합니다. 매일의 코딩 활동을 기록하고, 깃허브 스타일의 '잔디(Grass)'로 시각화하며, 커뮤니티와 바이브를 공유하는 공간입니다.

## 기술 스택 (Technology Stack)
- **프레임워크**: Next.js 14+ (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS (다크 모드 검증됨)
- **백엔드**: Supabase (Auth, Postgres, Realtime)
- **아이콘**: Material Symbols (Google Fonts)

---

## 1. 디렉토리 구조 및 컴포넌트

```text
src/
├── components/
│   ├── ui/                    # 기본 UI 컴포넌트
│   │   ├── button.tsx         # 버튼 (Primary/Ghost)
│   │   ├── card.tsx           # 카드 (기본 배경 스타일)
│   │   ├── avatar.tsx         # 사용자 프로필 이미지
│   │   └── badge.tsx          # 레벨/태그 배지
│   │
│   ├── layout/                # 레이아웃 구조
│   │   ├── header.tsx         # 상단 고정 내비게이션
│   │   ├── bottom-nav.tsx     # 모바일 하단 내비게이션
│   │
│   ├── feed/                  # 피드 관련 기능
│   │   ├── feed-list.tsx      # 무한 스크롤 컨테이너
│   │   └── post-card.tsx      # 포스트 카드 (텍스트/코드/마일스톤)
│   │
│   ├── notification/          # [NEW] 알림 기능
│   │   └── notification-box.tsx # 알림 목록 팝업 (종 아이콘 클릭 시)
│   │
│   ├── profile/               # 프로필 관련 기능
│   │   ├── profile-header.tsx # 사용자 통계 및 정보
│   │   └── heatmap-grid.tsx   # 잔디 심기 (기여도 그래프)
│   │
│   └── admin/                 # [NEW] 관리자용 컴포넌트
│       └── admin-tabel.tsx    # 데이터 관리 테이블
│
├── app/
    ├── page.tsx               # 메인 피드
    ├── login/page.tsx         # [NEW] 로그인 페이지
    ├── admin/page.tsx         # [NEW] 관리자 대시보드
    ├── profile/page.tsx       # 프로필 페이지
    └── layout.tsx             # 루트 레이아웃
```

## 2. 데이터 스키마 (TypeScript)

### 사용자 프로필 (User Profile)
```typescript
interface Profile {
  id: string;              // UUID
  username: string;        // "AlexDev"
  role: 'user' | 'admin';  // [NEW] 권한 구분
  level: number;           // 12
  stats: {
    streak: number;        // 12 (연속 달성일)
    total_logs: number;    // 82 (총 기록 수)
  };
}
```

### 활동 로그 (Activity Log - 잔디 데이터)
```typescript
interface ActivityLog {
  id: string;
  category: 'Coding' | 'Study' | 'Debug';
  duration_min: number;    // 45 (분 단위)
  logged_at: string;       // ISO 날짜 문자열
}
```

### 알림 (Notification) [NEW]
```typescript
interface Notification {
  id: string;
  user_id: string;         // 받는 사람
  sender_id: string;       // 보낸 사람 (ex: 철수)
  type: 'like' | 'comment';
  message: string;         // "철수님이 회원님의 글을 좋아합니다."
  is_read: boolean;        // 읽음 여부
  created_at: string;
}
```

---

## 3. 단계별 실행 계획 (Step-by-Step Execution Plan)

### 1단계: 기초 설정 및 구성
**목표**: 프로젝트를 초기화하고 DB 연결을 수립합니다.
1. [ ] **Next.js 초기화**: App Router, TypeScript, Tailwind 포함.
2. [ ] **Supabase 설정**: 프로젝트 생성 및 SQL 테이블(`profiles`, `logs`, `posts`, `notifications`) 생성.
3. [ ] **테마 이식**: HTML 프로토타입의 색상/폰트를 `tailwind.config.ts` 복사.
> **검토 포인트 (Review Point)**: 다크 모드가 정상 작동하는지, Supabase 클라이언트가 연결되는지 확인.

### 2단계: UI 컴포넌트 변환
**목표**: HTML 프로토타입을 재사용 가능한 React 컴포넌트로 변환합니다.
1. [ ] **Atomic 디자인**: `Button`, `Card`, `Badge` 컴포넌트 생성.
2. [ ] **레이아웃**: `Header`, `BottomNav` 및 활성 상태 구현.
3. [ ] **페이지 구현**: 
    - [ ] `Login` 페이지 UI
    - [ ] `Admin` 대시보드 UI
    - [ ] `Feed` 및 `Profile` 페이지 더미 데이터 구현
    - [ ] `Notification` 팝업 UI
> **검토 포인트 (Review Point)**: Next.js 페이지와 원본 HTML 파일의 디자인 일치 여부 확인.

### 3단계: 핵심 기능 및 인증 구현
**목표**: 앱을 실제 작동하게 만듭니다.
1. [ ] **인증 시스템**: 
    - [ ] `Supabase Auth`를 활용한 백그라운드 처리 (ID: `user@vibe.log`, PW: `PIN`).
    - [ ] 로그인 UI: `이름` + `PIN(4자리)` 입력 폼.
2. [ ] **관리자 기능**:
    - [ ] 사용자 등록 기능 (이름 & PIN 입력 -> `signUp` 호출).
    - [ ] 관리자 페이지 보호 (Middleware).
3. [ ] **활동 기록**: 로그 추가 폼 생성 -> DB 업데이트 -> 잔디 갱신.
4. [ ] **피드 렌더링**: DB에서 포스트를 가져와 `FeedList`에 표시.
5. [ ] **알림 센터**:
    - [ ] `notifications` 테이블 및 트리거(Trigger) 생성.
    - [ ] 실시간 구독(Realtime) 및 알림 팝업 UI 구현.
> **검토 포인트 (Review Point)**: 
> 1. 관리자 페이지에서 '짱구' / '1234' 등록.
> 2. 로그아웃 후 '짱구' / '1234'로 로그인 성공 확인.
> 3. 다른 사람이 내 글에 좋아요 누르면 실시간 알림 도착 확인.

### 4단계: 마무리 및 배포
**목표**: 프로덕션 준비 완료.
1. [ ] **애니메이션**: 마이크로 인터랙션 추가 (좋아요 버튼 바운스, 모달 페이드인).
2. [ ] **최적화**: SEO 메타 태그, 이미지 최적화.
3. [ ] **배포**: Vercel 배포.
> **검토 포인트 (Review Point)**: Lighthouse 성능 점수 및 모바일 반응성 확인.

### 5단계: 고도화 (Advanced / Post-MVP)
**목표**: 사용자 경험을 한 단계 더 끌어올립니다.
1. [ ] **웹 푸시 (Web Push)**: 브라우저가 꺼져 있어도 알림 수신 (Service Worker + FCM).
2. [ ] **PWA 적용**: 모바일 홈 화면에 앱처럼 설치 가능하도록 설정.
3. [ ] **소셜 로그인**: 이메일/GitHub 등 소셜 로그인 추가 지원.
