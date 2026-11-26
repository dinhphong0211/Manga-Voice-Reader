import React, { useState } from "react";
import { Search, Upload, Shuffle, History, LogOut, BookOpen } from "lucide-react";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import ReaderPage from "./pages/ReaderPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [audioDescOnly, setAudioDescOnly] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [personalComicData, setPersonalComicData] = useState(null);
  const [randomTrigger, setRandomTrigger] = useState(0);

  // Quản lý tài khoản đăng nhập / đăng ký
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("livecomic_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // 'login' hoặc 'register'
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const url =
      authMode === "register"
        ? "http://127.0.0.1:8000/api/register/"
        : "http://127.0.0.1:8000/api/login/";

    const payload =
      authMode === "register"
        ? { display_name: displayName, email: loginEmail, password: loginPassword }
        : { email: loginEmail, password: loginPassword };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setAuthError(data.error || "Thao tác thất bại.");
      return;
    }

    setCurrentUser(data);
    localStorage.setItem("livecomic_user", JSON.stringify(data));
    setShowLoginModal(false);
    setDisplayName("");
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("livecomic_user");
    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-[#11111b] text-zinc-100 font-sans selection:bg-amber-400 selection:text-black">
      {/* Header chuẩn LIVECOMICS */}
      <header className="sticky top-0 z-50 bg-[#181824] border-b border-zinc-800/90 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Trái: Logo + Nút chức năng theo vai trò */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentPage("home")}
              className="text-xl sm:text-2xl font-black italic tracking-tighter text-amber-400 hover:text-amber-300 transition cursor-pointer"
            >
              LIVECOMICS<span className="text-white">.AI</span>
            </button>

            <button
              onClick={() => setCurrentPage("home")}
              className={`hidden md:inline-block text-xs font-semibold px-2.5 py-1.5 rounded transition cursor-pointer ${
                currentPage === "home" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Thư viện
            </button>

            {/* Phân quyền rõ ràng giữa Admin và User */}
            {currentUser?.role === "admin" ? (
              <button
                onClick={() => setCurrentPage("admin-upload")}
                className="flex items-center gap-1.5 bg-[#e11d48] hover:bg-[#f43f5e] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Đăng Truyện Lên Web (Admin)</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage("personal-read")}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Quăng Truyện Vào Đọc</span>
              </button>
            )}

            <button
              onClick={() => setCurrentPage("history")}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition cursor-pointer ${
                currentPage === "history"
                  ? "bg-amber-400 text-black"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử đọc</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage("home");
                setRandomTrigger((prev) => prev + 1);
              }}
              className="hidden lg:flex items-center gap-1.5 bg-[#be123c] hover:bg-[#e11d48] text-white text-xs font-extrabold uppercase px-3 py-1.5 rounded-md shadow transition cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>NGẪU NHIÊN</span>
            </button>
          </div>

          {/* Giữa: Tìm kiếm */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentPage !== "home") setCurrentPage("home");
              }}
              placeholder="Tìm tất cả..."
              className="w-full bg-[#11111b] border border-zinc-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Phải: Nút Đăng nhập & Tạo tài khoản */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">
                  {currentUser.role === "admin" ? "ADMIN" : currentUser.display_name}
                </span>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="text-zinc-400 hover:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setShowLoginModal(true);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-3 py-1.5 rounded-md cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setShowLoginModal(true);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-3 py-1.5 rounded-md cursor-pointer"
                >
                  Tạo tài khoản
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal Đăng nhập & Tạo tài khoản */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex border-b border-zinc-800 pb-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`text-sm font-bold pb-1 cursor-pointer ${
                  authMode === "login"
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-zinc-400"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`text-sm font-bold pb-1 cursor-pointer ${
                  authMode === "register"
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-zinc-400"
                }`}
              >
                Tạo tài khoản mới
              </button>
            </div>

            {authMode === "login" && (
              <p className="text-[11px] text-zinc-400">
                • Quyền Admin: <span className="text-amber-400">admin@livecomic.ai</span> /{" "}
                <span className="text-amber-400">admin123</span>
              </p>
            )}

            {authError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
                {authError}
              </p>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === "register" && (
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tên hiển thị của bạn..."
                  className="w-full bg-[#11111b] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              )}
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email..."
                className="w-full bg-[#11111b] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Mật khẩu..."
                className="w-full bg-[#11111b] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  {authMode === "register" ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nội dung các trang */}
      <main>
        {currentPage === "home" && (
          <HomePage
            searchQuery={searchQuery}
            audioDescOnly={audioDescOnly}
            randomTrigger={randomTrigger}
            onNavigateUpload={() =>
              setCurrentPage(currentUser?.role === "admin" ? "admin-upload" : "personal-read")
            }
            onSelectComic={(chapterId) => {
              setPersonalComicData(null);
              setActiveChapterId(chapterId);
              setCurrentPage("reader");
            }}
          />
        )}

        {currentPage === "admin-upload" && (
          <UploadPage
            mode="admin"
            currentUser={currentUser}
            onUploadSuccess={(newChapterId) => {
              setPersonalComicData(null);
              setActiveChapterId(newChapterId);
              setCurrentPage("reader");
            }}
          />
        )}

        {currentPage === "personal-read" && (
          <UploadPage
            mode="personal"
            currentUser={currentUser}
            onPersonalReadReady={(tempComicObj) => {
              setPersonalComicData(tempComicObj);
              setActiveChapterId(null);
              setCurrentPage("reader");
            }}
          />
        )}

        {currentPage === "reader" && (
          <ReaderPage
            chapterId={activeChapterId}
            personalData={personalComicData}
            currentUser={currentUser}
            onBack={() => setCurrentPage("home")}
          />
        )}

        {currentPage === "history" && (
          <HistoryPage
            currentUser={currentUser}
            onSelectChapter={(chapterId) => {
              setPersonalComicData(null);
              setActiveChapterId(chapterId);
              setCurrentPage("reader");
            }}
          />
        )}
      </main>
    </div>
  );
}