# Team Git Workflow

Playbook สำหรับทีมที่มีนักพัฒนาหลายคนทำงานใน repository เดียวกัน ตั้งแต่เริ่ม branch, ส่ง Pull Request, review, merge, แก้ conflict ไปจนถึง hotfix

## Core idea

> ทีมไม่จำเป็นต้องแชร์ working branch แต่ต้องแชร์ convention, quality gate และ Definition of Done

ค่าเริ่มต้นที่แนะนำ:

- `main` พร้อม release และห้าม push ตรง
- หนึ่ง objective ต่อหนึ่ง branch
- หนึ่ง branch มี owner ชัดเจน
- ทุกการเปลี่ยนเข้า `main` ผ่าน Pull Request
- CI และ review ผ่านก่อน merge
- ทีมเลือก merge strategy กลาง
- merge แล้วลบ branch และ sync `main`

## 1. Team Git Contract

คัดลอกส่วนนี้ไปปรับใช้กับทีม:

```text
DEFAULT BRANCH: main
DIRECT PUSH TO MAIN: prohibited
BRANCH FORMAT: <type>/<ticket-or-topic>
BRANCH OWNER: one person by default
UPDATE OWN BRANCH: rebase origin/main
UPDATE SHARED BRANCH: merge origin/main
MERGE STRATEGY: squash
REQUIRED CHECKS: tests, lint, typecheck
REQUIRED REVIEW: 1 approval
REQUIRED BEFORE MERGE: all blocking comments resolved
FORCE PUSH: own branch only, --force-with-lease
DELETE BRANCH AFTER MERGE: yes
HOTFIX OWNER: on-call or assigned maintainer
```

สิ่งที่ทีมต้องตอบให้ตรงกัน:

1. `main` หมายถึง production, staging หรือ integration?
2. ใคร merge ได้?
3. CI jobs ใดเป็น required?
4. Review กี่คน และกรณีใดต้องให้ domain owner review?
5. ใช้ squash, merge commit หรือ rebase merge?
6. เมื่อไร ticket/PR ถือว่า Done?
7. Shared files เช่น lockfile, schema และ migrations มี owner อย่างไร?
8. Hotfix bypass ขั้นตอนไหนได้บ้าง และใครอนุมัติ?

## 2. Branch lifecycle

### เริ่มงาน

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/PAY-142-card-payment
```

ถ้าไม่มี Jira/ticket:

```text
feature/card-payment
bugfix/gateway-timeout
chore/upgrade-eslint
docs/payment-runbook
```

ถ้ามี Jira ให้ใช้ key ตาม [JIRA_GIT_WORKFLOW.md](./JIRA_GIT_WORKFLOW.md):

```text
feature/PAY-142-card-payment
bugfix/PAY-203-gateway-timeout
```

### ทำงานและ commit

```bash
git status
git diff
git add src/payment tests/payment
git diff --staged
git commit -m "feat(payment): PAY-142 validate card"
```

Commit ที่ดี:

- มีหนึ่งเหตุผล
- ไม่รวม formatting หรือ refactor ที่ไม่เกี่ยวข้อง
- อ่าน message แล้วรู้ผลของการเปลี่ยน
- build/test ได้เมื่อทีมต้อง bisect หรือ revert
- ไม่มี secret, debug output หรือไฟล์ชั่วคราว

### Push และเปิด Draft PR เร็ว

```bash
git push -u origin feature/PAY-142-card-payment
```

Draft PR ช่วยให้ทีมเห็น scope, dependency และ conflict ที่กำลังมา โดยยังไม่ถือว่าพร้อม review

### ก่อน Ready for Review

```bash
git fetch origin
git rebase origin/main
npm test
npm run lint
npm run typecheck
git push --force-with-lease
```

ใช้ rebase และ `--force-with-lease` เฉพาะ branch ที่มี owner คนเดียวและทีมอนุญาต

## 3. Roles

### Author

- ทำ PR ให้เล็กและมี objective เดียว
- อธิบาย why, what, verification, risk และ rollback
- ระบุจุดที่ต้องการให้ reviewer โฟกัส
- ตอบทุก comment และไม่ resolve comment แทน reviewer เมื่อยังไม่ตกลง
- อัปเดต branch เมื่อ merge order เปลี่ยน
- ไม่ merge ก่อน required checks ครบ

### Reviewer

- อ่าน requirement และ PR description ก่อน diff
- ตรวจ correctness, edge cases, compatibility, security และ maintainability
- แยก blocking จาก suggestion/question/nit
- ให้เหตุผลและเสนอทิศทาง ไม่โยนคำสั่งกว้าง ๆ
- ตรวจ test ว่าพิสูจน์ behavior ไม่ใช่แค่เพิ่ม coverage
- approve เมื่อพร้อม mergeจริง ไม่ใช่เพื่อหยุด notification

### Maintainer / Integrator

- ดู branch policy และ merge queue
- เลือก merge order เมื่อ PR มี dependency
- ตัดสิน conflict ข้าม domain
- ดู compatibility, migration และ release impact
- รักษา `main` ให้ build ผ่าน
- ประสาน revert/hotfix เมื่อ production มีปัญหา

## 4. Pull Request contract

Template:

```markdown
## Objective / Why

