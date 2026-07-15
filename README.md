# LOG Twin — DSS Kho miền Bắc Honda MC

Hệ thống hỗ trợ quyết định (Digital Twin) cho tối ưu **stacking**, **chuyển Bắc–Nam** và **thuê ngoài** kho xe máy Honda Việt Nam mùa cao điểm.

Repo: https://github.com/Bachhhhhhhhhhhhhh/btvnhonda

## Nguồn dữ liệu

| Tài liệu | Vai trò |
|----------|---------|
| `Bài toán tối ưu log packing miền Bắc.docx` | Logic tối ưu, bảng tháng, playbook |
| `MC DOM_BUDGET 103Ki 2QFC_update Jun.xlsx` | Volume, capacity, rental, cước vận tải |
| `UNTITLED.pptx` | Quy trình stacking & network capacity |

## Stack

- **Frontend:** Next.js · React · TypeScript · Tailwind CSS · Recharts · Zustand  
- **Engine:** Digital Twin client-side + **FastAPI** (`backend/`)  
- **Deploy:** Docker Compose  

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000

### API FastAPI (tuỳ chọn)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Docker

```bash
docker compose up --build
```

## Modules

| Route | Nội dung |
|-------|----------|
| `/` | Bảng điều hành |
| `/digital-twin` | **Mô phỏng tham số realtime** |
| `/overview` | Tổng quan dự án |
| `/warehouse` | Năng lực kho |
| `/vehicle` | Mật độ xe |
| `/import` | Tối ưu nhập khẩu |
| `/domestic` | Tối ưu nội địa |
| `/container` | Container & case pool |
| `/transport` | Vận tải N↔S |
| `/financial` | ROI, NPV, payback |
| `/scenarios` | So sánh kịch bản |
| `/sensitivity` | Độ nhạy |
| `/monte-carlo` | Monte Carlo |
| `/risk` | Rủi ro |
| `/recommendations` | Khuyến nghị |
| `/report` | Báo cáo tư vấn |
| `/data` | Dữ liệu & nguồn |
| `/admin` | Quản trị / Audit |

## Công thức lõi

```
Import relief = Import × (unpackM2 − stackM2) / unpackM2
N→S containers = Transfer / (casesPerCont × mcPerCase)
Return containers = Cases / 80
Case pool = Cases / 30 × (lead + free)
Transfer nếu Avoided North cost > Total transfer cost
```
