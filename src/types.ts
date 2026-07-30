export interface MemoNote {
  id: string;
  anchorKey: string;
  /** 문서 가로폭 대비 % (0~100) */
  x: number;
  /** 문서 상단 기준 px */
  y: number;
  content: string;
  authorName?: string;
  authorEmail?: string;
  createdAt?: string;
}

export interface MemoUser {
  name: string;
  email?: string;
}

/** 저장소 어댑터 — 호스트 앱이 구현해서 주입 */
export interface MemoAdapter {
  list(anchorKey: string): Promise<{ versionLabel?: string; notes: MemoNote[] }>;
  create(note: Omit<MemoNote, "id">): Promise<MemoNote>;
  update(id: string, patch: Partial<Pick<MemoNote, "content" | "x" | "y">>): Promise<void>;
  remove(id: string): Promise<void>;
}