ปัญหาที่แก้และผลลัพธ์ที่ผู้ใช้หรือระบบควรได้รับ

## Scope / What changed

- สิ่งที่เปลี่ยน
- สิ่งที่ตั้งใจไม่เปลี่ยน

## Verification

- `npm test -- payment`
- `npm run typecheck`
- Manual scenario / screenshot / log

## Risk

- compatibility
- migration/data
- security/privacy
- performance

## Rollout / rollback

- feature flag / migration order / deploy sequence
- วิธี revert หรือปิด feature

## Review map

- เริ่มที่ไฟล์ใด
- ส่วนใดเป็น design decision
- ส่วนใดต้องการ domain review
```

ก่อนเปิด Ready for Review:

- [ ] PR มี objective เดียว
- [ ] Diff ไม่มีไฟล์นอก scope
- [ ] ชื่อ PR และ commit อ่านรู้เรื่อง
- [ ] Test/lint/typecheck ผ่าน
- [ ] มี test สำหรับ failure path
- [ ] Migration และ backward compatibility ถูกพิจารณา
- [ ] Risk และ rollback ชัดเจน
- [ ] ไม่มี secret หรือข้อมูลอ่อนไหว
- [ ] Reviewer รู้ว่าควรเริ่มดูตรงไหน

## 5. Review language

ใช้ prefix เพื่อลดความคลุมเครือ:

```text
[blocking] กรณี timeout นี้อาจสร้างคำสั่งซื้อซ้ำ ต้องมี idempotency guard ก่อน merge

[suggestion] แยก gateway adapter ออกมาจะ test failure path ง่ายขึ้น คุณเห็น tradeoff อะไรไหม?

[question] ค่า retry count มาจาก requirement ใด และควรเป็น config หรือไม่?

[nit] ชื่อนี้อาจอ่านเป็น boolean ได้ชัดขึ้น แต่ไม่ขวาง merge
```

แนวทาง:

- พูดถึง code/behavior ไม่ตัดสินคน
- อ้าง requirement, test หรือ convention
- อย่าใช้ “ทำไมไม่...” เมื่อถาม “เหตุผลของ...” ได้
- ถ้ามีความเห็นวนเกินสองรอบ ให้คุย synchronous แล้วสรุปกลับใน PR
- เรื่องที่ไม่อยู่ใน scope ให้เปิด follow-up ticket แทนการขยาย PR

## 6. Sync policy

### Branch ที่มี owner คนเดียว

ใช้ rebase ได้เมื่อทีมตกลง:

```bash
git fetch origin
git rebase origin/main

# แก้ conflict
git add <resolved-files>
git rebase --continue

