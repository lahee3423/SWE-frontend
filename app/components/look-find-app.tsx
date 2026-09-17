"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { readFavorites, readHistory, writeFavorites, writeHistory } from "../apis/local-store";
import { products } from "../constants/look-find";
import type { Platform, Product, SearchHistory } from "../types/look-find";

type Page = "home" | "history" | "favorites";

const won = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

export default function LookFindApp() {
  const [page, setPage] = useState<Page>("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [platform, setPlatform] = useState<Platform | "전체">("전체");
  const [sort, setSort] = useState<"similarity" | "price">("similarity");
  const [history, setHistory] = useState<SearchHistory[]>(readHistory);
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [uploadMode, setUploadMode] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const listedProducts = useMemo(() => products
    .filter((item) => platform === "전체" || item.platform === platform)
    .sort((a, b) => sort === "price" ? a.price - b.price : b.similarity - a.similarity), [platform, sort]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    setSearched(false);
    setUploadMode(false);
  }

  function search() {
    if (!imageUrl) return fileInput.current?.click();
    setSearched(true);
    if (loggedIn) setHistory((current) => {
      const next = [{ id: crypto.randomUUID(), label: "업로드한 상의 사진", searchedAt: "방금 전", count: 20 }, ...current];
      writeHistory(next);
      return next;
    });
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
    <header className="site-header">
      <button className="wordmark" onClick={() => setPage("home")}>LOOK<span>•</span>FIND</button>
      <nav aria-label="주 메뉴">
        {([ ["home", "SEARCH"], ["history", "ARCHIVE"], ["favorites", "SAVED"] ] as const).map(([id, label]) =>
          <button className={page === id ? "active" : ""} key={id} onClick={() => setPage(id)}>{label}</button>)}
      </nav>
      <button className="account" onClick={() => setLoggedIn((current) => !current)}>{loggedIn ? "MY PAGE / LOGOUT" : "LOGIN"}</button>
    </header>

    {page === "home" ? <section className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>LOOKFIND</h1>
          <p>사진 한 장으로 원하는 스타일을 찾아보세요.<br />사진 속 옷을 AI가 하나씩 분석하고,<br />비슷한 디자인의 상품을 찾아드립니다.<br />무신사, 지그재그, 에이블리의 상품을 한눈에 비교하고<br />당신이 찾던 옷을 가장 쉽게 발견해보세요.</p>
          <button onClick={openUploadMode}>PHOTO UPLOAD <span>↗</span></button>
        </div>
        <div className="hero-image"><Image src="/lookfind-hero.png" alt="LookFind 스타일 이미지" fill priority sizes="(max-width: 700px) 100vw, 50vw" /><div className="analysis-layer" aria-label="AI 의류 분석 표시"><div className="analysis-box shirt"><span>TOP / 98.4%</span></div><div className="analysis-box pants"><span>PANTS / 96.1%</span></div><div className="analysis-box boots"><span>BOOTS / 94.7%</span></div><div className="analysis-crop crop-shirt"><small>TOP</small></div><div className="analysis-crop crop-pants"><small>PANTS</small></div><div className="analysis-crop crop-boots"><small>BOOTS</small></div></div></div>
      </section>

      <Runway />

      <section className="search-section">
        <div className="vertical-label">VISUAL SEARCH</div>
        <div className="search-panel">
          <div className="search-heading"><p>UPLOAD YOUR LOOK</p><h2>사진 속 상의를<br />찾아볼 준비가 되었나요?</h2></div>
          <input ref={fileInput} className="file-input" type="file" accept="image/*" onChange={chooseImage} />
          {imageUrl ? <div className="preview"><img src={imageUrl} alt="업로드한 검색 사진" /><button onClick={() => { setImageUrl(null); setSearched(false); }}>×</button></div> : <button className="dropzone" onClick={() => fileInput.current?.click()}><b>+</b><strong>상의 사진 업로드</strong><small>JPG, PNG · MAX 10MB</small></button>}
          <button className="primary-button" onClick={search}>{imageUrl ? "SIMILAR LOOKS FIND" : "SELECT AN IMAGE"} <span>→</span></button>
          <p className="disclaimer">얼굴과 배경은 제외하고 상의만 분석합니다.</p>
        </div>
      </section>

      {searched && <Results items={listedProducts} platform={platform} setPlatform={setPlatform} sort={sort} setSort={setSort} favorites={favorites} onFavorite={toggleFavorite} />}
    </section> : page === "history" ? <History loggedIn={loggedIn} history={history} remove={(id) => setHistory((current) => { const next = current.filter((item) => item.id !== id); writeHistory(next); return next; })} clear={() => { setHistory([]); writeHistory([]); }} reopen={() => { setPage("home"); setSearched(true); }} /> : <Favorites loggedIn={loggedIn} items={products.filter((item) => favorites.includes(item.id))} favorites={favorites} onFavorite={toggleFavorite} />}
    {uploadMode && <section className="upload-mode" aria-modal="true" role="dialog"><button className="close-upload" onClick={() => setUploadMode(false)} aria-label="업로드 화면 닫기">×</button><div><p>LOOKFIND / IMAGE SEARCH</p><h2>YOUR<br />PHOTO</h2><button className="upload-mode-button" onClick={() => fileInput.current?.click()}>PHOTO UPLOAD <span>↗</span></button><small>JPG, PNG · MAX 10MB</small></div></section>}
  </main>;
}

function Results({ items, platform, setPlatform, sort, setSort, favorites, onFavorite }: { items: Product[]; platform: Platform | "전체"; setPlatform: (value: Platform | "전체") => void; sort: "similarity" | "price"; setSort: (value: "similarity" | "price") => void; favorites: string[]; onFavorite: (id: string) => void }) {
  return <section className="results"><div className="result-head"><div><p>MATCHED COLLECTION</p><h2>LOOKS LIKE <i>YOU</i></h2></div><span>20 ITEMS FOUND</span></div><div className="filters"><div>{(["전체", "무신사", "에이블리"] as const).map((item) => <button className={platform === item ? "active" : ""} key={item} onClick={() => setPlatform(item)}>{item}</button>)}</div><select value={sort} onChange={(event) => setSort(event.target.value as "similarity" | "price")}><option value="similarity">유사도순</option><option value="price">낮은 가격순</option></select></div><div className="product-grid">{items.map((item) => <ProductCard item={item} key={item.id} saved={favorites.includes(item.id)} onFavorite={onFavorite} />)}</div></section>;
}

function ProductCard({ item, saved, onFavorite }: { item: Product; saved: boolean; onFavorite: (id: string) => void }) {
  return <article className="product-card"><div className={`product-visual ${item.tone}`}><span>{item.similarity}% MATCH</span><button className={saved ? "saved" : ""} onClick={() => onFavorite(item.id)}>{saved ? "♥" : "♡"}</button></div><p>{item.platform}</p><h3>{item.name}</h3><small>{item.brand}</small><strong>{won(item.price)}</strong><a href="https://www.musinsa.com" target="_blank" rel="noreferrer">VIEW ITEM ↗</a></article>;
}

function Runway() {
  const looks = ["LOOK 01", "LOOK 02", "LOOK 03", "LOOK 04", "LOOK 05", "LOOK 06"];
  return <section className="runway" aria-label="새로운 의류 컬렉션">
    <div className="runway-head"><span>NEW ARRIVALS</span><h2>SCROLLING<br /><i>STYLES</i></h2><span>2026 COLLECTION</span></div>
    {["first", "second"].map((row) => <div className={`marquee ${row}`} key={row}><div className="marquee-track">{[...looks, ...looks].map((look, index) => <article className={`look-placeholder look-${index % 6}`} key={`${row}-${index}`}><div><span>{look}</span></div><small>IMAGE COMING SOON</small></article>)}</div></div>)}
  </section>;
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
