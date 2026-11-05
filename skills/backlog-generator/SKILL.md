---
name: backlog-generator
description: Sinh backlog.json (14 epic → 52 issue → 133 sub-issue) và backlog-coverage.md từ dữ liệu break task viết tay theo spec LAB-4; tự kiểm tra khóa cha, phụ thuộc, vòng lặp, phase và độ phủ SC / ADR / GAP.
---

# backlog-generator

Dữ liệu break task được viết dưới dạng module JavaScript theo nhóm epic (`data-e00-e04.mjs`, `data-e05-e08.mjs`, `data-e09-e13.mjs`). Agent soạn từ mục "Ghi chú cho LAB-5" của 37 detail design, người review chỉnh sau đó.

```bash
node build-backlog-json-and-coverage.mjs   # ghi backlog.json + backlog-coverage.md, dừng nếu kiểm tra toàn vẹn lỗi
```

Các kiểm tra tự động:
- mọi `parent` / `depends_on` đều tồn tại;
- không có vòng phụ thuộc;
- không task nào xếp phase sớm hơn task nó phụ thuộc;
- mọi mã SC-01…37, ADR-001…012, GAP-01…22 đều có ít nhất một issue.

`coverage-notes-deferred-and-gaps.md` ghi phần spec không thành issue và các mâu thuẫn spec phát hiện khi break (đầu vào cho `task-breakdown.md` § 4).
