"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type ColorType = "yellow" | "pink" | "green" | "blue";

interface Category {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: "all", name: "전체", icon: "🐸" },
  { id: "todo", name: "할일개굴", icon: "📝" },
  { id: "idea", name: "아이디어개굴", icon: "💡" },
  { id: "etc", name: "기타개굴", icon: "🍀" },
];

interface Note {
  id: string; // timestamp 값
  content: string;
  categoryId: string;
  color: ColorType;
  dateStr: string;
  timeStr: string;
  dayOfWeek: string;
  completed: boolean;
  order: number;
  rotation: number;
}

const COLOR_STYLES: Record<
  ColorType,
  {
    bg: string;
    darkBg: string;
    border: string;
    darkBorder: string;
    tape: string;
    categoryBg: string;
    darkCategoryBg: string;
    textColor: string;
    darkTextColor: string;
  }
> = {
  yellow: {
    bg: "bg-[#FFFDE7]",
    darkBg: "bg-[#292612]",
    border: "border-[#FFF59D]",
    darkBorder: "border-[#5c5421]",
    tape: "bg-[#FFF59D]/75",
    categoryBg: "bg-amber-100/90 text-amber-900",
    darkCategoryBg: "bg-amber-950/80 text-amber-200 border border-amber-800/60",
    textColor: "text-slate-800",
    darkTextColor: "text-amber-50",
  },
  pink: {
    bg: "bg-[#FDF2F4]",
    darkBg: "bg-[#2b171c]",
    border: "border-[#F8BBD0]",
    darkBorder: "border-[#602738]",
    tape: "bg-[#F8BBD0]/75",
    categoryBg: "bg-pink-100/90 text-rose-900",
    darkCategoryBg: "bg-pink-950/80 text-rose-200 border border-pink-800/60",
    textColor: "text-slate-800",
    darkTextColor: "text-pink-50",
  },
  green: {
    bg: "bg-[#F1F8E9]",
    darkBg: "bg-[#142618]",
    border: "border-[#C8E6C9]",
    darkBorder: "border-[#25522e]",
    tape: "bg-[#C8E6C9]/75",
    categoryBg: "bg-emerald-100/90 text-emerald-900",
    darkCategoryBg: "bg-emerald-950/80 text-emerald-200 border border-emerald-800/60",
    textColor: "text-slate-800",
    darkTextColor: "text-emerald-50",
  },
  blue: {
    bg: "bg-[#F0F9FF]",
    darkBg: "bg-[#132330]",
    border: "border-[#B3E5FC]",
    darkBorder: "border-[#1c4b69]",
    tape: "bg-[#B3E5FC]/75",
    categoryBg: "bg-sky-100/90 text-sky-900",
    darkCategoryBg: "bg-sky-950/80 text-sky-200 border border-sky-800/60",
    textColor: "text-slate-800",
    darkTextColor: "text-sky-50",
  },
};

const COLOR_KEYS: ColorType[] = ["yellow", "pink", "green", "blue"];

function formatCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = `${days[now.getDay()]}요일`;

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}`;

  return {
    dateStr: `${year}.${month}.${day}`,
    dayOfWeek,
    timeStr,
    fullDateTime: `${year}.${month}.${day} (${days[now.getDay()]}) ${hours}:${minutes}`,
  };
}

// 구글 시트 datetime 문자열 파싱 헬퍼
function parseDateTimeStr(str: string) {
  if (!str) return formatCurrentDateTime();
  // 정규식이나 분할 시도 (예: 2026.10.09 (금) 12:45 또는 2026.10.09 12:45)
  const parts = str.split(" ");
  if (parts.length >= 3) {
    return {
      dateStr: parts[0],
      dayOfWeek: parts[1].replace(/[()]/g, "") + (parts[1].includes("요일") ? "" : "요일"),
      timeStr: parts[2] || "00:00",
      fullDateTime: str,
    };
  } else if (parts.length === 2) {
    return {
      dateStr: parts[0],
      dayOfWeek: "오늘",
      timeStr: parts[1],
      fullDateTime: str,
    };
  }
  return {
    dateStr: str,
    dayOfWeek: "",
    timeStr: "",
    fullDateTime: str,
  };
}

export default function Home() {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

  // 다크 모드 상태
  const [darkMode, setDarkMode] = useState(false);

  // 로딩 상태 및 연동 알림
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  // 메모 상태
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedCreateCat, setSelectedCreateCat] = useState("todo");
  const [filterCat, setFilterCat] = useState("all");

  // 수정(편집) 모달 상태
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editCatId, setEditCatId] = useState("");

  // 다크모드 적용
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // 구글 시트 API 호출 헬퍼
  const callGAS = async (payload: Record<string, unknown>) => {
    if (!SCRIPT_URL) return null;
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Google Apps Script Web App의 CORS 리디렉션 처리
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      return response;
    } catch (err) {
      console.error("GAS 호출 오류:", err);
      return null;
    }
  };

  // 1. 초기 구글 시트 데이터 로드 (Read)
  const fetchNotes = async () => {
    if (!SCRIPT_URL) return;
    setLoading(true);
    setSyncStatus("구글 시트 동기화 중... 🐸");

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      const result = await res.json();

      if (result && result.success && Array.isArray(result.data)) {
        const loadedNotes: Note[] = result.data.map(
          (item: Record<string, unknown>, index: number) => {
            const parsed = parseDateTimeStr(String(item.datetime || ""));
            const rot = Number(((Math.random() - 0.5) * 3.4).toFixed(1));
            const validColor = COLOR_KEYS.includes(item.color as ColorType)
              ? (item.color as ColorType)
              : COLOR_KEYS[index % COLOR_KEYS.length];

            // 기존 study 또는 work 카테고리가 있다면 자연스럽게 todo로 매핑
            let rawCat = String(item.category || "todo");
            if (rawCat === "study" || rawCat === "work") {
              rawCat = "todo";
            }

            return {
              id: String(item.timestamp || Date.now() + index),
              content: String(item.content || ""),
              categoryId: rawCat,
              color: validColor,
              dateStr: parsed.dateStr,
              timeStr: parsed.timeStr,
              dayOfWeek: parsed.dayOfWeek,
              completed: String(item.state) === "true",
              order: Number(item.order || index),
              rotation: rot,
            };
          }
        );

        // order 기준 정렬
        loadedNotes.sort((a, b) => a.order - b.order);
        setNotes(loadedNotes);
        setSyncStatus("동기화 완료! ✨");
      }
    } catch (err) {
      console.warn("구글 시트 로드 중 안내 (CORS 또는 네트워크):", err);
      setSyncStatus("");
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(""), 2500);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [SCRIPT_URL]);

  // 2. 메모 추가 (Create) - [철컥! 붙이기] 버튼 클릭 시 호출
  const handleAddNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const timestamp = Date.now().toString();
    const randomColor =
      COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    const randomRot = Number(((Math.random() - 0.5) * 3.4).toFixed(1));
    const { dateStr, dayOfWeek, timeStr, fullDateTime } =
      formatCurrentDateTime();
    const newOrder = notes.length;

    const newNote: Note = {
      id: timestamp,
      content: inputText.trim(),
      categoryId: selectedCreateCat,
      color: randomColor,
      dateStr,
      timeStr,
      dayOfWeek,
      completed: false,
      order: newOrder,
      rotation: randomRot,
    };

    // UI 즉시 반영 (Optimistic UI)
    setNotes((prev) => [newNote, ...prev]);
    setInputText("");
    setSyncStatus("구글 시트에 저장 중... 📌");

    // 구글 시트에 Create 요청
    await callGAS({
      action: "create",
      timestamp,
      datetime: fullDateTime,
      category: selectedCreateCat,
      content: newNote.content,
      color: randomColor,
      state: "false",
      order: newOrder,
    });

    setSyncStatus("구글 시트 저장 완료! 🐸");
    setTimeout(() => setSyncStatus(""), 2000);
  };

  // 3. 완료 상태 토글 (Update state)
  const toggleComplete = async (id: string) => {
    const targetNote = notes.find((n) => n.id === id);
    if (!targetNote) return;

    const nextCompleted = !targetNote.completed;

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: nextCompleted } : n))
    );

    // 구글 시트 state 업데이트
    await callGAS({
      action: "update",
      timestamp: id,
      state: String(nextCompleted),
    });
  };

  // 4. 메모 삭제 (Delete)
  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSyncStatus("구글 시트에서 삭제 중... 🗑️");

    await callGAS({
      action: "delete",
      timestamp: id,
    });

    setSyncStatus("삭제 완료! 🐸");
    setTimeout(() => setSyncStatus(""), 2000);
  };

  // 5. 메모 편집 시작 & 저장 (Update content & category)
  const startEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
    setEditCatId(note.categoryId);
  };

  const saveEdit = async () => {
    if (!editingNote || !editContent.trim()) return;

    const { fullDateTime, dateStr, dayOfWeek, timeStr } =
      formatCurrentDateTime();

    // UI 즉시 반영
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              content: editContent.trim(),
              categoryId: editCatId,
              dateStr,
              dayOfWeek,
              timeStr,
            }
          : n
      )
    );

    const targetId = editingNote.id;
    setEditingNote(null);
    setSyncStatus("구글 시트에 수정 저장 중... ✏️");

    // 구글 시트 업데이트
    await callGAS({
      action: "update",
      timestamp: targetId,
      content: editContent.trim(),
      category: editCatId,
      datetime: fullDateTime,
    });

    setSyncStatus("수정 완료! 🐸");
    setTimeout(() => setSyncStatus(""), 2000);
  };

  // 6. 드래그 앤 드롭 정렬 (Reorder)
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const displayedNotes =
      filterCat === "all"
        ? notes
        : notes.filter((n) => n.categoryId === filterCat);

    const movedNote = displayedNotes[sourceIndex];
    if (!movedNote) return;

    const newNotes = Array.from(notes);
    const originalSourceIdx = newNotes.findIndex((n) => n.id === movedNote.id);
    newNotes.splice(originalSourceIdx, 1);

    const targetNote = displayedNotes[destIndex];
    if (targetNote) {
      const originalDestIdx = newNotes.findIndex((n) => n.id === targetNote.id);
      newNotes.splice(originalDestIdx, 0, movedNote);
    } else {
      newNotes.push(movedNote);
    }

    const reordered = newNotes.map((note, idx) => ({
      ...note,
      order: idx,
    }));

    setNotes(reordered);

    // 구글 시트 순서 반영
    await callGAS({
      action: "reorder",
      items: reordered.map((n) => ({ timestamp: n.id, order: n.order })),
    });
  };

  // 필터링된 노트 목록
  const filteredNotes =
    filterCat === "all"
      ? notes
      : notes.filter((n) => n.categoryId === filterCat);

  const creationCategories = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <main className="min-h-screen pb-24 pt-8 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center select-none">
      {/* 상단 다크모드 및 구글 시트 동기화 상태 바 */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {syncStatus && (
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 animate-pulse flex items-center gap-1">
              <span>🔄</span> {syncStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 다크모드 토글 */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              darkMode
                ? "bg-[#1b3420] text-emerald-300 border-emerald-700/60 hover:bg-[#23442a]"
                : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            <span>{darkMode ? "🌙 다크 모드" : "☀️ 라이트 모드"}</span>
          </button>
        </div>
      </div>

      {/* 상단 헤더 & 개구리 로고 */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center w-full px-2">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm border flex flex-col items-center justify-center p-1 relative transition-colors shrink-0 ${
              darkMode
                ? "bg-[#182d1c] border-emerald-800"
                : "bg-white border-emerald-100"
            }`}
          >
            <span className="text-xl sm:text-2xl leading-none">🐸</span>
            <span
              className={`text-[8px] sm:text-[9px] font-bold tracking-tighter mt-0.5 whitespace-nowrap ${
                darkMode ? "text-emerald-400" : "text-emerald-800"
              }`}
            >
              FROG NOTES
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 transition-colors break-keep text-center ${
              darkMode ? "text-emerald-400" : "text-[#0d631b]"
            }`}
          >
            <span className="whitespace-nowrap">개굴개굴</span>
            <span className="whitespace-nowrap">Post-it Todo List</span>
          </h1>
        </div>

        {/* 까먹으면 개구리밥 태그 */}
        <div
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold shadow-xs border mt-1 whitespace-nowrap ${
            darkMode
              ? "bg-rose-950/80 text-rose-300 border-rose-800/60"
              : "bg-[#fde8e8] text-[#e02424] border-rose-200"
          }`}
        >
          <span>⚠️</span>
          <span>까먹으면 개구리밥! 🐸</span>
        </div>
      </div>

      {/* 중앙 메모 작성 폼 (포스트잇 스타일 입력창) */}
      <section className="w-full max-w-3xl relative mb-12">
        <div
          className={`absolute -top-3 left-4 sm:left-6 right-4 sm:right-6 h-full rounded-3xl transform -rotate-1 opacity-70 pointer-events-none ${
            darkMode ? "bg-emerald-950/50" : "bg-[#d7f5dd]"
          }`}
        />
        <div
          className={`absolute -top-1.5 left-2 sm:left-3 right-2 sm:right-3 h-full rounded-3xl transform rotate-1 opacity-80 pointer-events-none ${
            darkMode ? "bg-amber-950/50" : "bg-[#fff4be]"
          }`}
        />

        <div
          className={`relative rounded-3xl p-5 sm:p-8 shadow-lg border transition-colors ${
            darkMode
              ? "bg-[#272a15] border-[#4a4f27]"
              : "bg-[#FFF59D] border-[#f6ea79]"
          }`}
        >
          {/* 상단 반투명 마스킹 테이프 장식 */}
          <div
            className={`absolute -top-3.5 left-1/2 transform -translate-x-1/2 w-28 h-7 rounded-sm shadow-xs border pointer-events-none backdrop-blur-xs ${
              darkMode
                ? "bg-white/20 border-white/25"
                : "bg-white/70 border-white/80"
            }`}
          />

          <form onSubmit={handleAddNote} className="flex flex-col gap-4">
            {/* 범주(카테고리) 선택 영역: 깔끔한 드롭다운 메뉴로 통합 */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-bold flex items-center gap-1 whitespace-nowrap ${
                  darkMode ? "text-emerald-200" : "text-emerald-950"
                }`}
              >
                <span>🏷️</span> 범주 (카테고리 선택):
              </span>

              {/* 카테고리 드롭다운 선택 메뉴 */}
              <select
                value={selectedCreateCat}
                onChange={(e) => setSelectedCreateCat(e.target.value)}
                className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  darkMode
                    ? "bg-[#182319] text-emerald-200 border-emerald-800"
                    : "bg-white text-emerald-950 border-amber-300"
                }`}
              >
                {creationCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 메모 내용 입력 텍스트영역 */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleAddNote();
                  }
                }}
                rows={3}
                placeholder="여기에 메모하라개굴~ (예: 오후 3시까지 파리 세 마리 잡고 연못 청소하기!)"
                className={`w-full rounded-2xl p-4 text-sm md:text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d631b] border resize-none transition-all break-keep ${
                  darkMode
                    ? "bg-[#161c16] text-emerald-100 placeholder:text-emerald-600/70 border-emerald-900/80"
                    : "bg-white text-slate-800 placeholder:text-emerald-800/50 border-amber-200"
                }`}
              />
            </div>

            {/* 철컥! 붙이기 버튼 */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0d631b] hover:bg-[#094c14] active:scale-95 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm md:text-base cursor-pointer whitespace-nowrap"
              >
                <span>📌</span>
                <span>철컥! 붙이기</span>
                <span>🐸</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 포스트잇 게시판 섹션 헤더 & 카테고리 필터링 드롭다운 */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-200/50 pb-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xl">📌</span>
          <h2
            className={`text-xl md:text-2xl font-extrabold whitespace-nowrap ${
              darkMode ? "text-emerald-300" : "text-[#0d631b]"
            }`}
          >
            초록 게시판
          </h2>
        </div>

        {/* 카테고리별 필터 드롭다운 & 총 쪽지 카운터 */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                darkMode ? "text-emerald-300" : "text-emerald-900"
              }`}
            >
              🔍 카테고리 필터:
            </span>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className={`text-xs md:text-sm font-bold px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                darkMode
                  ? "bg-[#182d1c] text-emerald-200 border-emerald-700"
                  : "bg-white text-emerald-950 border-emerald-300"
              }`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`px-3 py-1 text-xs font-bold rounded-full border shadow-xs whitespace-nowrap ${
              darkMode
                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                : "bg-emerald-100/90 text-emerald-800 border-emerald-300/80"
            }`}
          >
            총 {filteredNotes.length}장 📌
          </div>
        </div>
      </div>

      {/* 포스트잇 리스트 - 반응형 모바일 & 웹 드래그 앤 드롭 */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 opacity-70">
          <span className="text-5xl">🐸</span>
          <p className="text-base font-semibold">
            {filterCat === "all"
              ? "아직 붙여진 메모가 없다개굴! 위에서 새 메모를 작성해 보라개굴~"
              : "해당 카테고리에 붙여진 메모가 없다개굴!"}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="notes-board" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start"
              >
                {filteredNotes.map((note, index) => {
                  const style = COLOR_STYLES[note.color];
                  const currentCategory =
                    CATEGORIES.find((c) => c.id === note.categoryId) ||
                    CATEGORIES[1];

                  return (
                    <Draggable
                      key={note.id}
                      draggableId={note.id}
                      index={index}
                    >
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={
                            {
                              ...dragProvided.draggableProps.style,
                              "--rot": `${note.rotation}deg`,
                            } as unknown as React.CSSProperties
                          }
                          className={`animate-slap relative rounded-2xl p-4 sm:p-5 border shadow-md transition-shadow flex flex-col justify-between min-h-[220px] w-full box-border group select-none touch-manipulation cursor-grab active:cursor-grabbing overflow-visible ${
                            darkMode
                              ? `${style.darkBg} ${style.darkBorder}`
                              : `${style.bg} ${style.border}`
                          } ${
                            snapshot.isDragging
                              ? "scale-105 shadow-2xl z-50 ring-2 ring-emerald-500 opacity-95"
                              : "hover:shadow-xl"
                          }`}
                        >
                          {/* 상단 반투명 마스킹 테이프 장식 */}
                          <div
                            className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 ${
                              style.tape
                            } backdrop-blur-xs rounded-xs shadow-xs border pointer-events-none ${
                              darkMode ? "border-white/20" : "border-white/60"
                            }`}
                          />

                          {/* 헤더: 카테고리 칩 및 작성일시 */}
                          <div className="flex items-start justify-between gap-2 mb-2 w-full pt-1">
                            <span
                              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs whitespace-nowrap ${
                                darkMode
                                  ? style.darkCategoryBg
                                  : style.categoryBg
                              }`}
                            >
                              <span>{currentCategory.icon}</span>
                              <span>{currentCategory.name}</span>
                            </span>

                            {/* 우측 상단 흐릿하고 작은 작성일시 (연월일 + 시간 + 요일) */}
                            <div className="text-right pointer-events-none select-none shrink-0 leading-tight">
                              <span
                                className={`text-[10px] font-medium tracking-tight block whitespace-nowrap ${
                                  darkMode ? "text-slate-400/80" : "text-slate-500/70"
                                }`}
                              >
                                {note.dateStr} ({note.dayOfWeek.slice(0, 1)})
                              </span>
                              <span
                                className={`text-[10px] font-medium block whitespace-nowrap ${
                                  darkMode ? "text-slate-400/80" : "text-slate-500/70"
                                }`}
                              >
                                {note.timeStr}
                              </span>
                            </div>
                          </div>

                          {/* 메모 본문 내용 */}
                          <div className="flex-1 my-2.5 w-full">
                            <p
                              className={`text-sm md:text-base leading-relaxed break-keep break-words font-medium whitespace-pre-wrap transition-all ${
                                darkMode ? style.darkTextColor : style.textColor
                              } ${
                                note.completed
                                  ? "line-through opacity-45 decoration-rose-500 decoration-2"
                                  : ""
                              }`}
                            >
                              {note.content}
                            </p>
                          </div>

                          {/* 하단 완료 체크 및 편집 / 삭제 버튼 바 */}
                          <div
                            className={`pt-3 mt-2 border-t flex items-center justify-between gap-1 w-full ${
                              darkMode ? "border-white/10" : "border-black/5"
                            }`}
                          >
                            <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                              <input
                                type="checkbox"
                                checked={note.completed}
                                onChange={() => toggleComplete(note.id)}
                                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                              />
                              <span
                                className={`text-xs font-bold transition-colors whitespace-nowrap ${
                                  note.completed
                                    ? "text-emerald-500"
                                    : darkMode
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                }`}
                              >
                                {note.completed ? "완료됨! 🐸" : "완료하기"}
                              </span>
                            </label>

                            {/* 편집 & 삭제 버튼 영역 */}
                            <div className="flex items-center gap-1 shrink-0">
                              {/* 편집 버튼 */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(note);
                                }}
                                title="메모 수정"
                                className={`text-xs px-2 py-1 rounded transition-all cursor-pointer whitespace-nowrap flex items-center gap-0.5 ${
                                  darkMode
                                    ? "text-emerald-300 hover:bg-emerald-950/70"
                                    : "text-emerald-800 hover:bg-emerald-100/70"
                                }`}
                              >
                                <span>✏️</span>
                                <span>편집</span>
                              </button>

                              {/* 삭제 버튼 */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                                title="메모 떼어내기 (삭제)"
                                className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50/70 dark:hover:bg-red-950/40 transition-all cursor-pointer font-bold whitespace-nowrap flex items-center gap-0.5"
                              >
                                <span>🗑️</span>
                                <span>삭제</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* 메모 편집 모달 팝업 */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-colors ${
              darkMode
                ? "bg-[#18261b] border-emerald-700 text-emerald-100"
                : "bg-white border-amber-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <span>✏️</span> 메모 편집하기
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 카테고리 변경 */}
            <div className="mb-4">
              <label className="text-xs font-bold block mb-1.5">
                🏷️ 카테고리 선택
              </label>
              <div className="flex flex-wrap gap-1.5">
                {creationCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setEditCatId(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                      editCatId === cat.id
                        ? "bg-[#0d631b] text-white shadow-xs"
                        : darkMode
                        ? "bg-[#111e14] text-slate-300 border border-emerald-900"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 내용 수정 */}
            <div className="mb-5">
              <label className="text-xs font-bold block mb-1.5">
                📝 메모 내용
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                  darkMode
                    ? "bg-[#101811] text-emerald-100 border-emerald-800"
                    : "bg-slate-50 text-slate-900 border-slate-200"
                }`}
              />
            </div>

            {/* 버튼들 */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2 bg-[#0d631b] hover:bg-[#094c14] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                저장 완료 🐸
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 푸터 영역 (세련된 개구리 테마 디자인) */}
      <footer className="w-full max-w-7xl mt-20 pt-8 border-t border-emerald-200/50 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">🐸</span>
          <span className={`font-semibold tracking-wide ${darkMode ? "text-emerald-300" : "text-emerald-950"}`}>
            Copyright INU Post-it todo list by Noh Seoyeon
          </span>
        </div>

        <div className={`flex items-center gap-4 text-[11px] font-medium ${darkMode ? "text-emerald-400/70" : "text-emerald-800/70"}`}>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Cloud Sync Active
          </span>
          <span>•</span>
          <span>Designed with Material 3 & Froggy Whimsy</span>
        </div>
      </footer>
    </main>
  );
}
