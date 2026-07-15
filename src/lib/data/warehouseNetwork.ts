/**
 * Mạng lưới kho MC — PPT BACKGROUND MC WH + Excel Rental WH
 * Tọa độ thực (lat/lng WGS84) cho bản đồ OpenStreetMap
 * Hoàng Sa & Trường Sa: lãnh thổ Việt Nam
 */

export type WhType = "owned" | "rented" | "sovereignty";
export type Region = "north" | "central" | "south" | "east_sea";

export type WarehouseNode = {
  id: string;
  name: string;
  short: string;
  region: Region;
  type: WhType;
  /** WGS84 */
  lat: number;
  lng: number;
  cap100: number;
  cap80: number;
  ratioPct: number;
  note?: string;
  city: string;
};

export const WAREHOUSES: WarehouseNode[] = [
  // ── Miền Bắc (Vĩnh Phúc / Hà Nội area) ──
  {
    id: "log1",
    name: "HVN LOG 1",
    short: "LOG1",
    region: "north",
    type: "owned",
    lat: 21.308,
    lng: 105.598,
    cap100: 4532,
    cap80: 3612,
    ratioPct: 7,
    city: "Vĩnh Phúc",
    note: "PTF cluster · HVN owned",
  },
  {
    id: "log2",
    name: "HVN LOG 2",
    short: "LOG2",
    region: "north",
    type: "owned",
    lat: 21.325,
    lng: 105.62,
    cap100: 4188,
    cap80: 3371,
    ratioPct: 7,
    city: "Vĩnh Phúc",
  },
  {
    id: "ptf-new",
    name: "HVN PTF New",
    short: "PTF",
    region: "north",
    type: "owned",
    lat: 21.29,
    lng: 105.575,
    cap100: 3220,
    cap80: 2576,
    ratioPct: 5,
    city: "Vĩnh Phúc",
  },
  {
    id: "cbu",
    name: "CBU WH",
    short: "CBU",
    region: "north",
    type: "owned",
    lat: 21.275,
    lng: 105.61,
    cap100: 4000,
    cap80: 3200,
    ratioPct: 7,
    city: "Vĩnh Phúc",
    note: "Floor lớn · clear height cao (PPT)",
  },
  {
    id: "log3",
    name: "HVN LOG 3",
    short: "LOG3",
    region: "north",
    type: "owned",
    lat: 21.295,
    lng: 105.64,
    cap100: 4021,
    cap80: 3234,
    ratioPct: 7,
    city: "Vĩnh Phúc",
  },
  {
    id: "nkv",
    name: "NKV-NBF",
    short: "NKV",
    region: "north",
    type: "rented",
    lat: 21.05,
    lng: 105.78,
    cap100: 3000,
    cap80: 2400,
    ratioPct: 5,
    city: "Hà Nội / NKV",
    note: "Excel: thuê 5000m² ≈ 1100 xe thực tế",
  },
  {
    id: "nbf",
    name: "NBF WH",
    short: "NBF",
    region: "north",
    type: "rented",
    lat: 21.18,
    lng: 105.52,
    cap100: 7021,
    cap80: 5634,
    ratioPct: 12,
    city: "Miền Bắc",
    note: "Kho thuê · mid-term expand",
  },
  // ── Trung ──
  {
    id: "nghe-an",
    name: "Nghệ An WH",
    short: "N.An",
    region: "central",
    type: "rented",
    lat: 18.679,
    lng: 105.681,
    cap100: 8000,
    cap80: 6400,
    ratioPct: 13,
    city: "Nghệ An",
  },
  {
    id: "da-nang",
    name: "Đà Nẵng WH",
    short: "ĐN",
    region: "central",
    type: "rented",
    lat: 16.054,
    lng: 108.202,
    cap100: 5500,
    cap80: 4400,
    ratioPct: 9,
    city: "Đà Nẵng",
  },
  // ── Nam ──
  {
    id: "dong-nai",
    name: "Đồng Nai WH",
    short: "ĐNai",
    region: "south",
    type: "rented",
    lat: 10.957,
    lng: 106.843,
    cap100: 11000,
    cap80: 8800,
    ratioPct: 18,
    city: "Đồng Nai",
  },
  {
    id: "long-an",
    name: "Long An WH",
    short: "LA",
    region: "south",
    type: "rented",
    lat: 10.695,
    lng: 106.243,
    cap100: 11000,
    cap80: 8800,
    ratioPct: 18,
    city: "Long An",
  },
  {
    id: "cai-cui",
    name: "Cái Cui WH",
    short: "CC",
    region: "south",
    type: "rented",
    lat: 10.045,
    lng: 105.747,
    cap100: 2500,
    cap80: 2000,
    ratioPct: 4,
    city: "Cần Thơ / Cái Cui",
  },
  // ── Biển Đông · Lãnh thổ Việt Nam ──
  {
    id: "hoang-sa",
    name: "Quần đảo Hoàng Sa",
    short: "HS",
    region: "east_sea",
    type: "sovereignty",
    lat: 16.5,
    lng: 112.0,
    cap100: 0,
    cap80: 0,
    ratioPct: 0,
    city: "Biển Đông · Việt Nam",
    note: "Lãnh thổ Việt Nam — Quần đảo Hoàng Sa",
  },
  {
    id: "truong-sa",
    name: "Quần đảo Trường Sa",
    short: "TS",
    region: "east_sea",
    type: "sovereignty",
    lat: 10.0,
    lng: 114.0,
    cap100: 0,
    cap80: 0,
    ratioPct: 0,
    city: "Biển Đông · Việt Nam",
    note: "Lãnh thổ Việt Nam — Quần đảo Trường Sa",
  },
];

