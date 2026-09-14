export type Platform = "무신사" | "에이블리";
export type Product = { id:string; name:string; brand:string; platform:Platform; price:number; similarity:number; tone:string };
export type SearchHistory = { id:string; label:string; searchedAt:string; count:number };
