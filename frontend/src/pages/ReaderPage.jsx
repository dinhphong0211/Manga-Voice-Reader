import React, { useEffect, useState } from "react";
import { ArrowLeft, Volume2, MessageSquare, Play, Square, Eye, EyeOff } from "lucide-react";

export default function ReaderPage({ chapterId, personalData, currentUser, onBack }) {
  const [chapterData, setChapterData] = useState(null);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  useEffect(() => {
    if (personalData) {
      setChapterData(personalData);
      return;
    }
    if (!chapterId) return;

    const headers = {};
    if (currentUser?.email) {
      headers["X-User-Email"] = currentUser.email;
    }

    fetch(`http://127.0.0.1:8000/api/chapters/${chapterId}/`, { headers })
      .then((res) => res.json())
      .then((data) => setChapterData(data))
      .catch((err) => console.error("Lỗi tải chương:", err));
  }, [chapterId, personalData, currentUser]);

  // Đọc thử giọng nói trực tiếp bằng trình duyệt khi bấm vào khung thoại
  const speakBubble = (bubble) => {
    setSelectedBubble(bubble);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(bubble.text);
      utterance.lang = "vi-VN";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tự động đọc lần lượt toàn bộ thoại trong chương
  const playAllBubbles = () => {
    if (!chapterData || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlayingAll(true);

    const allBubbles = chapterData.pages.flatMap((p) => p.bubbles);
    let idx = 0;

    const next = () => {
      if (idx >= allBubbles.length) {
        setIsPlayingAll(false);
        return;
      }
      const b = allBubbles[idx];
      setSelectedBubble(b);
      const u = new SpeechSynthesisUtterance(b.text);
      u.lang = "vi-VN";
      u.onend = () => {
        idx++;
        next();
      };
      window.speechSynthesis.speak(u);
    };

    next();
  };

  const stopReading = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAll(false);
  };

  if (!chapterData) {
    return <div className="text-center py-20 text-zinc-400">Đang tải dữ liệu chương truyện...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cột trái: Khung đọc truyện & Khung thoại tương tác */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161821] border border-zinc-800 p-4 rounded-xl">
          <button
            onClick={() => {
              stopReading();
              onBack();
            }}
            className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Danh sách
          </button>

          <h1 className="font-bold text-white text-sm sm:text-base">
            {chapterData.comic_title} — <span className="text-violet-400">Chương {chapterData.chapter_no}</span>
          </h1>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5 text-violet-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showBoxes ? "Đang hiện khung thoại" : "Đang ẩn khung"}</span>
          </button>
        </div>

        {/* Các trang ảnh truyện */}
        <div className="space-y-2 bg-black rounded-xl overflow-hidden border border-zinc-800">
          {chapterData.pages.map((page) => (
            <div key={page.id} className="relative">
              <img src={page.image_url} alt={`Trang ${page.page_no}`} className="w-full h-auto block" />

              {showBoxes &&
                page.bubbles.map((b) => {
                  const leftPct = (b.x / page.width) * 100;
                  const topPct = (b.y / page.height) * 100;
                  const widthPct = (b.w / page.width) * 100;
                  const heightPct = (b.h / page.height) * 100;

                  return (
                    <div
                      key={b.id}
                      onClick={() => speakBubble(b)}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      className={`absolute border-2 rounded-lg cursor-pointer transition flex items-start justify-start p-1 ${
                        selectedBubble?.id === b.id
                          ? "border-emerald-400 bg-emerald-400/25 shadow-lg shadow-emerald-500/30"
                          : "border-violet-500/80 bg-violet-500/15 hover:bg-violet-500/30"
                      }`}
                    >
                      <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        #{b.reading_order}
                      </span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải: Kịch bản thoại bóc tách từ ERD */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="sticky top-20 bg-[#161821] border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" /> Kịch Bản Voice AI
            </h2>
            <span className="text-[11px] text-zinc-400">Bấm vào thoại để nghe</span>
          </div>

          <div className="space-y-2.5 max-h-[68vh] overflow-y-auto pr-1">
            {chapterData.pages.flatMap((p) =>
              p.bubbles.map((b) => (
                <div
                  key={b.id}
                  onClick={() => speakBubble(b)}
                  className={`p-3 rounded-xl border text-sm cursor-pointer transition ${
                    selectedBubble?.id === b.id
                      ? "bg-violet-600/20 border-violet-500"
                      : "bg-[#0f1015] border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="font-bold text-violet-400 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" /> Thoại #{b.reading_order}
                    </span>
                    <span className="text-[11px] text-zinc-500">Trang {p.page_no}</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">{b.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Thanh Audio Player cố định dưới đáy màn hình */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#161821]/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {selectedBubble ? `Đang chọn: Thoại #${selectedBubble.reading_order}` : "Sẵn sàng phát giọng đọc AI"}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {selectedBubble ? selectedBubble.text : "Bấm Phát Tự Động hoặc chọn một khung thoại trên trang"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isPlayingAll ? (
              <button
                onClick={playAllBubbles}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer shadow-lg shadow-violet-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Phát Tự Động
              </button>
            ) : (
              <button
                onClick={stopReading}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" /> Dừng Đọc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}