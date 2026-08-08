# Multi-Agent Git Workflow

คู่มือใช้งาน Git เมื่อมี coding agent หลายตัวทำงานพร้อมกันใน repository เดียว

## กฎหลัก

> หนึ่ง Agent = หนึ่ง task + หนึ่ง branch + หนึ่ง worktree + หนึ่งขอบเขตไฟล์

ห้ามเปิดหลาย Agent ใน working directory เดียวกัน เพราะ Agent จะใช้ไฟล์, staging area และ `HEAD` ร่วมกัน ซึ่งทำให้ stage หรือ commit งานผิดชุดได้

## โครงสร้างที่แนะนำ

```text
repo/                    main worktree — ใช้สำหรับ integration
../repo-agent-auth/      agent/auth — Auth Agent
../repo-agent-ui/        agent/ui — UI Agent
../repo-agent-tests/     agent/tests — Test Agent
```

ทุก worktree ใช้ Git object database และประวัติร่วมกัน แต่มี working directory และ index แยกจากกัน

## 1. เตรียม branch และ worktree

รันจาก repository หลัก:

```bash
git fetch origin
git worktree add ../repo-agent-auth -b agent/auth origin/main
git worktree add ../repo-agent-ui -b agent/ui origin/main
git worktree add ../repo-agent-tests -b agent/tests origin/main
git worktree list
```

ชื่อ branch ควรอ่านแล้วรู้ owner และ scope เช่น:

- `agent/auth`
- `agent/ui-checkout`
- `agent/e2e-tests`
- `agent/docs-deployment`

Branch เดียวกัน checkout ในหลาย worktree พร้อมกันไม่ได้

## 2. แจกงานก่อนเริ่ม

ทุก task ควรระบุข้อมูลต่อไปนี้:

```text
AGENT: auth
BRANCH: agent/auth
WORKTREE: ../repo-agent-auth
OBJECTIVE: เพิ่ม login ด้วย email/password
SCOPE: src/auth/**, tests/auth/**
DO NOT TOUCH: src/components/**, package-lock.json
BASE: origin/main @ <commit>
VERIFY: npm test -- auth && npm run typecheck
DEPENDENCIES: UI Agent จะใช้ AuthResult type
```

### Shared hotspots

ไฟล์กลุ่มนี้ควรมี owner เพียงตัวเดียวต่อ batch:

| ประเภท | ตัวอย่าง | วิธีจัดการ |
|---|---|---|
| Dependency lockfile | `package-lock.json`, `pnpm-lock.yaml` | ให้ Integrator ติดตั้ง dependency และ commit lockfile |
| Migration | `migrations/*` | จองเลขหรือลำดับก่อนสร้าง |
| Generated files | client SDK, schema types | รวม source ก่อน แล้วให้ Integrator รัน generator |
| Shared config | CI, lint, build config | มอบหมาย owner ชัดเจน |
| Public types/API | interfaces, route contracts | ตกลง contract ก่อนให้ Agent อื่นเริ่มใช้ |

## 3. วงจรทำงานของ Agent

Agent แต่ละตัวทำงานใน worktree ของตัวเอง:

```bash
cd ../repo-agent-auth
git status

# แก้ไขและทดสอบ
git diff
git add src/auth tests/auth
git diff --staged
git commit -m "feat(auth): add email login"
git push -u origin agent/auth
```

แนวทาง commit:

- หนึ่ง commit มีหนึ่งเหตุผล
- หลีกเลี่ยง `git add .` ถ้ามีไฟล์นอก scope
- ห้ามแก้ประวัติของ branch ที่มี Agent อื่นใช้งาน
- ห้ามใช้ `git reset --hard` เพื่อแก้ปัญหาไฟล์ของ Agent อื่น
- ก่อน handoff ต้องให้ `git status` สะอาด

## 4. Sync กับ main

ก่อนส่งงาน ให้ Agent อัปเดต branch ตัวเอง:

```bash
git fetch origin
git rebase origin/main

# ถ้ามี conflict ให้แก้และทดสอบใหม่
git add <resolved-files>
git rebase --continue

# ใช้เฉพาะ branch ของ Agent ตัวเอง
git push --force-with-lease
```

