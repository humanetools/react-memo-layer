import { useEffect, useRef, useState } from "react";
import type { MemoNote } from "./types";

const NOTE_STYLE: React.CSSProperties = {
  position: "absolute",
  width: "fit-content",
  background: "#fef9c3",
  border: "1px solid #fde047",
  borderRadius: 8,
  boxShadow: "0 6px 16px rgba(0,0,0,.18)",
  fontFamily: "inherit",
  fontSize: 13,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
};

export function PostIt({
  note,
  versionLabel,
  autoFocus,
  onChange,
  onMove,
  onDelete,
}: {
  note: MemoNote;
  versionLabel?: string;
  autoFocus?: boolean;
  onChange: (content: string) => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState(note.content);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setText(note.content), [note.content]);

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: note.x, origY: note.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const el = rootRef.current;
    if (!el) return;
    const docW = document.documentElement.scrollWidth;
    const nx = d.origX + ((e.clientX - d.startX) / docW) * 100;
    const ny = d.origY + (e.clientY - d.startY);
    el.style.left = `${nx}%`;
    el.style.top = `${ny}px`;
    el.dataset.nx = String(nx);
    el.dataset.ny = String(ny);
  }
  function onPointerUp() {
    const el = rootRef.current;
    if (dragRef.current && el?.dataset.nx) {
      onMove(Number(el.dataset.nx), Number(el.dataset.ny));
    }
    dragRef.current = null;
  }

  return (
    <div ref={rootRef} style={{ ...NOTE_STYLE, left: `${note.x}%`, top: note.y }}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 10px", cursor: "grab", borderBottom: "1px solid #fde047",
          touchAction: "none",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "#854d0e" }}>
          {note.authorName ?? "memo"}
          {versionLabel ? ` · ${versionLabel}` : ""}
        </span>
        <button
          onClick={onDelete}
          title="삭제"
          style={{
            border: "none", background: "transparent", cursor: "pointer",
            color: "#a16207", fontSize: 14, lineHeight: 1, padding: 2,
          }}
        >
          ×
        </button>
      </div>
      <textarea
        autoFocus={autoFocus}
        value={text}
        placeholder="메모 입력…"
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (text !== note.content) onChange(text);
        }}
        style={{
          border: "none", outline: "none", resize: "both",
          width: 220, minWidth: 170, minHeight: 84, maxWidth: 640,
          background: "transparent", padding: "8px 10px", fontSize: 13,
          fontFamily: "inherit", lineHeight: 1.5, color: "#422006",
          display: "block", boxSizing: "border-box",
        }}
      />
    </div>
  );
}
