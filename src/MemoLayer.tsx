import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PostIt } from "./PostIt";
import type { MemoAdapter, MemoNote, MemoUser } from "./types";

/**
 * 메모 오버레이. active=true 동안 화면 클릭마다 포스트잇 생성(모드 유지).
 * ESC 또는 배너의 종료 버튼으로 해제. 노트 좌표: x = 문서 가로폭 %, y = 문서 상단 px.
 */
export function MemoLayer({
  anchorKey,
  adapter,
  user,
  active,
  onExitMode,
  bannerLabel = "Memo mode — click anywhere to add a note",
  exitLabel = "Exit",
}: {
  anchorKey: string;
  adapter: MemoAdapter;
  user: MemoUser;
  active: boolean;
  onExitMode?: () => void;
  bannerLabel?: string;
  exitLabel?: string;
}) {
  const [notes, setNotes] = useState<MemoNote[]>([]);
  const [versionLabel, setVersionLabel] = useState<string | undefined>();
  const [lastCreated, setLastCreated] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const reload = useCallback(async () => {
    try {
      const res = await adapter.list(anchorKey);
      setNotes(res.notes);
      setVersionLabel(res.versionLabel);
    } catch {
      setNotes([]);
    }
  }, [adapter, anchorKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ESC로 메모 모드 종료
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExitMode?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onExitMode]);

  async function place(e: React.MouseEvent) {
    const x = (e.pageX / document.documentElement.scrollWidth) * 100;
    const y = e.pageY;
    const note = await adapter.create({
      anchorKey, x, y, content: "",
      authorName: user.name, authorEmail: user.email,
    });
    setNotes((n) => [...n, note]);
    setLastCreated(note.id);
    // 모드 유지 — 토글/ESC 전까지 계속 추가 가능
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {active && (
        <>
          <div
            onClick={place}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              cursor: "crosshair", background: "transparent",
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, zIndex: 10001,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              background: "#fef9c3", borderBottom: "1px solid #fde047",
              padding: "7px 16px", fontSize: 13, color: "#854d0e", fontWeight: 500,
              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a16207"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z" />
              <path d="M15 3v5a1 1 0 0 0 1 1h5" />
            </svg>
            <span>{bannerLabel}</span>
            <button
              onClick={onExitMode}
              style={{
                border: "1px solid #eab308", background: "#fff", color: "#854d0e",
                borderRadius: 6, padding: "2px 12px", fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {exitLabel} (ESC)
            </button>
          </div>
        </>
      )}
      {notes.map((n) => (
        <PostIt
          key={n.id}
          note={n}
          versionLabel={versionLabel}
          autoFocus={n.id === lastCreated}
          onChange={async (content) => {
            await adapter.update(n.id, { content });
            setNotes((all) => all.map((m) => (m.id === n.id ? { ...m, content } : m)));
          }}
          onMove={async (x, y) => {
            await adapter.update(n.id, { x, y });
            setNotes((all) => all.map((m) => (m.id === n.id ? { ...m, x, y } : m)));
          }}
          onDelete={async () => {
            await adapter.remove(n.id);
            setNotes((all) => all.filter((m) => m.id !== n.id));
          }}
        />
      ))}
    </>,
    document.body
  );
}
