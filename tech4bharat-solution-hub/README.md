# Cadastra — Tech4Bharat Solution Hub

Cadastra is an AI helper for farming families in Karnataka. It reads a family's land papers (RTC/Pahani, mutation register, death certificate, family tree, survey sketch), explains who owns what in simple words, finds gaps and mismatches, and builds a verified, bank-ready case file.

Built by **Team Apexbuilders** for the Tech4Bharat hackathon.

## The problem

Land is a family's biggest asset, but the records rarely match reality:

- **Outdated** – the owner died years ago and the RTC was never changed to the heirs.
- **Informal split** – brothers divided the field, but the paper still shows one name.
- **Mismatch** – the survey number or area on the RTC differs from the survey map.
- **Result** – the bank says no, and families turn to moneylenders or sell in distress.

## How it works

The demo follows a six-step flow:

1. **Upload** – photos of the papers, or start from a sample family.
2. **Read** – a vision model reads owner, survey number and extent.
3. **Explain** – who owns what, in simple English.
4. **Find gaps** – mismatches and missing heirs are flagged.
5. **Fix & consent** – draft applications; heirs agree from their phones (simulated WhatsApp flow).
6. **Case file** – a verified PDF with a fair value range.

Four small "agents" (written as a tested TypeScript rule engine) do the work: Document Verification, Succession & Lineage, Discrepancy Detection and Case File Builder. Every finding links back to the document it came from, and a human approves before anything is filed.

## Tech stack

- React 19 and TanStack Start (file-based routing, server functions)
- Tailwind CSS 4 and shadcn/ui (Radix UI)
- jsPDF for the case-file PDF
- Zod for validating server inputs and model output
- Vitest and Testing Library for tests

## Getting started

You need [Bun](https://bun.sh) or Node.js 20+.

```sh
git clone https://github.com/Krishna-Pant19/Cadastra.git
cd tech4bharat-solution-hub
bun install      # or: npm install
bun run dev      # or: npm run dev
```

Then open the local address that the dev server prints.

The sample cases work without any setup. Reading **uploaded photos** runs on the server through an AI gateway and needs an API key set as a server environment variable (see `src/lib/ocr.server.ts`).

### Other commands

```sh
bun run build    # production build
bun run test     # run the unit tests
bun run lint     # lint the code
```

## Project structure

```
src/
  components/   UI (case workflow steps, landing page, shared shadcn/ui parts)
  hooks/        React hooks (e.g. running all agents on a case)
  lib/cadastra/ Domain logic: acre-gunta units, succession shares,
                discrepancy checks, valuation, drafts, PDF, sample cases
  routes/       Pages: /, /case, /about
  store/        Case state
```

## Sandbox disclosure

The demo uses sample land records, not live government portals. WhatsApp consent is simulated. Nothing you enter leaves your browser except photos sent for reading.

## Team

- Krishna Pant – AI & ML Lead
- Shashwat Shandilya – Full Stack Developer
- Dhanvi P – Backend Lead
- Aryan Singh – Frontend Lead
