# Jira Git Workflow

Convention สำหรับเชื่อม Jira work item กับ Git branch, commits, Pull Request และ deployment ให้ตรวจสอบย้อนหลังได้

เอกสารอ้างอิงอย่างเป็นทางการ:

- [Reference work items in your development work](https://support.atlassian.com/jira-software-cloud/docs/reference-issues-in-your-development-work/)
- [View development information for a work item](https://support.atlassian.com/jira-software-cloud/docs/view-development-information-for-an-issue/)
- [Use Smart Commits](https://support.atlassian.com/bitbucket-cloud/docs/use-smart-commits/)

## Core rule

> หนึ่ง Jira ticket = หนึ่ง branch = หนึ่ง Pull Request = หนึ่ง traceable delivery unit

ใช้ Jira key ตัวพิมพ์ใหญ่ เช่น `PAY-142` ในทุกจุด:

```text
Ticket:   PAY-142
Branch:   feature/PAY-142-card-payment
Commit:   feat(payment): PAY-142 validate card details
PR title: PAY-142: Add card payment
```

Jira ต้องถูกเชื่อมกับ GitHub, Bitbucket, GitLab หรือ development tool ที่รองรับก่อน จึงจะแสดงข้อมูลใน Development panel

## 1. Ticket readiness

ก่อนสร้าง branch ต้องมี:

- Objective ที่อธิบายผลลัพธ์ ไม่ใช่รายการไฟล์ที่จะเปลี่ยน
- Acceptance criteria ที่ทดสอบได้
- Scope และสิ่งที่ห้ามแตะ
- Owner
- Dependency กับ ticket อื่น
- Risk และ rollout/rollback expectation
- Definition of Done ของทีม

ตัวอย่าง:

```text
KEY: PAY-142
SUMMARY: Add card payment
OBJECTIVE: ลูกค้าชำระเงินด้วยบัตรและเห็นผลลัพธ์ที่ชัดเจน
ACCEPTANCE:
  - valid card creates a payment
  - declined card shows a recoverable error
  - gateway timeout can be retried safely
OUT OF SCOPE:
  - saved cards
  - refunds
VERIFY: unit + integration + e2e payment tests
ROLLOUT: feature flag payment.card.enabled
```

## 2. Branch naming

รูปแบบ:

```text
<type>/<JIRA-KEY>-<short-kebab-description>
```

ตัวอย่าง:

```text
feature/PAY-142-card-payment
bugfix/PAY-203-gateway-timeout
hotfix/OPS-77-restore-login
chore/DEV-91-upgrade-eslint
docs/DOC-32-payment-runbook
test/PAY-145-payment-e2e
```

สร้าง branch จาก `main` ล่าสุด:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/PAY-142-card-payment
git push -u origin feature/PAY-142-card-payment
```

กติกา:

- Jira key ต้องเป็นตัวพิมพ์ใหญ่ เช่น `PAY-142` ไม่ใช่ `pay-142`
- คำอธิบายหลัง key ใช้ kebab-case
- อย่าใส่ชื่อบุคคลใน branch เพราะ owner เปลี่ยนได้
- ถ้า ticket ต้องใช้หลาย branch แสดงว่า scope อาจใหญ่เกินไป ควรแตก subtask

## 3. Commit messages

รูปแบบที่ใช้ร่วมกับ Conventional Commits:

```text
<type>(<scope>): <JIRA-KEY> <imperative summary>
```

ตัวอย่าง:

```text
feat(payment): PAY-142 add card form
feat(payment): PAY-142 validate card details
test(payment): PAY-142 cover declined card
fix(payment): PAY-142 handle gateway timeout
docs(payment): PAY-142 document retry policy
refactor(payment): PAY-142 isolate gateway adapter
```

คำสั่ง:

```bash
git add src/payment tests/payment
git diff --staged
git commit -m "feat(payment): PAY-142 validate card details"
```

กติกา:

- หนึ่ง commit มีหนึ่งเหตุผล
- ทุก commit ที่เป็นส่วนของ ticket ต้องมี Jira key
- Summary บอกผลของการเปลี่ยน เช่น `handle gateway timeout` ไม่ใช่ `update files`
- ห้ามรวม formatting ที่ไม่เกี่ยวข้องไว้ใน commit ฟีเจอร์
- ก่อน push ให้ตรวจ `git log --oneline origin/main..HEAD`

## 4. Pull Request

PR title:

```text
PAY-142: Add card payment
```

PR body template:

```markdown
## Jira

PAY-142 — Add card payment

## Summary

- เพิ่ม card form และ client-side validation
- รองรับ declined card และ gateway timeout

## Acceptance criteria

- [ ] Valid card creates a payment
- [ ] Declined card shows a recoverable error
- [ ] Gateway timeout can be retried safely

## Verification

- `npm test -- payment`
- `npm run typecheck`
- Manual: Visa test card / declined card / simulated timeout

## Risk

- Gateway retry อาจสร้าง duplicate request ถ้า idempotency key ผิด

## Rollout / rollback

- Rollout ผ่าน `payment.card.enabled`
- Rollback โดยปิด feature flag

## Screenshots / evidence

แนบ UI, logs หรือ test output ที่ช่วยให้ reviewer ตรวจได้เร็ว
```

Reviewer ตรวจอย่างน้อย:

- Jira key ตรงกับ scope ของ PR
- Acceptance criteria ครบ
- Diff ไม่มีไฟล์นอก scope
- Test ครอบคลุม happy path และ failure path
- Migration, compatibility, observability และ rollback ชัดเจน
- PR เล็กพอที่จะ review ได้อย่างมีคุณภาพ

ถ้าใช้ squash merge ต้องรักษา Jira key ไว้ใน squash commit message วิธีง่ายที่สุดคือใส่ key ไว้ใน PR title

## 5. Jira status mapping

ตัวอย่าง mapping ที่แนะนำ:

| Jira status | Git/deployment event | Exit condition |
|---|---|---|
| Ready | Ticket ผ่าน refinement | Acceptance criteria และ owner ชัดเจน |
| In Progress | สร้าง branch หรือ first push | มี branch ที่ link กับ ticket |
| In Review | PR marked ready | CI ผ่านและพร้อม reviewer |
| QA | Merge/deploy เข้า test environment | QA มี build ที่ตรวจได้ |
| Done | ผ่าน Definition of Done | Released/verified ตามกติกาทีม |

อย่าเปลี่ยนเป็น Done ทันทีหลัง merge หากทีมยังต้อง QA, UAT หรือ production verification

สามารถใช้ Jira Automation ผูก event เช่น branch created, PR created, PR merged หรือ deployment succeeded กับ transition ได้ แต่ต้องออกแบบให้ตรง workflow ของทีม

## 6. Smart Commits

Smart Commits เป็น optional feature สำหรับ comment, log time และ transition Jira จาก commit message

ตัวอย่าง:

```text
PAY-142 #comment validation passed
PAY-142 #time 2h 30m card validation
PAY-142 #start-review
PAY-142 #time 2h #comment tests passed #resolve
```

ข้อควรระวัง:

- คำสั่งของ Smart Commit ต้องอยู่ในบรรทัดเดียว
- Work item key ใช้รูปแบบตัวพิมพ์ใหญ่ เช่น `PAY-142`
- อีเมลใน Git commit ต้องตรงกับ Jira user เพียงหนึ่งบัญชี
- Jira user ต้องมี permission สำหรับ comment, log work หรือ transition
- Transition name ต้องตรงกับ workflow; ใช้ hyphen แทนช่องว่างเมื่อจำเป็น
- Transition ที่บังคับกรอก required fields เพิ่มเติมอาจไม่สำเร็จ
- Commit อาจสำเร็จแม้ Smart Commit command ล้มเหลว

ตรวจค่าผู้ commit:

```bash
git config user.name
git config user.email
```

อย่าใช้ Smart Commits เป็นช่องทางเดียวในการยืนยันสถานะสำคัญ ควรมี CI/Jira Automation หรือ verification ที่ตรวจสอบได้ร่วมด้วย

## 7. Multi-agent + Jira

อย่าให้หลาย Agent ใช้ Jira key เดียวและแก้ scope กว้างพร้อมกัน ให้ parent story เป็นเป้าหมายรวม และแตก subtask ต่อ Agent

```text
PAY-142  Parent story — Add card payment
PAY-143  Auth Agent — Payment token
PAY-144  UI Agent — Card form
PAY-145  Test Agent — Payment E2E
```

Branch ต่อ Agent:

```text
feature/PAY-143-payment-token
feature/PAY-144-card-form
test/PAY-145-payment-e2e
```

Ownership example:

| Agent | Jira key | Scope | Branch |
|---|---|---|---|
| Auth | PAY-143 | `src/payment/token/**` | `feature/PAY-143-payment-token` |
| UI | PAY-144 | `src/components/payment/**` | `feature/PAY-144-card-form` |
| Test | PAY-145 | `tests/e2e/payment/**` | `test/PAY-145-payment-e2e` |
| Integrator | PAY-142 | Shared contracts, lockfile, final verification | `integration/PAY-142-card-payment` |

Agent handoff:

```text
AGENT: UI
JIRA: PAY-144
PARENT: PAY-142
BRANCH: feature/PAY-144-card-form
BASE: origin/main @ a1b2c3d
COMMITS: 9f3ae81
ACCEPTANCE: 3/3 passed
TESTS: npm test -- payment-ui — passed
RISKS: consumes PaymentToken contract from PAY-143
UNRESOLVED: waiting for final error code names
```

Integrator ควร:

1. ตรวจว่าแต่ละ PR ใช้ Jira key ของ subtask ถูกต้อง
2. Merge ทีละ PR และ test ทุกครั้ง
3. อัปเดต Agent ที่เหลือให้ rebase จาก `main` ล่าสุด
4. ตรวจ acceptance criteria ของ parent story `PAY-142`
5. อัปเดต parent status หลัง integration และ verification ครบ

## 8. Team checklist

- [ ] Jira เชื่อมกับ development tool แล้ว
- [ ] Jira key เป็นตัวพิมพ์ใหญ่ใน branch, commits และ PR title
- [ ] หนึ่ง ticket มีหนึ่ง branch และหนึ่ง PR
- [ ] Commit ใช้รูปแบบเดียวกันทั้งทีม
- [ ] PR body มี acceptance criteria, tests, risk และ rollback
- [ ] Jira status สะท้อน delivery stage จริง
- [ ] Squash commit ยังคง Jira key
- [ ] Smart Commits เปิดใช้และทดสอบแล้วก่อนบังคับเป็นมาตรฐาน
- [ ] หลาย Agent ใช้ subtask key และ worktree แยกกัน
- [ ] Definition of Done ชัดเจนกว่าแค่ “merged”
