"use client";

import { ChangeEvent, DragEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { readFavorites, writeFavorites } from "../apis/local-store";
import { ApiError, errorMessage, getMe, searchImage, signOut } from "../apis/backend";
import AuthForm from "./auth-form";
import LoginCurtain from "./login-curtain";
import MemberGate from "./member-gate";
import HistoryView from "./history-view";
import MyPage from "./my-page";
import SearchResults from "./search-results";
import type { User, SearchResponse } from "../types/api";
import { products } from "../constants/look-find";
import type { Product } from "../types/look-find";

type Page = "mypage" | "home" | "history" | "favorites" | "test" | "results";

const won = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;
const sourceLabels: Record<string, string> = { "무신사": "MUSINSA", "지그재그": "ZIGZAG", "에이블리": "ABLY" };
const sampleFavoriteIds = ["m1", "a1", "m2", "a2", "m3", "m4", "a4", "z1", "m5", "a5", "z2"];
const demoMatches = [
  { id: "match-1", name: "오버핏 울 블레이저", brand: "MUSINSA STANDARD", price: "89,900원", source: "무신사", tone: "match-one" },
  { id: "match-2", name: "빈티지 체크 자켓", brand: "시티브리즈", price: "78,000원", source: "지그재그", tone: "match-two" },
  { id: "match-3", name: "루즈핏 테일러드 재킷", brand: "에이치", price: "62,500원", source: "에이블리", tone: "match-three" },
  { id: "match-4", name: "오버사이즈 싱글 자켓", brand: "COVERNAT", price: "109,000원", source: "무신사", tone: "match-four" },
  { id: "match-5", name: "체크 하프 재킷", brand: "오브제", price: "54,000원", source: "지그재그", tone: "match-five" },
  { id: "match-6", name: "클래식 울 재킷", brand: "루즈핏", price: "72,900원", source: "에이블리", tone: "match-six" },
  { id: "match-7", name: "리넨 더블 블레이저", brand: "LAFUDGE STORE", price: "96,000원", source: "무신사", tone: "match-two" },
  { id: "match-8", name: "크롭 트위드 자켓", brand: "MORU", price: "69,000원", source: "지그재그", tone: "match-three" },
  { id: "match-9", name: "소프트 테일러드 재킷", brand: "베니토", price: "88,500원", source: "에이블리", tone: "match-four" },
  { id: "match-10", name: "투 버튼 코튼 자켓", brand: "THISISNEVERTHAT", price: "118,000원", source: "무신사", tone: "match-five" },
  { id: "match-11", name: "스트랩 포인트 블레이저", brand: "오브이", price: "83,000원", source: "지그재그", tone: "match-six" },
  { id: "match-12", name: "세미 오버 울 자켓", brand: "프롬비기닝", price: "91,000원", source: "에이블리", tone: "match-one" },
  { id: "match-13", name: "워크웨어 체크 셔츠", brand: "MUSINSA STANDARD", price: "49,900원", source: "무신사", tone: "match-three" },
  { id: "match-14", name: "데님 믹스 자켓", brand: "페일제이", price: "64,000원", source: "지그재그", tone: "match-four" },
  { id: "match-15", name: "모던 싱글 재킷", brand: "아뜨랑스", price: "76,000원", source: "에이블리", tone: "match-five" },
  { id: "match-16", name: "릴렉스 핏 블레이저", brand: "YALE", price: "99,000원", source: "무신사", tone: "match-six" },
  { id: "match-17", name: "빈티지 버튼 자켓", brand: "메이비베이비", price: "57,000원", source: "지그재그", tone: "match-one" },
  { id: "match-18", name: "오버핏 하프 코트", brand: "리린", price: "105,000원", source: "에이블리", tone: "match-two" },
  { id: "match-19", name: "텍스처 울 셋업 자켓", brand: "SPAO", price: "79,900원", source: "무신사", tone: "match-four" },
  { id: "match-20", name: "클래식 라인 재킷", brand: "에프앤디", price: "71,000원", source: "지그재그", tone: "match-five" },
  { id: "match-21", name: "소프트 라인 블레이저", brand: "원로그", price: "84,000원", source: "에이블리", tone: "match-six" },
  { id: "match-22", name: "스트레이트 울 블레이저", brand: "난닝구", price: "68,000원", source: "에이블리", tone: "match-one" },
  { id: "match-23", name: "워시드 코튼 재킷", brand: "블랙업", price: "73,500원", source: "에이블리", tone: "match-three" },
  { id: "match-24", name: "미니멀 싱글 자켓", brand: "데일리쥬", price: "79,000원", source: "에이블리", tone: "match-four" },
];

export default function LookFindApp() {
  const [page, setPage] = useState<Page>("home");
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const searchController = useRef<AbortController | null>(null);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const loggedIn = Boolean(user);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login_error") === "kakao") {
      setNotice("카카오 로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getMe(controller.signal).then(setUser).catch(error => {
      if (!controller.signal.aborted && !(error instanceof ApiError && error.status === 401)) setNotice(errorMessage(error));
    }).finally(() => { if (!controller.signal.aborted) setAuthLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => () => searchController.current?.abort(), []);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const storedFavorites = readFavorites();
    return Array.from(new Set([...sampleFavoriteIds, ...storedFavorites]));
  });
  const [uploadMode, setUploadMode] = useState(false);
  const [isClosingUpload, setIsClosingUpload] = useState(false);
  const uploadCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (uploadCloseTimer.current) clearTimeout(uploadCloseTimer.current); }, []);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [analysisStage, setAnalysisStage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const stageLock = useRef(false);
  const touchStart = useRef(0);

  useEffect(() => {
    if (page !== "home" || uploadMode || loginOpen) return;

    const changeStage = (direction: number) => {
      if (stageLock.current) return;
      setAnalysisStage((current) => {
        const next = Math.max(0, Math.min(2, current + direction));
        if (next === current) return current;
        stageLock.current = true;
        window.setTimeout(() => { stageLock.current = false; }, 750);
        return next;
      });
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      changeStage(event.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (event: TouchEvent) => { touchStart.current = event.touches[0]?.clientY ?? 0; };
    const onTouchEnd = (event: TouchEvent) => {
      const distance = touchStart.current - (event.changedTouches[0]?.clientY ?? 0);
      if (Math.abs(distance) > 35) changeStage(distance > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { window.removeEventListener("wheel", onWheel); window.removeEventListener("touchstart", onTouchStart); window.removeEventListener("touchend", onTouchEnd); };
  }, [page, uploadMode, loginOpen]);

  function openLogin() {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (uploadCloseTimer.current) clearTimeout(uploadCloseTimer.current);
    setIsClosingUpload(false);
    setLoginOpen(true);
  }

  function navigate(next: Page) {
    if (uploadCloseTimer.current) clearTimeout(uploadCloseTimer.current);
    setUploadMode(false);
    setIsClosingUpload(false);
    setLoginOpen(false);
    setPage(next);
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    loadImage(event.target.files?.[0]);
  }

  useEffect(() => () => {
    if (uploadedImage?.startsWith("blob:")) URL.revokeObjectURL(uploadedImage);
  }, [uploadedImage]);

  async function runSearch(file: File) {
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearchBusy(true); setSearchError(""); setSearchResult(null);
    try {
      const result = await searchImage(file, controller.signal);
      if (!controller.signal.aborted) setSearchResult(result);
    } catch (error) {
      if (!controller.signal.aborted) setSearchError(errorMessage(error));
    } finally { if (!controller.signal.aborted) setSearchBusy(false); }
  }

  function loadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setNotice("10MB 이하의 이미지 파일을 선택해 주세요."); return;
    }
    if (authLoading) { setNotice("로그인 상태를 확인 중입니다. 잠시 후 다시 시도해 주세요."); return; }
    setNotice(""); setSearchFile(file);
    setUploadedImage(URL.createObjectURL(file));
    setUploadMode(false); setIsDragging(false); setPage("results");
    void runSearch(file);
  }

  async function logout() {
    setAuthLoading(true);
    try {
      await signOut(); searchController.current?.abort();
      setUser(null); setSearchResult(null); setUploadedImage(null); setSearchBusy(false);
      setSearchFile(null); setPage("home"); setNotice("");
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setAuthLoading(false); }
  }

  function dropImage(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    loadImage(event.dataTransfer.files?.[0]);
  }

  function toggleFavorite(id: string) {
    if (!loggedIn) return window.alert("찜 기능은 로그인 후 이용할 수 있어요.");
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      writeFavorites(next);
      return next;
    });
  }

  function openUploadMode() {
    setIsClosingUpload(false);
    setUploadMode(true);
  }

  function closeUploadMode() {
    if (isClosingUpload) return;
    setIsClosingUpload(true);
    uploadCloseTimer.current = setTimeout(() => {
      setUploadMode(false);
      setIsClosingUpload(false);
    }, 650);
  }

  return <main className="lookfind">
    <header className={loginOpen ? "site-header login-active" : uploadMode ? "site-header upload-active" : "site-header"}>
      <button className="wordmark" onClick={() => navigate("home")}>LOOK<span>•</span>FIND</button>
      <nav aria-label="주 메뉴">
        {([ ["home", "SEARCH"], ["history", "ARCHIVE"], ["favorites", "SAVED"], ["test", "TEST"] ] as const).map(([id, label]) =>
          <button className={!loginOpen && page === id ? "active" : ""} key={id} onClick={() => navigate(id)}>{label}</button>)}
        {user && <button className={!loginOpen && page === "mypage" ? "active" : ""} aria-current={!loginOpen && page === "mypage" ? "page" : undefined} onClick={() => navigate("mypage")}>MY PAGE</button>}
      </nav>
      {loggedIn && user ? <div className="account-menu">
        <button className="account account-profile" title={user.email} aria-haspopup="menu">
          {user.avatar_url ? <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" /> : <span className="account-avatar-fallback">{(user.display_name ?? user.email).slice(0, 1).toUpperCase()}</span>}
          <span>{user.display_name || user.email.split("@")[0]}</span><i>⌄</i>
        </button>
        <div className="account-popover" role="menu">
          <span>{user.email}</span>
          <button role="menuitem" onClick={() => void logout()}>LOGOUT</button>
        </div>
      </div> : <button className="account" disabled={authLoading} onClick={openLogin}>{authLoading ? "LOADING…" : "LOGIN"}</button>}
    </header>

    <div inert={loginOpen}>
    {notice && <div className="connection-notice" role="alert">{notice}<button onClick={() => setNotice("")} aria-label="알림 닫기">×</button></div>}
    {page === "home" ? <section className="home">
      <section className="hero">
        <input ref={fileInput} className="file-input" type="file" accept="image/*" onChange={chooseImage} />
        <div className="hero-copy">
          <h1>LOOKFIND</h1>
          <p>사진 한 장으로 원하는 스타일을 찾아보세요.<br />사진 속 옷을 AI가 하나씩 분석하고,<br />비슷한 디자인의 상품을 찾아드립니다.<br />무신사, 지그재그, 에이블리의 상품을 한눈에 비교하고<br />당신이 찾던 옷을 가장 쉽게 발견해보세요.</p>
          <button className="photo-action" onClick={openUploadMode}>PHOTO UPLOAD <span>↗</span></button>
        </div>
        <div className="hero-image"><Image src="/lookfind-hero.png" alt="LookFind 스타일 이미지" fill priority sizes="(max-width: 700px) 100vw, 50vw" /><div className={`analysis-layer stage-${analysisStage}`} aria-label="AI 의류 분석 표시"><div className="analysis-box shirt"><span>TOP</span><div className="analysis-crop crop-shirt"><small>TOP</small></div></div><div className="analysis-box pants"><span>PANTS</span><div className="analysis-crop crop-pants"><small>PANTS</small></div></div><div className="analysis-box boots"><span>BOOTS</span><div className="analysis-crop crop-boots"><small>BOOTS</small></div></div></div></div>
      </section>
    </section> : page === "mypage" ? (user ? <MyPage user={user} busy={authLoading} onHistory={() => navigate("history")} onSaved={() => navigate("favorites")} onLogout={() => void logout()} /> : <MemberGate title="로그인이 필요해요." text="로그인 후 내 계정을 확인할 수 있어요." onLogin={openLogin} />) : page === "history" ? (authLoading ? <p className="api-status">로그인 상태를 확인하고 있습니다…</p> : user ? <HistoryView key={user.id} onLogin={() => openLogin()} onOpen={(result) => { setSearchResult(result); setUploadedImage(result.image_url ?? null); setSearchError(""); setSearchBusy(false); setSearchFile(null); searchController.current?.abort(); setPage("results"); }} /> : <MemberGate title="검색 기록은 로그인 후 저장돼요." text="이전에 검색한 사진과 결과를 다시 확인할 수 있어요." onLogin={() => openLogin()} />) : page === "favorites" ? <Favorites onLogin={() => openLogin()} loggedIn={loggedIn} items={products.filter((item) => favorites.includes(item.id))} favorites={favorites} onFavorite={toggleFavorite} /> : page === "results" ? <SearchResults image={uploadedImage} result={searchResult} busy={searchBusy} error={searchError} loggedIn={loggedIn} onLogin={() => openLogin()} retry={searchFile ? () => void runSearch(searchFile) : undefined} /> : <SearchTestPage image={null} filter={sourceFilter} setFilter={setSourceFilter} />}

    </div>
    {loginOpen && <LoginCurtain onClose={() => setLoginOpen(false)}><AuthForm onLogin={(nextUser) => { searchController.current?.abort(); setSearchBusy(false); setSearchResult(null); setUploadedImage(null); setSearchFile(null); setUser(nextUser); setNotice(""); setLoginOpen(false); setPage("home"); }} /></LoginCurtain>}

    {uploadMode && <section className={isClosingUpload ? "upload-mode closing" : "upload-mode"} inert={loginOpen} aria-hidden={loginOpen || undefined} aria-modal={!loginOpen} role="dialog"><button className="close-upload" onClick={closeUploadMode} aria-label="업로드 화면 닫기">×</button><div className="upload-content"><h2>UPLOAD PHOTO</h2><div className={isDragging ? "upload-finder dragging" : "upload-finder"} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={dropImage}><span className="finder-corner top-left" /><span className="finder-corner top-right" /><span className="finder-corner bottom-left" /><span className="finder-corner bottom-right" /><span className="recording">● REC</span><p>사진을 이곳에 끌어다 놓거나 파일을 업로드 해주세요.</p><button className="upload-mode-button" onClick={() => fileInput.current?.click()}>SELECT FILE <span>↗</span></button><small>JPG, PNG · MAX 10MB</small></div></div></section>}
  </main>;
}

function SearchTestPage({ image, filter, setFilter }: { image: string | null; filter: string; setFilter: (filter: string) => void }) {
  const filters = [{ id: "all", label: "ALL" }, { id: "무신사", label: "MUSINSA" }, { id: "지그재그", label: "ZIGZAG" }, { id: "에이블리", label: "ABLY" }];
  const [displayedFilter, setDisplayedFilter] = useState(filter);
  const [pendingFilter, setPendingFilter] = useState<string | null>(null);
  const [isSourceSwap, setIsSourceSwap] = useState(false);
  const [swapPreviousCount, setSwapPreviousCount] = useState(0);
  const [departingCards, setDepartingCards] = useState<typeof demoMatches>([]);
  const [isProductsHeadingVisible, setIsProductsHeadingVisible] = useState(true);
  const [savedMatchIds, setSavedMatchIds] = useState<string[]>([]);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const previousCardPositions = useRef(new Map<string, DOMRect>());
  const filterTimer = useRef<number | null>(null);
  const scrollResetFrame = useRef<number | null>(null);
  const matchGridRef = useRef<HTMLDivElement>(null);
  const visibleMatches = demoMatches.filter((item) => displayedFilter === "all" || item.source === displayedFilter);
  const displayMatches = isSourceSwap && !pendingFilter ? [...visibleMatches, ...departingCards] : visibleMatches;
  const activeIndex = filters.findIndex(({ id }) => id === filter);

  useEffect(() => () => {
    if (filterTimer.current) window.clearTimeout(filterTimer.current);
    if (scrollResetFrame.current) window.cancelAnimationFrame(scrollResetFrame.current);
  }, []);

  useLayoutEffect(() => {
    if (!previousCardPositions.current.size) return;
    cardRefs.current.forEach((card, id) => {
      const previous = previousCardPositions.current.get(id);
      if (!previous) return;
      const next = card.getBoundingClientRect();
      const x = previous.left - next.left;
      const y = previous.top - next.top;
      if (x || y) card.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: "translate(0, 0)" }], { duration: 420, easing: "cubic-bezier(.2, .8, .25, 1)" });
    });
    previousCardPositions.current.clear();
  }, [displayedFilter]);

  const changeFilter = (nextFilter: string) => {
    if (nextFilter === filter || pendingFilter || isSourceSwap) return;
    const sourceSwap = displayedFilter !== "all" && nextFilter !== "all";
    const nextMatches = demoMatches.filter((item) => nextFilter === "all" || item.source === nextFilter);
    const swapDelay = sourceSwap ? 170 : 180;
    cardRefs.current.forEach((card, id) => previousCardPositions.current.set(id, card.getBoundingClientRect()));
    if (sourceSwap) {
      setSwapPreviousCount(visibleMatches.length);
      setDepartingCards(nextMatches.length < visibleMatches.length ? visibleMatches.slice(nextMatches.length) : []);
    } else setDepartingCards([]);
    const grid = matchGridRef.current;
    if (grid && grid.scrollTop > 0) {
      if (scrollResetFrame.current) window.cancelAnimationFrame(scrollResetFrame.current);
      const startingScrollTop = grid.scrollTop;
      let startedAt: number | null = null;
      const duration = 260;
      const scrollStep = (now: number) => {
        if (startedAt === null) startedAt = now;
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        grid.scrollTop = startingScrollTop * (1 - eased);
        if (progress < 1) scrollResetFrame.current = window.requestAnimationFrame(scrollStep);
      };
      scrollResetFrame.current = window.requestAnimationFrame(scrollStep);
    }
    setIsSourceSwap(sourceSwap);
    setPendingFilter(nextFilter);
    setFilter(nextFilter);
    filterTimer.current = window.setTimeout(() => {
      setDisplayedFilter(nextFilter);
      setPendingFilter(null);
      if (sourceSwap) window.setTimeout(() => { setIsSourceSwap(false); setDepartingCards([]); }, 560);
    }, swapDelay);
  };

  return <section className="test-search">
    <div className="test-heading"><div><h1>SIMILAR LOOKS</h1></div></div>
    <div className="test-controls">
      <p className="test-control-label">YOUR PHOTO</p>
      <div className="matches-controls">
        <p className={`test-control-label matched-products-label ${isProductsHeadingVisible ? "" : "is-hidden"}`}>MATCHED PRODUCTS</p>
        <nav className="source-filter" aria-label="플랫폼 필터">
          <span className={`filter-indicator at-${activeIndex}`} aria-hidden="true" />
          {filters.map(({ id, label }) => <button className={filter === id ? "active" : ""} key={id} onClick={() => changeFilter(id)}>{label}</button>)}
        </nav>
      </div>
    </div>
    <div className="test-layout">
      <aside className="uploaded-column"><div className="uploaded-photo" style={{ backgroundImage: `url(${image ?? "/lookfind-hero.png"})` }} /><small>업로드한 이미지에서 상의·하의를 분석했어요.</small></aside>
      <section className="matches-column"><div className="match-grid" ref={matchGridRef} onScroll={(event) => setIsProductsHeadingVisible(event.currentTarget.scrollTop < 2)}>{displayMatches.map((item, index) => {
        const isLeaving = !isSourceSwap && Boolean(pendingFilter && pendingFilter !== "all" && item.source !== pendingFilter);
        const pendingMatchCount = pendingFilter ? demoMatches.filter((match) => match.source === pendingFilter).length : visibleMatches.length;
        const departingStart = pendingFilter ? pendingMatchCount : visibleMatches.length;
        const isDepartingCard = isSourceSwap && index >= departingStart;
        const isAdditionalCard = isSourceSwap && !pendingFilter && index >= swapPreviousCount;
        const cardKey = isSourceSwap ? `swap-slot-${index}` : item.id;
        const animationDelay = isAdditionalCard ? `${(index - swapPreviousCount) * 65}ms` : undefined;
        const isSavedMatch = savedMatchIds.includes(item.id);
        return <article className={`match-card ${isLeaving ? "leaving" : ""} ${isSourceSwap && !isAdditionalCard && !isDepartingCard ? "source-flipping" : ""} ${isAdditionalCard ? "source-floating" : ""} ${isDepartingCard ? "source-departing" : ""}`} key={cardKey} style={{ animationDelay }} ref={(element) => { if (element) cardRefs.current.set(item.id, element); else cardRefs.current.delete(item.id); }}><div className={`match-photo ${item.tone}`}><span>{sourceLabels[item.source]}</span></div><h3>{item.name}</h3><div className="match-product-line"><small>{item.brand}</small><button className={isSavedMatch ? "match-favorite saved" : "match-favorite"} onClick={() => setSavedMatchIds((current) => isSavedMatch ? current.filter((id) => id !== item.id) : [...current, item.id])} aria-label={`${item.name} 저장`}><HeartIcon filled={isSavedMatch} /></button></div><strong>{item.price}</strong></article>;
      })}</div></section>
    </div>
  </section>;
}

