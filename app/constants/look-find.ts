import type { Product, SearchHistory } from "../types/look-find";
export const HISTORY_KEY="lookfind-history", FAVORITES_KEY="lookfind-favorites";
export const products:Product[]=[
 {id:"m1",name:"오버핏 빈티지 데님 재킷",brand:"COVERNAT",platform:"무신사",price:89900,similarity:96,tone:"one"},
 {id:"a1",name:"루즈핏 워싱 데님 자켓",brand:"리리앤코",platform:"에이블리",price:42600,similarity:92,tone:"two"},
 {id:"m2",name:"레귤러 워크 데님 블루종",brand:"thisisneverthat",platform:"무신사",price:118000,similarity:88,tone:"three"},
 {id:"a2",name:"클래식 데님 트러커 재킷",brand:"메이비베이비",platform:"에이블리",price:53900,similarity:85,tone:"four"},
 {id:"m3",name:"크롭 워싱 데님 셔츠",brand:"MUSINSA STANDARD",platform:"무신사",price:49900,similarity:79,tone:"five"},
 {id:"a3",name:"데일리 연청 데님 재킷",brand:"데이데이",platform:"에이블리",price:38700,similarity:76,tone:"six"},
 {id:"m4",name:"라이트 워싱 데님 오버셔츠",brand:"FRIZMWORKS",platform:"무신사",price:73500,similarity:74,tone:"two"},
 {id:"a4",name:"빈티지 워크 데님 재킷",brand:"아뜨랑스",platform:"에이블리",price:64800,similarity:72,tone:"five"},
 {id:"z1",name:"오버핏 스티치 데님 재킷",brand:"시티브리즈",platform:"지그재그",price:82900,similarity:70,tone:"six"}
];
export const initialHistory:SearchHistory[]=[{id:"h1",label:"데님 재킷 착용 사진",searchedAt:"오늘 오전 10:42",count:20},{id:"h2",label:"블랙 바람막이 사진",searchedAt:"어제 오후 5:20",count:20},{id:"h3",label:"니트 가디건 사진",searchedAt:"9월 12일",count:20},{id:"h4",label:"브라운 스웨이드 재킷",searchedAt:"9월 9일",count:20},{id:"h5",label:"화이트 셔츠 코디",searchedAt:"9월 4일",count:20},{id:"h6",label:"카키 카고 팬츠",searchedAt:"8월 28일",count:20},{id:"h7",label:"스트라이프 셔츠 룩",searchedAt:"8월 21일",count:20},{id:"h8",label:"그레이 후드 집업",searchedAt:"8월 15일",count:20},{id:"h9",label:"레더 미니 스커트",searchedAt:"8월 7일",count:20}];
