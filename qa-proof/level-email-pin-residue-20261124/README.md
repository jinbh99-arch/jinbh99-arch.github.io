# 01 LEVEL 이메일 QA PIN 오류후 DOM 잔류 수정 증거

- 작업 ID: `00Q-00-D0GAP`
- 원본: `79c073978be06b232b9c8728a14179a1d4f2535c` / blob `48a633a0c24313af7a8758276e8f9f19a66fb848`
- 격리 후보: `a2fcb23f14940daa6c0578b5ecf75625d0faf10b` / blob `5e8d6d436d929a3c4c35ab1926ae5fd883b891e8`
- 공개 main, Supabase Edge v7, 실 이메일·PIN·DB 변경 없음.

## 최소 수정

PIN을 지역변수로 읽은 직후 DOM 입력값을 비우고, grant를 일회성 지역변수로 이동한 뒤 전역 참조를 제거했다. 성공·실패 모두 `finally`에서 PIN을 다시 비우고, 실패 시 token을 비운다. `pagehide`에서 PIN/grant/token을 모두 비운다.

## 실행 결과

V8 결합 실행 4/4 PASS: enroll 성공→verify 401, enroll 503, 유효성 오류, 정상 성공. 모든 경우 PIN input 빈값, hash 빈값, local/sessionStorage 쓰기0, pagehide 후 PIN 빈값. 실패 뒤 같은 화면 재시도는 grant가 이미 폐기되어 API 추가호출0.

## 미검증

`ENV_BLOCKED: executor Chromium process_singleton_posix socket() failed: Operation not permitted (1)`. 따라서 실제 Chromium 320/390 PNG는 N/T이며 06의 접근 가능한 브라우저에서 새 SHA만 독립검증 필요. 합성 V8 결과를 실제 브라우저 PASS로 승격하지 않는다.
