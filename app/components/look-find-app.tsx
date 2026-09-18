"use client";

import { ChangeEvent, DragEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { readFavorites, readHistory, writeFavorites, writeHistory } from "../apis/local-store";
import { initialHistory, products } from "../constants/look-find";
import type { Product, SearchHistory } from "../types/look-find";

type Page = "home" | "history" | "favorites" | "test";

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
  const [loggedIn, setLoggedIn] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>(() => {
    const storedHistory = readHistory();
    const restoredHistory = new Map(initialHistory.map((item) => [item.id, item]));
    storedHistory.forEach((item) => restoredHistory.set(item.id, item));
    return Array.from(restoredHistory.values());
  });
  const [clearedHistory, setClearedHistory] = useState<SearchHistory[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const storedFavorites = readFavorites();
    return Array.from(new Set([...sampleFavoriteIds, ...storedFavorites]));
  });
  const [uploadMode, setUploadMode] = useState(false);
  const [isClosingUpload, setIsClosingUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [analysisStage, setAnalysisStage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const stageLock = useRef(false);
  const touchStart = useRef(0);

  useEffect(() => {
    if (page !== "home" || uploadMode) return;

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
  }, [page, uploadMode]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    loadImage(event.target.files?.[0]);
  }

  function loadImage(file?: File) {
    if (!file) return;
    setUploadedImage(URL.createObjectURL(file));
    setUploadMode(false);
    setIsDragging(false);
    setPage("test");
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

  function clearHistory() {
    setHistory((current) => {
      setClearedHistory(current);
      writeHistory([]);
      return [];
    });
  }

  function restoreHistory() {
    if (!clearedHistory) return;
    setHistory(clearedHistory);
    writeHistory(clearedHistory);
    setClearedHistory(null);
  }

  function openUploadMode() {
    setIsClosingUpload(false);
    setUploadMode(true);
  }

  function closeUploadMode() {
    if (isClosingUpload) return;
    setIsClosingUpload(true);
    window.setTimeout(() => {
      setUploadMode(false);
      setIsClosingUpload(false);
    }, 650);
  }

  return <main className="lookfind">
    <header className={uploadMode ? "site-header upload-active" : "site-header"}>
      <button className="wordmark" onClick={() => setPage("home")}>LOOK<span>•</span>FIND</button>
      <nav aria-label="주 메뉴">
        {([ ["home", "SEARCH"], ["history", "ARCHIVE"], ["favorites", "SAVED"], ["test", "TEST"] ] as const).map(([id, label]) =>
          <button className={page === id ? "active" : ""} key={id} onClick={() => setPage(id)}>{label}</button>)}
      </nav>
      <button className="account" onClick={() => setLoggedIn((current) => !current)}>{loggedIn ? "MY PAGE / LOGOUT" : "LOGIN"}</button>
    </header>

    {page === "home" ? <section className="home">
      <section className="hero">
        <input ref={fileInput} className="file-input" type="file" accept="image/*" onChange={chooseImage} />
        <div className="hero-copy">
          <h1>LOOKFIND</h1>
          <p>사진 한 장으로 원하는 스타일을 찾아보세요.<br />사진 속 옷을 AI가 하나씩 분석하고,<br />비슷한 디자인의 상품을 찾아드립니다.<br />무신사, 지그재그, 에이블리의 상품을 한눈에 비교하고<br />당신이 찾던 옷을 가장 쉽게 발견해보세요.</p>
          <button onClick={openUploadMode}>PHOTO UPLOAD <span>↗</span></button>
        </div>
        <div className="hero-image"><Image src="/lookfind-hero.png" alt="LookFind 스타일 이미지" fill priority sizes="(max-width: 700px) 100vw, 50vw" /><div className={`analysis-layer stage-${analysisStage}`} aria-label="AI 의류 분석 표시"><div className="analysis-box shirt"><span>TOP</span><div className="analysis-crop crop-shirt"><small>TOP</small></div></div><div className="analysis-box pants"><span>PANTS</span><div className="analysis-crop crop-pants"><small>PANTS</small></div></div><div className="analysis-box boots"><span>BOOTS</span><div className="analysis-crop crop-boots"><small>BOOTS</small></div></div></div></div>
      </section>
    </section> : page === "history" ? <History loggedIn={loggedIn} history={history} remove={(id) => setHistory((current) => { const next = current.filter((item) => item.id !== id); writeHistory(next); return next; })} clear={clearHistory} restore={restoreHistory} canRestore={Boolean(clearedHistory)} reopen={() => setPage("home")} /> : page === "favorites" ? <Favorites loggedIn={loggedIn} items={products.filter((item) => favorites.includes(item.id))} favorites={favorites} onFavorite={toggleFavorite} /> : <SearchTestPage image={uploadedImage} filter={sourceFilter} setFilter={setSourceFilter} />}
    {uploadMode && <section className={isClosingUpload ? "upload-mode closing" : "upload-mode"} aria-modal="true" role="dialog"><button className="close-upload" onClick={closeUploadMode} aria-label="업로드 화면 닫기">×</button><div className="upload-content"><h2>UPLOAD PHOTO</h2><div className={isDragging ? "upload-finder dragging" : "upload-finder"} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={dropImage}><span className="finder-corner top-left" /><span className="finder-corner top-right" /><span className="finder-corner bottom-left" /><span className="finder-corner bottom-right" /><span className="recording">● REC</span><p>사진을 이곳에 끌어다 놓거나 파일을 업로드 해주세요.</p><button className="upload-mode-button" onClick={() => fileInput.current?.click()}>SELECT FILE <span>↗</span></button><small>JPG, PNG · MAX 10MB</small></div></div></section>}
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
        return <article className={`match-card ${isLeaving ? "leaving" : ""} ${isSourceSwap && !isAdditionalCard && !isDepartingCard ? "source-flipping" : ""} ${isAdditionalCard ? "source-floating" : ""} ${isDepartingCard ? "source-departing" : ""}`} key={cardKey} style={{ animationDelay }} ref={(element) => { if (element) cardRefs.current.set(item.id, element); else cardRefs.current.delete(item.id); }}><div className={`match-photo ${item.tone}`}><span>{sourceLabels[item.source]}</span></div><h3>{item.name}</h3><div className="match-product-line"><small>{item.brand}</small><button className={isSavedMatch ? "match-favorite saved" : "match-favorite"} onClick={() => setSavedMatchIds((current) => isSavedMatch ? current.filter((id) => id !== item.id) : [...current, item.id])} aria-label={`${item.name} 저장`}>{isSavedMatch ? "♥" : "♡"}</button></div><strong>{item.price}</strong></article>;
      })}</div></section>
    </div>
  </section>;
}