function Favorites({ loggedIn, items, favorites, onFavorite, onLogin }: { onLogin: () => void; loggedIn: boolean; items: Product[]; favorites: string[]; onFavorite: (id: string) => void }) {
  if (!loggedIn) return <MemberGate title="좋아요 목록은 로그인 후 이용할 수 있어요." text="마음에 드는 상품을 저장하고 나중에 비교해보세요." onLogin={onLogin} />;
  return <section className="collection-page">
    <div className="collection-heading"><h1>SAVED LOOKS</h1><span className="collection-count">{favorites.length} ITEMS</span></div>
    {items.length ? <div className="saved-grid">{items.map((item) => <article className="saved-card" key={item.id}>
      <div className={`saved-visual ${item.tone}`}><span>{sourceLabels[item.platform]}</span></div><h2>{item.name}</h2><div className="saved-product-line"><p>{item.brand}</p><button className="saved-favorite" aria-label={`${item.name} 저장 취소`} onClick={() => onFavorite(item.id)}><HeartIcon filled /></button></div><strong>{won(item.price)}</strong>
    </article>)}</div> : <p className="collection-empty">아직 저장한 제품이 없습니다.</p>}
  </section>;
}


function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20.8-1.32-1.2C5.48 14.9 2.4 12.1 2.4 8.58c0-2.88 2.26-5.18 5.13-5.18 1.62 0 3.18.75 4.2 1.96a5.53 5.53 0 0 1 4.2-1.96c2.87 0 5.13 2.3 5.13 5.18 0 3.52-3.08 6.32-8.28 11.02L12 20.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "1" : "1.15"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