/** Các đảo nhỏ xung quanh Hoàng Sa (hiển thị cụm) */
export const HOANG_SA_ISLETS: { lat: number; lng: number; name: string }[] = [
  { lat: 16.83, lng: 112.33, name: "Đá Bắc" },
  { lat: 16.53, lng: 111.61, name: "Đảo Phú Lâm" },
  { lat: 16.45, lng: 111.72, name: "Đảo Linh Côn" },
  { lat: 16.55, lng: 112.25, name: "Đảo Cây" },
  { lat: 16.32, lng: 112.0, name: "Đá Châu Nhai" },
];

/** Các đảo nhỏ xung quanh Trường Sa */
export const TRUONG_SA_ISLETS: { lat: number; lng: number; name: string }[] = [
  { lat: 8.64, lng: 111.92, name: "Đảo Trường Sa" },
  { lat: 9.55, lng: 112.88, name: "Đảo Song Tử Tây" },
  { lat: 11.43, lng: 114.35, name: "Đảo Thị Tứ" },
  { lat: 10.38, lng: 114.48, name: "Đảo Nam Yết" },
  { lat: 10.18, lng: 114.22, name: "Đảo Sơn Ca" },
  { lat: 8.85, lng: 112.6, name: "Đảo Sinh Tồn" },
];

export const REGION_CAPS = {
  north: { cap100: 22961, cap80: 18393, ratio: 38 },
  central: { cap100: 13500, cap80: 10800, ratio: 22 },
  south: { cap100: 24500, cap80: 19600, ratio: 40 },
  nationwide: { cap100: 60961, cap80: 48793 },
  hvnOwned: { cap: 15993, ratio: 33 },
  outside: { cap: 32800, ratio: 67 },
} as const;

export type TransportLane = {
  id: string;
  fromId: string;
  toId: string;
  mode: "sea" | "truck";
  label: string;
};

export const LANES: TransportLane[] = [
  {
    id: "vp-la-sea",
    fromId: "log1",
    toId: "long-an",
    mode: "sea",
    label: "Vĩnh Phúc → Long An (Sea)",
  },
  {
    id: "vp-dn-sea",
    fromId: "log1",
    toId: "dong-nai",
    mode: "sea",
    label: "Vĩnh Phúc → Đồng Nai (Sea)",
  },
  {
    id: "vp-cc-sea",
    fromId: "log1",
    toId: "cai-cui",
    mode: "sea",
    label: "Vĩnh Phúc → Cái Cui (Sea)",
  },
  {
    id: "vp-la-trk",
    fromId: "cbu",
    toId: "long-an",
    mode: "truck",
    label: "Bắc → Long An (Truck)",
  },
  {
    id: "vp-dn-trk",
    fromId: "cbu",
    toId: "dong-nai",
    mode: "truck",
    label: "Bắc → Đồng Nai (Truck)",
  },
];

export const REGION_LABEL: Record<Region, string> = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
  east_sea: "Biển Đông",
};

export const REGION_COLOR: Record<Region, string> = {
  north: "#0c4a6e",
  central: "#b45309",
  south: "#0f766e",
  east_sea: "#c4a35a",
};

/** Bounds hiển thị full VN + HS + TS */
export const VN_MAP_BOUNDS: [[number, number], [number, number]] = [
  [7.5, 102.0],
  [23.5, 117.5],
];

export const VN_MAP_CENTER: [number, number] = [15.9, 108.0];
