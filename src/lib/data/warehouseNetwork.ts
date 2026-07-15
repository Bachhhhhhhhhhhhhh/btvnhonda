/**
 * Mạng lưới kho MC — PPT BACKGROUND MC WH + Excel Rental WH
 * Bản đồ: đất liền Việt Nam + Hoàng Sa + Trường Sa
 */

export type WhType = "owned" | "rented" | "sovereignty";
export type Region = "north" | "central" | "south" | "east_sea";

export type WarehouseNode = {
  id: string;
  name: string;
  short: string;
  region: Region;
  type: WhType;
  x: number;
  y: number;
  cap100: number;
  cap80: number;
  ratioPct: number;
  note?: string;
  city: string;
};

export const WAREHOUSES: WarehouseNode[] = [
  {
    id: "log1",
    name: "HVN LOG 1",
    short: "LOG1",
    region: "north",
    type: "owned",
    x: 36,
    y: 16,
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
    x: 40,
    y: 14,
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
    x: 33,
    y: 18,
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
    x: 38,
    y: 20,
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
    x: 42,
    y: 18,
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
    x: 44,
    y: 13,
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
    x: 30,
    y: 15,
    cap100: 7021,
    cap80: 5634,
    ratioPct: 12,
    city: "Miền Bắc",
    note: "Kho thuê · mid-term expand",
  },
  {
    id: "nghe-an",
    name: "Nghệ An WH",
    short: "N.An",
    region: "central",
    type: "rented",
    x: 36,
    y: 38,
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
    x: 44,
    y: 48,
    cap100: 5500,
    cap80: 4400,
    ratioPct: 9,
    city: "Đà Nẵng",
  },
  {
    id: "dong-nai",
    name: "Đồng Nai WH",
    short: "ĐNai",
    region: "south",
    type: "rented",
    x: 42,
    y: 74,
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
    x: 36,
    y: 78,
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
    x: 30,
    y: 84,
    cap100: 2500,
    cap80: 2000,
    ratioPct: 4,
    city: "Cần Thơ / Cái Cui",
  },
  {
    id: "hoang-sa",
    name: "Quần đảo Hoàng Sa",
    short: "HS",
    region: "east_sea",
    type: "sovereignty",
    x: 72,
    y: 36,
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
    x: 68,
    y: 68,
    cap100: 0,
    cap80: 0,
    ratioPct: 0,
    city: "Biển Đông · Việt Nam",
    note: "Lãnh thổ Việt Nam — Quần đảo Trường Sa",
  },
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
