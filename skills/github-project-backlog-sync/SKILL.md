---
name: github-project-backlog-sync
description: Đẩy backlog epic → issue → sub-issue từ một file JSON lên GitHub Issues + Project v2 (quan hệ sub-issue gốc, field Cấp / Ưu tiên / Ràng buộc / Phụ trách / Status), quy SWP đã review ra giờ, xếp sprint theo năng lực, và ghi SWP / giờ / Iteration / Status lên Project. Dùng sau bước break task và sau skill tkm:estimate-swp.
---

# github-project-backlog-sync

Skill tự viết cho LAB-5. Skill `tkm:estimate-swp` **chỉ đọc**, không ghi gì lên tracker, nên cần bộ script riêng để tạo backlog và ghi điểm đã review lên Project.

## Thành phần

| File | Việc |
|---|---|
| `lib-github-api.mjs` | Client REST + GraphQL tối thiểu; token lấy từ `gh auth token`, chỉ giữ trong bộ nhớ; tự chờ khi gặp giới hạn tốc độ |
| `create-backlog.mjs` | Tạo issue theo thứ tự epic → issue → sub-issue, gắn sub-issue gốc, thêm vào Project, set field. **Chạy lại không tạo trùng**: dòng `Backlog key` cuối body + file map + quét issue có sẵn khi khởi động |
| `plan-sprints.mjs` | `Giờ = SWP × 3`; xếp sub-issue vào sprint theo phase → phụ thuộc → nhóm vai trò (BE / FE / QA / PM, 60 giờ / người / sprint) |
| `set-project-fields.mjs` | Ghi giá trị field theo danh sách `{key, fields}`; có `--dry-run` kiểm tên field, option, iteration **trước** khi ghi |

## Cách chạy

```bash
node create-backlog.mjs <owner/repo> <projectNo> backlog/backlog.json backlog/backlog-map.json
# chạy tkm:estimate-swp trên Project → lưu payload đã hiệu chỉnh vào backlog/swp-calibrated-payload.json
node plan-sprints.mjs backlog/backlog.json backlog/backlog-map.json backlog/swp-calibrated-payload.json backlog/sprint-plan.json
node set-project-fields.mjs <owner> <projectNo> backlog/backlog-map.json backlog/project-field-values.json --dry-run
node set-project-fields.mjs <owner> <projectNo> backlog/backlog-map.json backlog/project-field-values.json
```

## Bài học khi viết (đã sửa trong code)

- Gắn sub-issue vào cha thì GitHub **tự thêm sub-issue vào Project của cha**. Lệnh thêm lần nữa báo "already exists", nên script lấy item có sẵn thay vì dừng.
- Không thay mã dạng `E##` trong body: mã phần tử màn hình (SC-32 E11) trùng dạng với mã epic. Chỉ thay `T-…` / `I-…`.