git push --force-with-lease
```

`--force-with-lease` ปฏิเสธการ push หาก remote branch มี commit ใหม่ที่เราไม่มี จึงปลอดภัยกว่า `--force`

### Shared branch

ห้าม rewrite history โดยไม่ตกลง ใช้ merge:

```bash
git fetch origin
git switch shared/payment-integration
git pull --ff-only origin shared/payment-integration
git merge origin/main
git push origin shared/payment-integration
```

ก่อน push shared branch:

1. แจ้งคู่ทำงาน
2. pull branch ล่าสุด
3. merge/commit ให้จบ
4. test
5. push
6. แจ้ง commit hash ที่ส่งขึ้น

## 7. Merge strategies

### Squash merge

เหมาะเมื่อ:

- ต้องการ `1 PR = 1 commit`
- commit ระหว่างทำงานมีลักษณะ draft/fixup
- ต้องการ revert ทั้ง PR ง่าย

ข้อแลกเปลี่ยน: รายละเอียด commit ย่อยหายจาก `main`

ตัวอย่าง squash commit:

```text
feat(payment): PAY-142 add card payment (#381)
```

### Merge commit

เหมาะเมื่อ:

- ต้องการรักษา topology ของ branch
- commit ย่อยมีคุณค่าและผ่าน review
- feature มีหลายชิ้นที่ต้องดูแยกย้อนหลัง

```bash
git merge --no-ff feature/PAY-142-card-payment
```

ข้อแลกเปลี่ยน: graph ซับซ้อนและมี merge commits มากขึ้น

### Rebase merge

เหมาะเมื่อ:

- ต้องการ linear history
- ทุก commit บน PR พร้อมอยู่บน `main`
- ทีมดูแล commit quality อย่างเข้มงวด

ข้อแลกเปลี่ยน: ไม่มี merge commit บอกขอบเขต PR ใน graph

ทีมควรเลือก default หนึ่งแบบ และระบุข้อยกเว้น ไม่เปลี่ยนตามความชอบของแต่ละ PR

## 8. Conflict prevention

ป้องกันก่อนแก้:

- ประกาศ scope และ shared files ใน ticket/PR
- แยก foundation PR ให้ merge ก่อน feature PR
- ให้ lockfile, migration และ generated files มี owner
- Sync `main` เป็นระยะ โดยเฉพาะก่อน Ready for Review
- หลีกเลี่ยง rename/format ทั้งไฟล์พร้อมกับแก้ behavior
- ใช้ feature flag เพื่อ merge งานบางส่วนโดยไม่เปิดให้ผู้ใช้

เมื่อ conflict เกิด:

1. หยุดและระบุ ownership ของไฟล์
2. เข้าใจ intent ทั้งสองฝั่งก่อนเลือกโค้ด
3. ให้ domain owner ตัดสิน behavior
4. แก้ conflict และรันทดสอบของทั้งสอง scope
5. review diff หลัง resolution อีกครั้ง

```bash
git status
git diff --name-only --diff-filter=U

# หลังแก้ไฟล์
git add <resolved-files>
git rebase --continue
# หรือ git commit เมื่อกำลัง merge
```

ยกเลิก:

```bash
git rebase --abort
# หรือ
git merge --abort
```

## 9. Dependent Pull Requests

ถ้า PR B ต้องใช้ PR A:

1. เปิด PR A ไป `main`
2. สร้าง branch B จาก branch A
3. ระบุ dependency ใน PR B
4. merge PR A ก่อน
5. rebase PR B บน `main`
6. ตรวจ diff ของ PR B ว่าเหลือเฉพาะ scope ของ B

```bash
# หลัง PR A merge
git fetch origin
git switch feature/PAY-151-checkout
git rebase --onto origin/main feature/PAY-142-card-payment
git push --force-with-lease
```

ใช้คำสั่ง `rebase --onto` เฉพาะเมื่อเข้าใจ commit range ตรวจด้วย `git log --graph --oneline --all` ก่อนเสมอ

## 10. Hotfix workflow

1. สร้าง hotfix จาก commit ที่ production ใช้อยู่
2. ทำ minimal fix
3. เพิ่ม regression test
4. เปิด urgent PR พร้อม incident/ticket
5. ให้ reviewer และ required CI ตรวจ
6. deploy และ verify production
7. merge/backport ไปทุก active branch
8. เขียน post-incident follow-up หากจำเป็น

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/INC-77-restore-login

# fix + test
git add src/auth tests/auth
git commit -m "fix(auth): INC-77 restore login fallback"
git push -u origin hotfix/INC-77-restore-login
```

Emergency ไม่ได้แปลว่าข้ามประวัติและการตรวจสอบทั้งหมด แต่ลด scope และใช้เส้นทางอนุมัติที่ทีมตกลงไว้ล่วงหน้า

## 11. After merge

```bash
git switch main
git pull --ff-only origin main
git branch -d feature/PAY-142-card-payment
git fetch --prune origin
```

ตรวจ branch ที่ merge แล้ว:

```bash
git branch --merged main
```

ลบ remote branch เมื่อมั่นใจว่าไม่ต้องใช้:

```bash
git push origin --delete feature/PAY-142-card-payment
```

## Team checklist

- [ ] `main` มี branch protection และห้าม push ตรง
- [ ] Branch naming และ commit convention ชัดเจน
- [ ] Own/shared branch ใช้ sync policy คนละแบบ
- [ ] PR template ครอบคลุม objective, verification, risk และ rollback
- [ ] Review ใช้ blocking/suggestion/question/nit
- [ ] Required CI และจำนวน approval ถูกกำหนด
- [ ] Merge strategy มี default เดียว
- [ ] Shared hotspots มี owner
- [ ] Hotfix workflow ถูกซ้อมและรู้ว่าใครอนุมัติ
- [ ] Merge แล้วลบ branch และ sync `main`
