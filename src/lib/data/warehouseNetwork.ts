/**
 * Mạng lưới kho MC — nguồn PPT UNTITLED (BACKGROUND MC WH, slide 17/30)
 * + Excel Rental WH (capacity Bắc chi tiết)
 */

export type WhType = "owned" | "rented";
export type Region = "north" | "central" | "south";

export type WarehouseNode = {
  id: string;
  name: string;
  short: string;
  region: Region;
  type: WhType;
  /** % of SVG viewBox 0–100 */
  x: number;
  y: number;
  /** Capacity 100% (xe) from PPT where available */
  cap100: number;
  cap80: number;
  ratioPct: number;
  note?: string;
  city: string;
};

export const WAREHOUSES: WarehouseNode[] = [
  // NORTH — clustered around Vĩnh Phúc / Hà Nội area
  {
    id: "log1",
    name: "HVN LOG 1",
    short: "LOG1",
    region: "north",
    type: "owned",
    x: 48,
    y: 18,
    cap100: 4532,
    cap80: 3612,
    ratioPct: 7,
    city: "Vĩnh Phúc",
    note: "PTF cluster · owned",
  },
  {
    id: "log2",
    name: "HVN LOG 2",
    short: "LOG2",
    region: "north",
    type: "owned",
    x: 52,
    y: 16,
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
    x: 45,
    y: 20,
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
    x: 50,
    y: 22,
    cap100: 4000,
    cap80: 3200,
    ratioPct: 7,
    city: "Vĩnh Phúc",
    note: "Floor lớn · clear height cao nhất (PPT)",
  },
  {
    id: "log3",
    name: "HVN LOG 3",
    short: "LOG3",
    region: "north",
    type: "owned",
    x: 54,
    y: 20,
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
    x: 56,
    y: 15,
    cap100: 3000,
    cap80: 2400,
    ratioPct: 5,
    city: "Hà Nội / NKV",
    note: "Excel: thuê 5000m² nhưng ~1100 xe",
  },
  {
    id: "nbf",
    name: "NBF WH",
    short: "NBF",
    region: "north",
    type: "rented",
    x: 42,
    y: 17,
    cap100: 7021,
    cap80: 5634,
    ratioPct: 12,
    city: "Miền Bắc",
    note: "Kho thuê · mid-term expand",
  },
  // CENTRAL
  {
    id: "nghe-an",
    name: "Nghệ An WH",
    short: "N.An",
    region: "central",
    type: "rented",
    x: 48,
    y: 42,
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
    x: 58,
    y: 52,
    cap100: 5500,
    cap80: 4400,
    ratioPct: 9,
    city: "Đà Nẵng",
  },
  // SOUTH
  {
    id: "dong-nai",
    name: "Đồng Nai WH",
    short: "ĐNai",
    region: "south",
    type: "rented",
    x: 55,
    y: 78,
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
    x: 48,
    y: 82,
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
    x: 42,
    y: 88,
    cap100: 2500,
    cap80: 2000,
    ratioPct: 4,
    city: "Cần Thơ / Cái Cui",
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

/** Tuyến vận tải chính N→S (To South&Sum) */
export type TransportLane = {
  id: string;
  fromId: string;
  toId: string;
  mode: "sea" | "truck";
  label: string;
};

export const LANES: TransportLane[] = [
  { id: "vp-la-sea", fromId: "log1", toId: "long-an", mode: "sea", label: "Vĩnh Phúc → Long An (Sea)" },
  { id: "vp-dn-sea", fromId: "log1", toId: "dong-nai", mode: "sea", label: "Vĩnh Phúc → Đồng Nai (Sea)" },
  { id: "vp-cc-sea", fromId: "log1", toId: "cai-cui", mode: "sea", label: "Vĩnh Phúc → Cái Cui (Sea)" },
  { id: "vp-la-trk", fromId: "cbu", toId: "long-an", mode: "truck", label: "Bắc → Long An (Truck)" },
  { id: "vp-dn-trk", fromId: "cbu", toId: "dong-nai", mode: "truck", label: "Bắc → Đồng Nai (Truck)" },
];

export const REGION_LABEL: Record<Region, string> = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

export const REGION_COLOR: Record<Region, string> = {
  north: "#2563eb",
  central: "#d97706",
  south: "#059669",
};