ห้าม force push `main`, integration branch หรือ branch ที่มีหลายคนใช้งาน

ถ้าทีมไม่ต้องการ rewrite commit ให้ใช้ merge แทน:

```bash
git fetch origin
git merge origin/main
git push
```

เลือกแนวทางเดียวให้ทั้งทีมเพื่อลดความสับสน

## 5. Handoff contract

Agent ส่งข้อมูลนี้ให้ Integrator ทุกครั้ง:

```text
AGENT: auth
BRANCH: agent/auth
BASE: origin/main @ a1b2c3d
SCOPE: src/auth/**, tests/auth/**
COMMITS: 9f3ae81, 2a85c16
FILES: 8 changed
TESTS: npm test -- auth — passed
TYPECHECK: npm run typecheck — passed
RISKS: session migration requires existing users to sign in again
NEEDS: UI Agent must consume the new AuthResult type
UNRESOLVED: none
```

คำว่า “เสร็จ” หมายถึง:

- Objective ครบ
- ไม่มีการแก้ไฟล์นอก scope โดยไม่แจ้ง
- Test ที่เกี่ยวข้องผ่าน
- ไม่มี secret หรือไฟล์ชั่วคราวใน commit
- Worktree สะอาด
- ส่ง commit hash และความเสี่ยงครบ

## 6. Integration workflow

ควรมี Integrator เพียงหนึ่งตัวต่อ integration batch

```bash
git switch main
git pull --ff-only origin main

# ตรวจ branch แรก
git log --oneline origin/main..agent/auth
git diff --stat origin/main...agent/auth
git diff origin/main...agent/auth

# รวมและทดสอบ
git merge --no-ff agent/auth
npm test

# รับ branch ต่อไปทีละชุด
git merge --no-ff agent/ui
npm test

git push origin main
```

ถ้าใช้ Pull Request ให้ทำลำดับเดียวกัน: review → CI → merge หนึ่ง PR → ให้ branch ที่เหลืออัปเดตจาก `main` → รับ PR ถัดไป

อย่า merge หลาย branch พร้อมกันแล้วค่อยทดสอบ เพราะจะหาต้นเหตุของ regression ยาก

## 7. Conflict protocol

เมื่อเกิด conflict:

1. หยุด merge/rebase และระบุว่าไฟล์นั้นอยู่ใน ownership ของใคร
2. ให้ owner ของ domain อธิบาย behavior ที่ต้องรักษา
3. Integrator เป็นผู้ตัดสินรูปสุดท้ายของ shared hotspot
4. รันทดสอบทั้งสอง scope ไม่ใช่เฉพาะ scope ของ branch ที่กำลัง merge
5. บันทึกการตัดสินใจใน PR หรือ handoff

ยกเลิกได้ด้วย:

```bash
git merge --abort
# หรือ
git rebase --abort
```

## 8. เก็บกวาดหลัง merge

ตรวจว่า worktree สะอาดและ branch ถูก merge แล้ว:

```bash
git -C ../repo-agent-auth status
git branch --merged main
```

จากนั้น:

```bash
git worktree remove ../repo-agent-auth
git branch -d agent/auth
git push origin --delete agent/auth
git worktree prune
```

อย่าใช้ `--force` ตอนลบ worktree ถ้ายังไม่ได้ตรวจว่ามีไฟล์ที่ไม่ commit หรือไม่

## Checklist สำหรับ Integrator

- [ ] ทุก Agent มี branch และ worktree แยกกัน
- [ ] ทุก task มี scope และ do-not-touch list
- [ ] Shared hotspots มี owner
- [ ] Handoff ระบุ base commit, commit hash, tests และ risks
- [ ] Review diff จริง ไม่รับเฉพาะ summary จาก Agent
- [ ] Merge ทีละ branch และ test ทุกครั้ง
- [ ] แจ้ง Agent ที่เหลือให้ rebase/merge main ล่าสุด
- [ ] ลบ worktree หลังยืนยันว่า merge และ clean แล้ว
