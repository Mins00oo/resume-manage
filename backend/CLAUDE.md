# Resume Manage — Backend

Spring Boot 3.4.1 + Java 21 + MySQL 8 백엔드.

## 실행

```bash
./gradlew bootRun                       # 로컬 실행 (profile: local)
./gradlew compileJava                   # 컴파일만
./gradlew build -x test                 # 빌드 (테스트 제외)
./gradlew test                          # 테스트
```

## 디렉토리

```
backend/
├── build.gradle.kts / settings.gradle.kts
├── src/main/
│   ├── java/com/resumemanage/
│   │   ├── ResumeManageApplication.java
│   │   ├── common/                 # 공통 (base entity, dto, exception, config, security)
│   │   ├── user/                   # 사용자 도메인
│   │   ├── resume/                 # 이력서 도메인 (루트 + 11개 서브 엔티티)
│   │   ├── jobapply/               # 지원 도메인
│   │   ├── file/                   # 파일 업로드 도메인
│   │   └── notification/           # 푸시 구독 도메인
│   └── resources/
│       ├── application.yml / application-local.yml
│       └── db/migration/           # Flyway SQL
```

각 도메인은 `domain/` (엔티티 + enum), `repository/`, `application/` (service),
`presentation/` (controller), `dto/` 로 나뉜다.

## 엔티티 컨벤션 (DDD-ish)

- `@Setter` 금지. 상태 변경은 **이름 있는 비즈니스 메서드** (`rename`, `transitionTo`, `applyAiRevisedDescription` 등)
- `@NoArgsConstructor(access = PROTECTED)` — JPA 전용
- 생성은 `@Builder` + `private` 생성자로만
- 단방향 `@ManyToOne` 선호. 부모가 자식 List 들고 있지 않음 → 리포지토리로 조회
- `BaseTimeEntity` / `SoftDeletableEntity` 상속으로 감사 필드 자동

## DB 마이그레이션

- Flyway 로 관리. `V1__init_schema.sql` 이 초기 스키마.
- 스키마 변경은 **반드시 새 버전 파일**(`V2__...`)로 추가. V1 수정 금지 (체크섬 오류 발생).
- 개발 중 스키마 갈아엎고 싶으면 DB drop → recreate 후 재기동.

## 핵심 포인트

- `ddl-auto: validate` — Hibernate 가 엔티티와 실제 스키마 일치 검증
- `open-in-view: false` — 서비스 레이어 밖 지연로딩 방지
- JSON 컬럼은 `@JdbcTypeCode(SqlTypes.JSON)` 으로 매핑
- `JobApply.transitionTo()` 내부에 상태 전이 규칙 캡슐화 — 서비스는 호출만
- 대표 이력서 1개 제약은 애플리케이션 레벨에서 검증 (MySQL 부분 유니크 인덱스 미지원)
