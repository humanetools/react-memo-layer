import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PostIt } from "./PostIt";
import type { MemoAdapter, MemoNote, MemoUser } from "./types";

/**
 * 메모 오버레이. active=true면 화면 클릭으로 포스트잇 생성.
 * 노트 좌표: x = 문서 가로폭 %, y = 문서 상단 px.
 */
export function MemoLayer({
  anchorKey,
  adapter,
  user,
  active,
  onExitMode,
}: {
  anchorKey: string;
  adapter: MemoAdapter;
  user: MemoUser;
  active: boolean;
  onExitMode?: () => void;
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

  async function place(e: React.MouseEvent) {
    const x = (e.pageX / document.documentElement.scrollWidth) * 100;
    const y = e.pageY;
    onExitMode?.();
    const note = await adapter.create({
      anchorKey, x, y, content: "",
      authorName: user.name, authorEmail: user.email,
    });
    setNotes((n) => [...n, note]);
    setLastCreated(note.id);
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {active && (
        <div
          onClick={place}
          title="클릭한 위치에 메모가 생성됩니다 (ESC 취소)"
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            cursor: "crosshair", background: "rgba(253,224,71,.08)",
          }}
          onKeyDown={(e) => e.key === "Escape" && onExitMode?.()}
        />
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
