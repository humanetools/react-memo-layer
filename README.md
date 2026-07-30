# react-memo-layer

포스트잇 스타일 메모 오버레이 — 어떤 React 앱에도 붙일 수 있는 저장소 독립(adapter 주입) 라이브러리.

## 개념

- **anchorKey**: 메모가 붙는 위치의 문자열 키. 페이지 경로(`/media`)든 UI 상태(`/media?role=api-file`)든 호스트 앱이 정한다.
- **adapter**: `list / create / update / remove` 4개 함수를 호스트 앱이 구현해 주입 — REST, Supabase, localStorage 무엇이든.
- **형상(버전) 관리**: 라이브러리는 `list()`가 돌려주는 `versionLabel`을 표시만 한다. 버전 선택·CRUD는 호스트 앱(백엔드) 소관.

## 사용

```tsx
import { MemoLayer, MemoModeToggle, type MemoAdapter } from "react-memo-layer";

const adapter: MemoAdapter = {
  async list(anchorKey) { /* → { versionLabel, notes } */ },
  async create(note) { /* → MemoNote(id 포함) */ },
  async update(id, patch) {},
  async remove(id) {},
};

function App() {
  const [memoMode, setMemoMode] = useState(false);
  return (
    <>
      <MemoModeToggle active={memoMode} onToggle={() => setMemoMode(!memoMode)} />
      <MemoLayer
        anchorKey={location.pathname}
        adapter={adapter}
        user={{ name: "yubin", email: "yubin@example.com" }}
        active={memoMode}
        onExitMode={() => setMemoMode(false)}
      />
    </>
  );
}
```

- 토글 켜고 화면 클릭 → 그 자리에 포스트잇 생성 (좌표: 문서 가로폭 % + 상단 px)
- 헤더 드래그로 이동, × 로 삭제, 내용은 blur 시 저장
- 헤더에 작성자 이름 · 버전 라벨 표시

## 설치 (git dependency)

```bash
npm install github:humanetools/react-memo-layer
```

`prepare` 스크립트가 설치 시 자동 빌드한다.
