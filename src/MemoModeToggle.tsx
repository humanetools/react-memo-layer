/** 메모 모드 토글 아이콘 버튼 (스티키노트 모양) */
export function MemoModeToggle({
  active,
  onToggle,
  title = "메모 모드 — 켠 뒤 화면을 클릭하면 포스트잇이 생성됩니다",
}: {
  active: boolean;
  onToggle: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onToggle}
      title={title}
      aria-pressed={active}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        border: active ? "1px solid #eab308" : "1px solid transparent",
        background: active ? "#fef9c3" : "transparent",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#a16207" : "#555"} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z" />
        <path d="M15 3v5a1 1 0 0 0 1 1h5" />
      </svg>
    </button>
  );
}
