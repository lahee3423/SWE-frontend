"use client";

import { useState } from "react";
import type { SearchResponse } from "../types/api";

export function CatalogImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  // Product media can be private S3 content. Never replace a failed image with a demo product.
  return failed ? <div className="image-unavailable">이미지 준비 중</div>
    // eslint-disable-next-line @next/next/no-img-element
    : <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export default function SearchResults({ image, result, busy, error, retry, loggedIn, onLogin }: {
  image: string | null; result: SearchResponse | null; busy: boolean; error: string;
  retry?: () => void; loggedIn: boolean; onLogin: () => void;
}) {
  const [filter, setFilter] = useState("all");
  const items = result?.results.filter(item => filter === "all" || item.platform === filter) ?? [];
  return <section className="live-results" aria-busy={busy}>
    <div className="live-heading"><h1>SIMILAR LOOKS</h1><span>{result ? `${items.length} MATCHES` : "PHOTO SEARCH"}</span></div>
    <div className="live-layout">
      <aside>{image && <CatalogImage key={image} src={image} alt="검색한 사진" />}<p>{result ? "사진 속 상의와 유사한 상품을 찾았어요." : "사진을 분석하고 있어요."}</p>
        {loggedIn ? <small>완료된 검색은 ARCHIVE에 저장됩니다.</small> : <button className="inline-action" onClick={onLogin}>로그인하고 다음 검색부터 기록 저장하기 ↗</button>}
      </aside>
      <div>
        {busy && <p className="api-status" role="status">사진을 분석하고 있습니다. 첫 검색은 모델을 준비하느라 시간이 걸릴 수 있어요.</p>}
        {error && <div className="api-error" role="alert"><p>{error}</p>{retry && <button className="inline-action" onClick={retry}>다시 시도</button>}</div>}
        {result && <><nav className="live-filters" aria-label="검색 결과 플랫폼">{[["all", "ALL"], ["musinsa", "MUSINSA"], ["ably", "ABLY"]].map(([id, label]) => <button key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}</nav>
          {items.length ? <div className="live-product-grid">{items.map(item => <a className="live-product" href={item.product_url} target="_blank" rel="noopener noreferrer" key={`${item.platform}:${item.goods_no}`}>
            <CatalogImage src={item.image_url} alt={item.goods_name} /><small>{item.brand_name} · {item.platform.toUpperCase()}</small><h2>{item.goods_name}</h2><strong>{item.price === null ? "가격 확인" : `${item.price.toLocaleString("ko-KR")}원`}</strong><span>유사도 {Math.round(item.similarity * 100)}%</span>
          </a>)}</div> : <p className="collection-empty">해당 플랫폼의 검색 결과가 없습니다.</p>}</>}
      </div>
    </div>
  </section>;
}
