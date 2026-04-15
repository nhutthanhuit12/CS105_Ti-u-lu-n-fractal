# 🌀 CS105 - Tiểu luận Fractal Visualization 

> **Đồ họa máy tính (CS105)** — Trường Đại học Công nghệ Thông tin, ĐHQG TP.HCM  
> Khoa Khoa học Máy tính
---

## 📋 Mục lục
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn chạy dự án](#hướng-dẫn-chạy)
- [Thông tin sinh viên](#thông-tin-sinh-viên)

---
## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | HTML5, CSS3, JavaScript (ES6) |
| Đồ họa | **WebGL 1.0** (OpenGL ES 2.0 trên trình duyệt) |
| Shader | GLSL (Vertex Shader + Fragment Shader) |
| Giao diện | Vanilla CSS — Responsive layout |
---

## Cấu trúc dự án

```
23521451_Lab03/
├── index.html          # Trang chủ — điều hướng đến các fractal
├── style.css           # Stylesheet chung cho toàn bộ dự án
├── webgl_utils.js      # Hàm tiện ích WebGL (tạo shader, resize canvas, ...)
│
├── koch.html           # Giao diện Koch Snowflake
├── koch.js             # Logic & thuật toán Koch
│
├── minkowski.html      # Giao diện Minkowski Island
├── minkowski.js        # Logic & thuật toán Minkowski
│
├── sierpinski.html     # Giao diện Sierpinski (3 thuật toán)
├── sierpinski.js       # Logic & thuật toán Sierpinski
│
├── mandelbrot.html     # Giao diện Mandelbrot & Julia Set
├── mandelbrot.js       # Logic & Fragment Shader Mandelbrot/Julia
│
└── README.md           # File này
```

---

## Hướng dẫn chạy

### Yêu cầu
- Trình duyệt web hiện đại hỗ trợ **WebGL** (Chrome, Firefox, Edge, Safari).

### Cách 1: Mở trực tiếp (đơn giản nhất)

1. Tải hoặc clone repository:
   ```bash
   git clone https://github.com/nhutthanhuit12/CS105_Ti-u-lu-n-fractal.git
   ```
2. Mở file `index.html` bằng trình duyệt (nhấp đúp hoặc kéo thả vào trình duyệt).

### Cách 2: Dùng Live Server (khuyến nghị)

Sử dụng extension **Live Server** trên VS Code để có trải nghiệm tốt hơn (auto-reload khi chỉnh sửa):

1. Cài extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) trên VS Code.
2. Mở thư mục dự án trong VS Code.
3. Nhấp chuột phải vào `index.html` → chọn **"Open with Live Server"**.
4. Trình duyệt sẽ tự mở tại `http://127.0.0.1:5500`.
---

## Thông tin nhóm

| Thông tin | Chi tiết |
|---|---|
| **MSSV** | 23521451 Nguyễn Nhựt Thành - 23521592 Đỗ Lê Duy Tín|
| **Môn học** | CS105 — Đồ họa máy tính |
| **Trường** | Đại học Công nghệ Thông tin — ĐHQG TP.HCM |
| **Khoa** | Khoa học Máy tính |
