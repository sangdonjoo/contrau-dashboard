# Contrau Dashboard (contrau-dashboard)

> **프로젝트 정체성:** 이 레포의 로컬 폴더명은 `contrau-shrimp-dashboard`이지만, 공식 이름은 **contrau-dashboard**다.
> GitHub: `sangdonjoo/contrau-dashboard` | 라이브: **dashboard.contrau.eco** (Vercel 배포)

Contrau 전사 대시보드 — Company / Accounting / People / Shrimp / Algae / Override 6개 도메인 통합.

## 기술 스택

- Next.js (App Router)
- Tailwind CSS v4
- Recharts
- TypeScript

## 로컬 실행

```bash
npm run dev    # http://localhost:3000
npm run build
```

## 메뉴 구조 & 라이브/목업 현황

| 대메뉴 | 소메뉴 | 상태 |
|--------|--------|------|
| Company | — | 목업 (라이브화 1순위) |
| Accounting | Transactions / Workflows / Financials | 목업 |
| People | — | 목업 |
| Shrimp | — | 목업 |
| Algae | Overview / Data Status / Operations / Inventory / Output / Experiment | 목업 |
| Override | Deep Dive | 목업 (라이브화 1순위, 실데이터: contrau-ssot/07_context-override/pull-interview/) |
| Override | Monthly Plan / Special Task | 목업 |

> 목업 메뉴는 UI에서 이름 앞에 `~` 표시. 라이브화되면 제거.

## 주요 파일 경로

```
src/
  app/
    company/page.tsx
    accounting/{page,workflow,company}/page.tsx
    people/page.tsx
    shrimp/page.tsx
    spirulina/{page,data-status,operations,inventory,output,experiment}/page.tsx
    override/page.tsx
  components/
    GlobalNav.tsx          ← 대메뉴
    override/OverrideList.tsx  ← Override 탭 (Deep Dive / Monthly Plan / Special Task)
    spirulina/SpirulinaNav.tsx ← Algae 소메뉴
    accounting/AccountingShell.tsx ← Accounting 소메뉴
```

## 실데이터 소스

- **Company**: contrau-ssot/01_company/ (R0/R1 파이프라인)
- **Override > Deep Dive**: contrau-ssot/07_context-override/pull-interview/
- **Override > Monthly Plan**: contrau-ssot/07_context-override/monthly-plan/

## 관련 레포

- SSOT: `contrau-ssot/` (데이터 소스)
- 봇 허브: `contrau-bot-hub/` (브로커, 봇 시스템)