function History({ loggedIn, history, remove, clear, restore, canRestore, reopen }: { loggedIn: boolean; history: SearchHistory[]; remove: (id: string) => void; clear: () => void; restore: () => void; canRestore: boolean; reopen: () => void }) {
  const [isClearing, setIsClearing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const previousCardPositions = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    if (!previousCardPositions.current.size) return;
    cardRefs.current.forEach((card, id) => {
      const previous = previousCardPositions.current.get(id);
      if (!previous) return;
      const next = card.getBoundingClientRect();
      const x = previous.left - next.left;
      const y = previous.top - next.top;
      if (x || y) card.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: "translate(0, 0)" }], { duration: 360, easing: "cubic-bezier(.2, .8, .25, 1)" });
    });
    previousCardPositions.current.clear();
  }, [history]);

  const clearWithAnimation = () => {
    if (!history.length || isClearing || removingId) return;
    setIsClearing(true);
    window.setTimeout(() => {
      clear();
      setIsClearing(false);
    }, 700);
  };
  const removeWithAnimation = (id: string) => {
    if (isClearing || removingId) return;
    setRemovingId(id);
    window.setTimeout(() => {
      cardRefs.current.forEach((card, cardId) => {
        if (cardId !== id) previousCardPositions.current.set(cardId, card.getBoundingClientRect());
      });
      remove(id);
      setRemovingId(null);
    }, 300);
  };
  if (!loggedIn) return <MemberGate title="검색 기록은 로그인 후 저장돼요" text="로그인하면 이전에 검색한 사진과 결과를 다시 확인할 수 있어요." />;
  return <section className="collection-page">
    <div className="collection-heading"><h1>ARCHIVE</h1><div className="collection-actions"><button className="collection-action" onClick={clearWithAnimation} disabled={!history.length || isClearing || Boolean(removingId)}>CLEAR ALL <span>↗</span></button><button className="collection-return" onClick={restore} disabled={!canRestore || isClearing || Boolean(removingId)}>RETURN <span>↶</span></button></div></div>
    {history.length ? <div className={isClearing ? "archive-grid is-clearing" : "archive-grid"}>{history.map((item, index) => <article className={`archive-card archive-tone-${index % 3} ${removingId === item.id ? "is-removing" : ""}`} key={item.id} style={isClearing ? { animationDelay: `${index * 42}ms` } : undefined} ref={(element) => { if (element) cardRefs.current.set(item.id, element); else cardRefs.current.delete(item.id); }}>
      <button className="archive-open" onClick={reopen}><div className="archive-visual saved-visual"><span>SEARCH 0{index + 1}</span></div><div className="archive-info"><h2>{item.label}</h2><p>{item.searchedAt}</p><strong>{item.count} MATCHES</strong></div></button>
      <button className="archive-remove" aria-label={`${item.label} 삭제`} onClick={() => removeWithAnimation(item.id)} disabled={isClearing || Boolean(removingId)}>×</button>
    </article>)}</div> : <p className="collection-empty">저장된 검색 이력이 없습니다.</p>}
  </section>;
}

function Favorites({ loggedIn, items, favorites, onFavorite }: { loggedIn: boolean; items: Product[]; favorites: string[]; onFavorite: (id: string) => void }) {
  if (!loggedIn) return <MemberGate title="찜 목록은 로그인 후 이용할 수 있어요" text="마음에 드는 상품을 저장하고 나중에 비교해보세요." />;
  return <section className="collection-page">
    <div className="collection-heading"><h1>SAVED LOOKS</h1><span className="collection-count">{favorites.length} ITEMS</span></div>
    {items.length ? <div className="saved-grid">{items.map((item) => <article className="saved-card" key={item.id}>
      <div className={`saved-visual ${item.tone}`}><span>{item.platform}</span></div><h2>{item.name}</h2><div className="saved-product-line"><p>{item.brand}</p><button className="saved-favorite" aria-label={`${item.name} 저장 취소`} onClick={() => onFavorite(item.id)}>♥</button></div><strong>{won(item.price)}</strong>
    </article>)}</div> : <p className="collection-empty">아직 저장한 제품이 없습니다.</p>}
  </section>;
}

function MemberGate({ title, text }: { title: string; text: string }) { return <section className="member-gate"><b>✦</b><h1>{title}</h1><p>{text}</p></section>; }
