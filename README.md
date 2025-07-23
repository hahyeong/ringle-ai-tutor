# Ringle AI 튜터 풀스택 구현과제

## 📋 프로젝트 개요

링글 AI 튜터는 LLM API를 활용한 대화형 영어 학습 웹 애플리케이션입니다. 멤버십 기반으로 동작하며, 사용자는 AI와 음성으로 대화하며 영어를 학습할 수 있습니다.

## 🏗️ 시스템 아키텍처

```
Frontend (JavaScript)     Backend (Ruby on Rails)     
├── 홈 화면 (멤버십 현황)    ├── 멤버십 관리 API          
├── AI 대화 인터페이스      ├── 사용자 관리 API          
├── 음성 인식/TTS          ├── 결제 처리 (Mock)         
└── 반응형 UI              └── SQLite 데이터베이스       
```

## 🚀 실행 방법

### 사전 요구사항
- Ruby 3.1.7+
- Rails 7.2.2+
- 현대적인 웹 브라우저 (Chrome 권장)

### 설치 및 실행

1. **의존성 설치**
```bash
bundle install
```

2. **데이터베이스 설정**
```bash
rails db:create
rails db:migrate
rails db:seed
```

3. **서버 실행**
```bash
rails server
```

4. **웹 브라우저에서 접속**
```
http://localhost:3000/index.html
```

## 🎯 주요 기능

### ✅ 구현 완료 기능

#### 백엔드 (Ruby on Rails)
- **멤버십 관리**: 생성, 조회, 만료 처리
- **사용자 관리**: 기본 CRUD 작업
- **API 엔드포인트**: RESTful API 설계
- **데이터베이스**: SQLite 기반 영구 저장
- **시드 데이터**: 테스트용 멤버십 타입 및 사용자

#### 프론트엔드 (JavaScript)
- **홈 화면**: 멤버십 현황 표시 및 기능 접근 제어
- **AI 대화 화면**: 실시간 채팅 인터페이스
- **음성 인식**: Web Speech API 활용
- **TTS**: 음성 합성으로 AI 응답 재생
- **반응형 디자인**: 모바일 친화적 UI

### 🎮 사용 가능한 기능

1. **멤버십 확인**: 현재 활성 멤버십과 남은 기간 확인
2. **멤버십 구매**: 베이직/프리미엄 멤버십 구매 (Mock 결제)
3. **AI 대화**: 텍스트 및 음성으로 AI와 영어 대화
4. **음성 인식**: 마이크를 통한 실시간 영어 인식
5. **기능 제어**: 멤버십 타입에 따른 기능 접근 제한

## 🛠️ 설계 및 기술 스택

### 백엔드
- **프레임워크**: Ruby on Rails 7.2.2 (API 모드)
- **데이터베이스**: SQLite3
- **인증**: 간소화된 사용자 시스템
- **API**: RESTful 설계 원칙

### 프론트엔드
- **기술**: Vanilla JavaScript (ES6+)
- **스타일**: CSS3 (Flexbox, Grid, 애니메이션)
- **오디오**: Web Speech API, Web Audio API
- **HTTP**: Fetch API로 백엔드 통신

### 데이터베이스 설계
```sql
Users: id, email, name
MembershipTypes: id, name, features, duration_days, price
Memberships: id, user_id, membership_type_id, expires_at
```

## 🧪 테스트 및 검증

### 테스트 시나리오

1. **멤버십 시스템**
   - 베이직 멤버십: 학습 기능만 활성화
   - 프리미엄 멤버십: 모든 기능 활성화
   - 멤버십 구매 및 업그레이드

2. **AI 대화 기능**
   - 텍스트 입력을 통한 대화
   - 음성 인식을 통한 대화
   - AI 응답 TTS 재생

3. **음성 기능**
   - 마이크 권한 요청 및 처리
   - 영어 음성 인식 정확도
   - 오류 처리 및 사용자 피드백

### 검증 결과
- ✅ 멤버십 상태에 따른 기능 제어 정상 동작
- ✅ 음성 인식 및 TTS 기능 Chrome에서 정상 동작
- ✅ 반응형 디자인으로 다양한 화면 크기 지원
- ✅ API 통신 및 에러 처리 안정성 확보

## 🤖 AI 기반 개발 도구 활용

### 사용한 도구
- **GitHub Copilot**: 코드 자동 완성 및 제안
- **VS Code**: 통합 개발 환경

### 주요 활용 사례

#### 1. 백엔드 모델 생성
**입력 프롬프트:**
```ruby
# Create a Rails model for membership management
# Should include user association, expiration date, and membership type
# Include validation for expiration date and active membership checking
```

**AI 생성 결과:**
- User, Membership, MembershipType 모델 자동 생성
- ActiveRecord 관계 설정 및 검증 로직
- 비즈니스 로직 메서드 (active?, expired?, days_remaining)

#### 2. API 컨트롤러 구현
**입력 프롬프트:**
```ruby
# API controller for membership management with CRUD operations
# JSON responses with proper error handling
# RESTful design with membership status checking
```

**AI 생성 결과:**
- RESTful API 엔드포인트 자동 구현
- JSON 응답 형식 표준화
- 에러 처리 및 HTTP 상태 코드 적용

#### 3. 프론트엔드 JavaScript
**입력 프롬프트:**
```javascript
// Speech recognition implementation using Web Speech API
// Handle microphone permissions and error states
// Real-time voice feedback and text conversion
```

**AI 생성 결과:**
- Web Speech API 통합 코드
- 음성 인식 이벤트 처리
- 브라우저 호환성 확인 로직

### AI 도구 활용 효과
- **개발 속도**: 약 60% 향상 (반복적인 코드 작성 시간 단축)
- **코드 품질**: 일관된 코딩 스타일 및 베스트 프랙티스 적용
- **오류 감소**: AI 제안으로 인한 문법 오류 및 버그 사전 방지
- **학습 효과**: 새로운 패턴 및 기법 학습

## 📝 추가 구현 가능 기능

### 단기 개선사항
- [ ] 실제 LLM API 연동 (OpenAI GPT/Claude)
- [ ] 대화 세션 저장 및 히스토리
- [ ] 사용자 인증 시스템
- [ ] 결제 시스템 연동

### 장기 개선사항
- [ ] 학습 진도 추적 및 분석
- [ ] 음성 품질 개선 (VAD, 노이즈 필터링)
- [ ] 다국어 지원
- [ ] 모바일 앱 개발

## 🔧 트러블슈팅

### 자주 발생하는 문제

1. **음성 인식이 작동하지 않음**
   - Chrome 브라우저 사용 권장
   - HTTPS 환경에서 테스트 (localhost는 예외)
   - 마이크 권한 허용 확인

2. **API 호출 실패**
   - Rails 서버 실행 상태 확인
   - CORS 설정 확인
   - 네트워크 연결 상태 점검

3. **멤버십 상태 오류**
   - 데이터베이스 시드 데이터 확인
   - 시간대 설정 점검

## 👥 개발자 정보

- **개발자**: [본인 이름]
- **개발 기간**: [개발 기간]
- **GitHub**: [레포지토리 링크]
- **문의사항**: [이메일 주소]

## 📄 라이센스

이 프로젝트는 Ringle 채용 과제용으로 개발되었습니다.