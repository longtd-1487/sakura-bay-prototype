# LAB-5 — Break task, GitHub Project và báo cáo tiến độ

| | |
|---|---|
| **Dự án** | Hệ thống hỗ trợ vận hành Chợ thủy sản Vịnh Sakura (サクラ湾水産卸売市場 取引支援システム) |
| **Mã học viên** | B121487 |
| **Đề** | Product A — sàn đấu giá thủy sản (産地市場, 相対取引 là trung tâm) |

> `README.md` ở gốc repo là README của prototype LAB-2 (giữ nguyên). File này là README của bài LAB-5.

## 1. Tổng quan

- **Nguồn break:** backlog break từ bộ spec **LAB-4 nộp ngày 03/11/2026** (37 detail design, 12 ADR, database-diagram v1.1, decision-log D-01…D-30).
- **PREMISE.md có thay đổi:** 8 chỗ sửa spec (P-1…P-8), 9 giả định bổ sung (A-12…A-20), 5 hướng đã chốt. Tất cả phát hiện trong lúc break task, xem [PREMISE.md](PREMISE.md).
- **Backlog:**
  - **14 epic**, 45 issue, 140 sub-issue (199 issue), tất cả trên GitHub Project.
  - Có epic riêng **#11 E10 完納奨励金** gồm 13 task, theo yêu cầu đề.
  - SWP do skill `tkm:estimate-swp` chấm và đã qua review của người: tổng **827 SWP ≈ 2.481 giờ**, xếp vào 14 sprint 2 tuần (09/11/2026 – 21/05/2027).
- **Sprint giả lập:** **Sprint 1** (09/11 – 20/11/2026) đã chạy giả lập. Kết quả 54/90 SWP Done, 6 issue chuyển sang Sprint 2, 6 rủi ro trễ, xem [progress-report.md](progress-report.md).

## 2. Link

| | |
|---|---|
| Repo (public) | https://github.com/longtd-1487/sakura-bay-prototype |
| GitHub Project (public) | https://github.com/users/longtd-1487/projects/1 |
| Báo cáo HTML của skill chấm SWP | [`reports/swp-estimate-sakura-bay-lab5.html`](reports/swp-estimate-sakura-bay-lab5.html) · xem trực tiếp: https://htmlpreview.github.io/?https://github.com/longtd-1487/sakura-bay-prototype/blob/main/reports/swp-estimate-sakura-bay-lab5.html |
| Kiểm tra truy cập công khai | Đã mở thử repo, Project và trang HTML bằng **cửa sổ ẩn danh** (không đăng nhập GitHub): cả ba xem được |

## 3. Cấu trúc repo

| File / thư mục | Nội dung |
|---|---|
| `README-LAB5.md` | File này |
| `PREMISE.md` | Backlog khác spec LAB-4 ở đâu: spec sửa, giả định bổ sung, hướng đã chốt |
| `task-breakdown.md` | Nguyên tắc chia task, bảng spec → issue, hạng mục ràng buộc đặc thù (完納奨励金), chỗ hở của spec LAB-4 |
| `estimate.md` | Issue mẫu skill chọn và điểm người chốt, cách quy ra giờ, tổng theo epic, so với estimate LAB-1 |
| `progress-report.md` | Báo cáo Sprint 1: trạng thái, burndown, rủi ro trễ |
| `AI-report.md` | Cách dùng AI: skill, prompt, review, điểm mạnh / yếu |
| `reports/` | Báo cáo HTML của skill chấm SWP (`swp-estimate-sakura-bay-lab5.html`) và biểu đồ burndown Sprint 1 (`sprint1-burndown.svg`) |
| `skills/` | Skill tự viết: `github-project-backlog-sync/` (tạo backlog, lập lịch sprint, ghi SWP / giờ / Iteration / Status lên Project) và `backlog-generator/` (sinh `backlog.json` + kiểm toàn vẹn) |
| `backlog/` | Dữ liệu nguồn: `backlog.json`, bảng key → số issue (`backlog-map.json`), độ phủ spec (`backlog-coverage.md`), payload SWP đã hiệu chỉnh, kế hoạch sprint, giá trị field, kịch bản giả lập Sprint 1 |
| `README.md` | README của prototype LAB-2 (URL deploy, tài khoản demo, cách chạy local) |
| `app/`, `components/`, `lib/`, `middleware.ts` | Mã nguồn prototype LAB-2 (Next.js 14) |
| `supabase/`, `scripts/` | Schema, seed, cấu hình Supabase local; script tạo tài khoản demo (LAB-2) |
| `docs/` | Tài liệu LAB-2: phạm vi và phần mock (`SCOPE.md`), checklist deploy, báo cáo AI LAB-2 |
| `package.json`, `package-lock.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next-env.d.ts`, `.env.example`, `.gitignore` | Cấu hình dự án Next.js của prototype |

