# Git Field Guide

คู่มือ Git ภาษาไทยแบบละเอียด ตั้งแต่การติดตั้ง, `status → add → commit`, branch และ merge, remote / Pull Request, การแก้ conflict, การกู้คืนเมื่อเผลอแก้พลาด, workflow สำหรับหลาย coding agent และ Git convention ที่เชื่อมกับ Jira

## เปิดใช้งาน

เปิดไฟล์ [index.html](./index.html) ในเบราว์เซอร์ได้เลย หรือรัน static server:

```bash
python3 -m http.server 8000
```

แล้วเปิด <http://localhost:8000>

## สิ่งที่มีในคู่มือ

- สารบัญแบบ sticky และ reading progress
- ปุ่มคัดลอกคำสั่ง Git
- โหมดกลางคืนและ responsive layout
- ภาพประกอบ SVG ใน `assets/`
- เนื้อหา 10 บท พร้อมตัวอย่างคำสั่งที่ใช้จริง
- บท Multi-Agent ครอบคลุม `git worktree`, ownership, handoff และ integration
- Companion guide: [MULTI_AGENT_WORKFLOW.md](./MULTI_AGENT_WORKFLOW.md)
- บท Git × Jira ครอบคลุม branch, commit, PR, status mapping และ Smart Commits
- Companion guide: [JIRA_GIT_WORKFLOW.md](./JIRA_GIT_WORKFLOW.md)
