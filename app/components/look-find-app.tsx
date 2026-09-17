"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { readFavorites, readHistory, writeFavorites, writeHistory } from "../apis/local-store";
import { products } from "../constants/look-find";
import type { Product, SearchHistory } from "../types/look-find";

type Page = "home" | "history" | "favorites";

const won = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

export default function LookFindApp() {
  const [page, setPage] = useState<Page>("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>(readHistory);
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [uploadMode, setUploadMode] = useState(false);
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
    setUploadMode(false);
    setIsDragging(false);
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
    setUploadMode(true);
  }

  return <main className="lookfind">
    <header className={uploadMode ? "site-header upload-active" : "site-header"}>
      <button className="wordmark" onClick={() => setPage("home")}>LOOK<span>•</span>FIND</button>
      <nav aria-label="주 메뉴">
        {([ ["home", "SEARCH"], ["history", "ARCHIVE"], ["favorites", "SAVED"] ] as const).map(([id, label]) =>
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
    </section> : page === "history" ? <History loggedIn={loggedIn} history={history} remove={(id) => setHistory((current) => { const next = current.filter((item) => item.id !== id); writeHistory(next); return next; })} clear={() => { setHistory([]); writeHistory([]); }} reopen={() => setPage("home")} /> : <Favorites loggedIn={loggedIn} items={products.filter((item) => favorites.includes(item.id))} favorites={favorites} onFavorite={toggleFavorite} />}
    {uploadMode && <section className="upload-mode" aria-modal="true" role="dialog"><button className="close-upload" onClick={() => setUploadMode(false)} aria-label="업로드 화면 닫기">×</button><div className="upload-content"><h2>UPLOAD PHOTO</h2><div className={isDragging ? "upload-finder dragging" : "upload-finder"} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={dropImage}><span className="finder-corner top-left" /><span className="finder-corner top-right" /><span className="finder-corner bottom-left" /><span className="finder-corner bottom-right" /><span className="recording">● REC</span><span className="finder-plus">+</span><p>사진을 이곳에 끌어다 놓거나</p><button className="upload-mode-button" onClick={() => fileInput.current?.click()}>SELECT FILE <span>↗</span></button><small>JPG, PNG · MAX 10MB</small></div></div></section>}
  </main>;
}

function ProductCard({ item, saved, onFavorite }: { item: Product; saved: boolean; onFavorite: (id: string) => void }) {
  return <article className="product-card"><div className={`product-visual ${item.tone}`}><span>{item.similarity}% MATCH</span><button className={saved ? "saved" : ""} onClick={() => onFavorite(item.id)}>{saved ? "♥" : "♡"}</button></div><p>{item.platform}</p><h3>{item.name}</h3><small>{item.brand}</small><strong>{won(item.price)}</strong><a href="https://www.musinsa.com" target="_blank" rel="noreferrer">VIEW ITEM ↗</a></article>;
}

function History({ loggedIn, history, remove, clear, reopen }: { loggedIn: boolean; history: SearchHistory[]; remove: (id: string) => void; clear: () => void; reopen: () => void }) {
  if (!loggedIn) return <MemberGate title="검색 기록은 로그인 후 저장돼요" text="로그인하면 이전에 검색한 사진과 결과를 다시 확인할 수 있어요." />;
  return <section className="member-page"><p>MY ARCHIVE</p><h1>RECENT<br />SEARCHES</h1><div className="member-description"><span>검색 원본 이미지는 일정 기간 후 자동 삭제됩니다.</span><button onClick={clear}>CLEAR ALL</button></div><div className="history-list">{history.length ? history.map((item) => <article key={item.id}><button className="history-open" onClick={reopen}><b>⌁</b><span><strong>{item.label}</strong><small>{item.searchedAt} · {item.count}개 결과</small></span></button><button className="remove" onClick={() => remove(item.id)}>×</button></article>) : <p className="empty">저장된 검색 이력이 없습니다.</p>}</div></section>;
}

function Favorites({ loggedIn, items, favorites, onFavorite }: { loggedIn: boolean; items: Product[]; favorites: string[]; onFavorite: (id: string) => void }) {
  if (!loggedIn) return <MemberGate title="찜 목록은 로그인 후 이용할 수 있어요" text="마음에 드는 상품을 저장하고 나중에 비교해보세요." />;
  return <section className="member-page"><p>MY SAVED ITEMS</p><h1>SAVED<br />LOOKS <small>{favorites.length}</small></h1>{items.length ? <div className="product-grid">{items.map((item) => <ProductCard item={item} key={item.id} saved onFavorite={onFavorite} />)}</div> : <p className="empty">아직 찜한 상품이 없습니다.</p>}</section>;
}

function MemberGate({ title, text }: { title: string; text: string }) { return <section className="member-gate"><b>✦</b><h1>{title}</h1><p>{text}</p></section>; }