## 4. Spec → epic

| Spec (LAB-4) | Epic trên Project | Ghi chú |
|---|---|---|
| decision-log § 3 (Q18–Q41), PREMISE LAB-4 § 4 (A-01…A-11) | [#1](https://github.com/longtd-1487/sakura-bay-prototype/issues/1) — E00 Làm rõ yêu cầu với khách | 2 câu về tiền (#15, #16) chặn E10 |
| architecture § 1–§ 7, ADR-001, 005, 008, 010, 011; GAP-15, 16, 17 | [#2](https://github.com/longtd-1487/sakura-bay-prototype/issues/2) — E01 Nền tảng & hạ tầng | Hàng đợi email lên Must (PREMISE P-3) |
| SC-01, 02, 04, 05; BR-09 | [#3](https://github.com/longtd-1487/sakura-bay-prototype/issues/3) — E02 Xác thực & tài khoản | Không tự đăng ký (sửa GAP-15) |
| SC-06, 07, 30; ADR-003; BR-01, 02, 07, 08, 28 | [#4](https://github.com/longtd-1487/sakura-bay-prototype/issues/4) — E03 Tư cách 許可/承認/登録 & 保証金 | **Ràng buộc đặc thù:** loại giấy phép cần xét điều kiện (許可) và loại chỉ cần chấp thuận (承認); lên Must (PREMISE P-2) |
| SC-08…12; ADR-004; business-rules § 1 | [#5](https://github.com/longtd-1487/sakura-bay-prototype/issues/5) — E04 Danh mục & 業務規程 có phiên bản | **Ràng buộc đặc thù:** quy tắc vận hành riêng của chợ, có ngày hiệu lực |
| SC-13…16; ADR-007, 010 | [#6](https://github.com/longtd-1487/sakura-bay-prototype/issues/6) — E05 Nhập hàng, 目利き, phân bổ kênh | **Ràng buộc đặc thù:** thẩm định / 符丁 do con người quyết định |
| SC-17…20; ADR-002, 006, 008; BR-03…06, 17…20 | [#7](https://github.com/longtd-1487/sakura-bay-prototype/issues/7) — E06 Giao dịch 相対 & quyền mua 2 cấp | **Ràng buộc đặc thù:** 買出人 không mua trực tiếp; xác nhận miệng |
| SC-21…24; ADR-009 | [#8](https://github.com/longtd-1487/sakura-bay-prototype/issues/8) — E07 Phiên せり | Chỉ ghi kết quả, không đấu giá điện tử |
| SC-25, 26; D-20 | [#9](https://github.com/longtd-1487/sakura-bay-prototype/issues/9) — E08 Bán trong chợ 仲卸 → 買出人 | Phiếu nhiều dòng theo D-20 (PREMISE P-8) |
| SC-27, 28, 29, 33; ADR-012; BR-21…26, 29 | [#10](https://github.com/longtd-1487/sakura-bay-prototype/issues/10) — E09 Hóa đơn, tiền về, khóa kỳ | Giả định A-13…A-15 |
| SC-32 (phần 完納), BR-24, BR-27, D-09, D-11, D-12; SC-35 E07 | [#11](https://github.com/longtd-1487/sakura-bay-prototype/issues/11) — **E10 完納奨励金** | **Ràng buộc đặc thù của đề:** tách 13 task riêng (task-breakdown § 3.1); PREMISE P-1, P-4, P-5, A-12, A-16, A-17 |
| SC-31, SC-32 (出荷奨励金); BR-30…33 | [#12](https://github.com/longtd-1487/sakura-bay-prototype/issues/12) — E11 仕切書 & 出荷奨励金 | 出荷奨励金 mặc định tắt |
| SC-03, 34, 35; ADR-011; BR-50…52 | [#13](https://github.com/longtd-1487/sakura-bay-prototype/issues/13) — E12 公表, báo cáo, dashboard | **Ràng buộc đặc thù:** nghĩa vụ công bố theo 卸売市場法 |
| SC-36, 37; BR-43; D-17, D-18 | [#14](https://github.com/longtd-1487/sakura-bay-prototype/issues/14) — E13 Audit log, cài đặt | |
