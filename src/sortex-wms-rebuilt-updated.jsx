import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/* =========================================================
   SORTEX WMS — single file application
   Database schema is matched to the existing Supabase schema.
   Currency: RUB
   ========================================================= */

const RUB = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

const TARIFF_TYPES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "shipment", label: "Отгрузка" },
];

const SERVICE_TYPES = [
  { value: "shipment", label: "Отгрузка" },
  { value: "receiving", label: "Приёмка" },
];

const OPERATION_STATUSES = [
  { value: "active", label: "Активна" },
  { value: "cancelled", label: "Отменена" },
];

const STORAGE_STATUSES = [
  { value: "planned", label: "Запланировано" },
  { value: "active", label: "Активно" },
  { value: "completed", label: "Завершено" },
  { value: "cancelled", label: "Отменено" },
];

const REQUEST_STATUSES = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "contacted", label: "Связались" },
  { value: "closed", label: "Закрыта" },
];

const today = () => new Date().toISOString().slice(0, 10);

const firstDayOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const money = (value) => RUB.format(Number(value || 0));

const number = (value) => NUM.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  if (!y || !m || !d) return value;
  return `${d}.${m}.${y}`;
};

const daysBetween = (start, end) => {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const diff = Math.ceil((b - a) / 86400000);
  return Math.max(1, diff + 1);
};

const csvEscape = (value) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCSV = (filename, rows) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.map(csvEscape).join(";"),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(";")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

/* =========================================================
   CSS
   ========================================================= */

const CSS = `
:root {
  --bg: #151514;
  --bg-soft: #191816;
  --panel: #1d1c19;
  --panel-2: #24221e;
  --panel-3: #292620;
  --gold: #c7a36a;
  --gold-2: #d5b77f;
  --gold-soft: rgba(199,163,106,.12);
  --gold-line: rgba(199,163,106,.25);
  --text: #f3efe7;
  --muted: #a9a39a;
  --muted-2: #777168;
  --border: rgba(255,255,255,.075);
  --danger: #c97c72;
  --success: #91ae8a;
  --warning: #c4a56d;
  --shadow: 0 18px 60px rgba(0,0,0,.28);
  --radius: 18px;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  width: 100%;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  scroll-behavior: smooth;
}

body {
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: var(--text);
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(199,163,106,.09),
      transparent 32%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(199,163,106,.055),
      transparent 30%
    ),
    var(--bg);
  letter-spacing: .01em;
  overflow-x: hidden;
  overscroll-behavior-x: none;
  -webkit-font-smoothing: antialiased;
  padding-bottom: env(safe-area-inset-bottom);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
  -webkit-appearance: none;
  touch-action: manipulation;
}

input,
select,
textarea {
  min-width: 0;
  font-size: 16px;
}

button:active {
  transform: translateY(1px);
}

::selection {
  background: rgba(199,163,106,.28);
  color: white;
}

.app {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
}

.sidebar {
  position: fixed;
  left: 18px;
  top: 18px;
  bottom: 18px;
  width: 250px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: rgba(29,28,25,.92);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 100;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding: 4px 4px 10px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 13px;
  border: 1px solid var(--gold-line);
  display: grid;
  place-items: center;
  color: var(--gold-2);
  background: var(--gold-soft);
  box-shadow: inset 0 0 22px rgba(199,163,106,.05);
}

.brand-mark span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 18px rgba(199,163,106,.22);
}

.brand-title {
  font-weight: 750;
  letter-spacing: .11em;
  font-size: 15px;
}

.brand-subtitle {
  font-size: 10px;
  color: var(--muted-2);
  margin-top: 3px;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.nav-label {
  font-size: 10px;
  color: var(--muted-2);
  letter-spacing: .13em;
  text-transform: uppercase;
  margin: 0 8px 9px;
}

.nav {
  display: grid;
  gap: 6px;
}

.nav-button {
  width: 100%;
  min-height: 42px;
  border: 1px solid transparent;
  color: var(--muted);
  background: transparent;
  border-radius: 12px;
  padding: 11px 12px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  transition: .18s ease;
}

.nav-button:hover {
  color: var(--text);
  background: rgba(255,255,255,.035);
}

.nav-button.active {
  color: var(--gold-2);
  background: var(--gold-soft);
  border-color: var(--gold-line);
  box-shadow: 0 0 24px rgba(199,163,106,.07);
}

.nav-icon {
  width: 19px;
  text-align: center;
  opacity: .9;
}

.sidebar-bottom {
  margin-top: auto;
}

.user-box {
  border-top: 1px solid var(--border);
  padding-top: 15px;
  margin-top: 15px;
}

.user-email {
  color: var(--muted);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
}

.main {
  width: calc(100% - 286px);
  margin-left: 286px;
  padding: 26px 28px 40px;
  padding-bottom: max(40px, calc(40px + env(safe-area-inset-bottom)));
  min-width: 0;
}

.mobile-nav-toggle {
  display: none;
}

.sidebar-overlay {
  display: none;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
}

.page-title {
  font-size: 28px;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -.025em;
}

.page-subtitle {
  color: var(--muted);
  margin-top: 7px;
  font-size: 13px;
}

.top-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.button {
  border: 1px solid var(--gold-line);
  background: var(--gold-soft);
  color: var(--gold-2);
  padding: 10px 14px;
  border-radius: 11px;
  transition: .16s ease;
  font-weight: 650;
  font-size: 13px;
  min-height: 40px;
}

.button:hover {
  background: rgba(199,163,106,.17);
  box-shadow: 0 0 22px rgba(199,163,106,.09);
}

.button:active {
  box-shadow:
    0 0 0 1px rgba(199,163,106,.18),
    0 0 25px rgba(199,163,106,.13);
}

.button.secondary {
  background: rgba(255,255,255,.025);
  color: var(--text);
  border-color: var(--border);
}

.button.danger {
  color: #df9a91;
  border-color: rgba(201,124,114,.28);
  background: rgba(201,124,114,.08);
}

.button.small {
  padding: 7px 10px;
  font-size: 12px;
  min-height: 34px;
}

.grid {
  display: grid;
  gap: 15px;
}

.grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card {
  border: 1px solid var(--border);
  background: rgba(29,28,25,.86);
  border-radius: var(--radius);
  box-shadow: 0 12px 40px rgba(0,0,0,.13);
  min-width: 0;
}

.kpi {
  padding: 19px;
  min-height: 128px;
}

.kpi-label {
  color: var(--muted);
  font-size: 12px;
}

.kpi-value {
  margin-top: 13px;
  font-size: 27px;
  font-weight: 720;
  letter-spacing: -.025em;
}

.kpi-foot {
  color: var(--muted-2);
  font-size: 11px;
  margin-top: 8px;
}

.section {
  margin-top: 17px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 17px 18px;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-size: 15px;
  font-weight: 700;
}

.section-subtitle {
  color: var(--muted);
  font-size: 11px;
  margin-top: 4px;
}

.section-body {
  padding: 18px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

th {
  color: var(--muted-2);
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .1em;
  font-weight: 650;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

td {
  padding: 13px 12px;
  border-bottom: 1px solid rgba(255,255,255,.045);
  color: #e5e0d8;
  font-size: 13px;
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: 0;
}

tr:hover td {
  background: rgba(255,255,255,.018);
}

.muted {
  color: var(--muted);
}

.gold {
  color: var(--gold-2);
}

.bold {
  font-weight: 700;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 10px;
  border: 1px solid var(--border);
  color: var(--muted);
  background: rgba(255,255,255,.025);
}

.badge::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: .8;
}

.badge.gold {
  color: var(--gold-2);
  border-color: var(--gold-line);
  background: var(--gold-soft);
}

.badge.green {
  color: var(--success);
  background: rgba(145,174,138,.08);
  border-color: rgba(145,174,138,.2);
}

.badge.red {
  color: var(--danger);
  background: rgba(201,124,114,.08);
  border-color: rgba(201,124,114,.2);
}

.badge.gray {
  color: var(--muted);
}

.toolbar {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  align-items: center;
}

.input,
.select,
.textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: #171614;
  color: var(--text);
  border-radius: 11px;
  outline: none;
  padding: 10px 12px;
  transition: .16s ease;
}

.input:focus,
.select:focus,
.textarea:focus {
  border-color: var(--gold-line);
  box-shadow: 0 0 0 3px rgba(199,163,106,.06);
}

.input::placeholder,
.textarea::placeholder {
  color: #6f6a62;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.select option {
  background: #1d1c19;
  color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
}

.form-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 11px;
  color: var(--muted);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,.66);
  backdrop-filter: blur(7px);
  display: grid;
  place-items: center;
  padding:
    max(12px, env(safe-area-inset-top))
    max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-left));
}

.modal {
  width: min(720px, 100%);
  max-height: min(92dvh, 900px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: #1b1a17;
  box-shadow: 0 30px 100px rgba(0,0,0,.55);
}

.modal.large {
  width: min(940px, 100%);
}

.modal-header {
  padding: 19px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.modal-title {
  font-size: 17px;
  font-weight: 750;
}

.modal-subtitle {
  color: var(--muted);
  font-size: 11px;
  margin-top: 5px;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.close {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border: 1px solid var(--border);
  color: var(--muted);
  background: rgba(255,255,255,.025);
  border-radius: 9px;
}

.close:hover {
  color: var(--text);
}

.detail-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 15px;
}

.client-list {
  padding: 8px;
}

.client-item {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
  text-align: left;
  margin-bottom: 4px;
}

.client-item:hover {
  background: rgba(255,255,255,.03);
}

.client-item.selected {
  border-color: var(--gold-line);
  background: var(--gold-soft);
}

.client-name {
  font-weight: 650;
  font-size: 13px;
}

.client-meta {
  color: var(--muted);
  font-size: 10px;
  margin-top: 4px;
}

.stat-line {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,.045);
}

.stat-line:last-child {
  border-bottom: 0;
}

.stat-line span:first-child {
  color: var(--muted);
  font-size: 12px;
}

.stat-line span:last-child {
  font-size: 13px;
  font-weight: 650;
}

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

.loading {
  padding: 50px;
  text-align: center;
  color: var(--muted);
}

.login {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 25px;
  background:
    radial-gradient(
      circle at 50% 10%,
      rgba(199,163,106,.11),
      transparent 34%
    ),
    var(--bg);
}

.login-card {
  width: min(420px, 100%);
  border: 1px solid var(--border);
  background: rgba(29,28,25,.92);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 30px 90px rgba(0,0,0,.35);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.login-title {
  font-size: 25px;
  font-weight: 760;
  letter-spacing: -.03em;
}

.login-subtitle {
  color: var(--muted);
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.6;
}

.error {
  border: 1px solid rgba(201,124,114,.28);
  color: #e0a099;
  background: rgba(201,124,114,.08);
  border-radius: 11px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.45;
}

.success-box {
  border: 1px solid rgba(145,174,138,.2);
  color: #adc5a7;
  background: rgba(145,174,138,.07);
  border-radius: 11px;
  padding: 10px 12px;
  font-size: 12px;
}

.toast-container {
  position: fixed;
  right: max(20px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 300;
  display: grid;
  gap: 8px;
  width: min(380px, calc(100vw - 40px));
}

.toast {
  border: 1px solid var(--gold-line);
  background: #211f1b;
  color: var(--text);
  border-radius: 13px;
  padding: 12px 14px;
  box-shadow: 0 15px 50px rgba(0,0,0,.3);
  font-size: 12px;
  line-height: 1.45;
}

.toast.error-toast {
  border-color: rgba(201,124,114,.35);
}

.search {
  max-width: 300px;
}

.split {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.total-preview {
  border: 1px solid var(--gold-line);
  background: rgba(199,163,106,.07);
  border-radius: 14px;
  padding: 15px;
}

.total-preview-label {
  color: var(--muted);
  font-size: 11px;
}

.total-preview-value {
  margin-top: 5px;
  color: var(--gold-2);
  font-size: 23px;
  font-weight: 750;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 10px;
}

.quick-action {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: rgba(255,255,255,.018);
  color: var(--text);
  text-align: left;
}

.quick-action:hover {
  border-color: var(--gold-line);
  background: var(--gold-soft);
}

.quick-action-title {
  font-size: 13px;
  font-weight: 650;
}

.quick-action-sub {
  color: var(--muted);
  font-size: 10px;
  margin-top: 4px;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 12px;
}

.report-box {
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: rgba(255,255,255,.018);
}

.report-box-label {
  color: var(--muted);
  font-size: 11px;
}

.report-box-value {
  font-size: 20px;
  font-weight: 730;
  margin-top: 7px;
}

.mobile-menu {
  display: none;
}

.print-only {
  display: none;
}

@media (max-width: 1180px) {
  .sidebar {
    width: 230px;
  }

  .main {
    width: calc(100% - 256px);
    margin-left: 256px;
  }

  .grid-4 {
    grid-template-columns: repeat(2, minmax(0,1fr));
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .app {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(310px, 86vw);
    margin: 0;
    border-radius: 0 22px 22px 0;
    transform: translateX(-105%);
    transition: transform .22s ease;
    z-index: 120;
    box-shadow: 18px 0 60px rgba(0,0,0,.4);
    padding-left: max(18px, env(safe-area-inset-left));
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 110;
    display: block;
    background: rgba(0,0,0,.58);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: .2s ease;
  }

  .sidebar-overlay.visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .main {
    width: 100%;
    margin-left: 0;
    padding: 18px 16px 40px;
  }

  .mobile-nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
  }

  .topbar {
    flex-direction: column;
  }

  .top-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .grid-3,
  .grid-2,
  .form-grid,
  .form-grid-3,
  .report-summary {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr 1fr;
  }

  table {
    min-width: 720px;
  }
}

@media (max-width: 600px) {
  .main {
    padding: 12px 10px 32px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .grid-4 {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .section-header,
  .section-body {
    padding: 14px;
  }

  .kpi {
    min-height: auto;
    padding: 16px;
  }

  .button,
  .nav-button,
  .input,
  .select {
    min-height: 44px;
  }

  .button.small {
    min-height: 40px;
  }

  .modal-backdrop {
    place-items: end center;
    padding: 0;
  }

  .modal,
  .modal.large {
    width: 100%;
    max-height: 94dvh;
    border-radius: 20px 20px 0 0;
    border-bottom: 0;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding:
      12px 16px
      max(12px, env(safe-area-inset-bottom));
    position: sticky;
    bottom: 0;
    background: #1b1a17;
  }

  .top-actions {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }

  .top-actions .button {
    width: 100%;
  }

  .search {
    max-width: none;
    width: 100%;
  }

  .split {
    align-items: flex-start;
    flex-direction: column;
  }

  .toast-container {
    width: calc(100vw - 20px);
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
  }
}

@media (max-width: 420px) {
  .page-title {
    font-size: 22px;
  }

  .brand {
    margin-bottom: 20px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-header .button {
    width: 100%;
  }
}

@media (pointer: coarse) {
  .nav-button,
  .button,
  .quick-action,
  .close {
    min-height: 44px;
  }
}

@media print {
  body {
    background: white;
    color: black;
  }

  .sidebar,
  .sidebar-overlay,
  .mobile-nav-toggle,
  .top-actions,
  .toast-container,
  .button {
    display: none !important;
  }

  .main {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .card {
    border: 1px solid #ddd;
    box-shadow: none;
    background: white;
  }

  .print-only {
    display: block;
  }
}
`;

/* =========================================================
   UI helpers
   ========================================================= */

const Icon = ({ type }) => {
  const icons = {
    home: "⌂",
    clients: "◉",
    products: "▦",
    shipment: "⇢",
    storage: "▤",
    requests: "✦",
    report: "▥",
    plus: "+",
    logout: "↪",
    edit: "✎",
    close: "×",
    download: "↓",
    search: "⌕",
    check: "✓",
    calendar: "□",
  };

  return <span>{icons[type] || "•"}</span>;
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  small = false,
  type = "button",
  disabled = false,
  style,
}) => (
  <button
    type={type}
    className={`button ${
      variant === "secondary"
        ? "secondary"
        : variant === "danger"
        ? "danger"
        : ""
    } ${small ? "small" : ""}`}
    onClick={onClick}
    disabled={disabled}
    style={style}
  >
    {children}
  </button>
);

const Modal = ({
  title,
  subtitle,
  children,
  footer,
  onClose,
  large = false,
}) => {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`modal ${large ? "large" : ""}`}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && (
              <div className="modal-subtitle">
                {subtitle}
              </div>
            )}
          </div>

          <button
            className="close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <Icon type="close" />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
  full = false,
}) => (
  <label className={`form-field ${full ? "full" : ""}`}>
    <span className="form-label">{label}</span>
    {children}
  </label>
);

const Empty = ({ children = "Нет данных" }) => (
  <div className="empty">{children}</div>
);

const Loading = () => (
  <div className="loading">Загрузка…</div>
);

const Badge = ({ children, tone = "gray" }) => (
  <span className={`badge ${tone}`}>{children}</span>
);

const getClientName = (clients, id) =>
  clients.find((x) => x.id === id)?.name || "—";

const getProductName = (products, id) =>
  products.find((x) => x.id === id)?.name || "—";

const statusLabel = (list, value) =>
  list.find((x) => x.value === value)?.label ||
  value ||
  "—";

const statusTone = (value) => {
  if (
    ["active", "completed", "contacted"].includes(
      value
    )
  ) {
    return "green";
  }

  if (
    ["cancelled", "closed"].includes(value)
  ) {
    return "red";
  }

  return "gold";
};

/* =========================================================
   Login
   ========================================================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error("Supabase не настроен.");
      }

      let result;

      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) throw result.error;

      if (result.data.session) {
        onLogin(result.data.session);
      } else if (mode === "signup") {
        setError(
          "Аккаунт создан. Проверьте почту для подтверждения."
        );
      }
    } catch (error) {
      setError(
        error?.message ||
          "Не удалось выполнить операцию."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <span />
          </div>

          <div>
            <div className="login-title">
              SORTEX WMS
            </div>

            <div className="login-subtitle">
              Управление складом, клиентами,
              отгрузками и тарифами.
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="grid"
          style={{ gap: 12 }}
        >
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="name@company.ru"
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Пароль">
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Минимум 6 символов"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              required
              minLength={6}
            />
          </Field>

          {error && (
            <div className="error">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading
              ? "Подождите…"
              : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMode(
                mode === "login" ? "signup" : "login"
              );
              setError("");
            }}
            style={{ width: "100%" }}
          >
            {mode === "login"
              ? "Создать аккаунт"
              : "У меня уже есть аккаунт"}
          </Button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   Dashboard
   ========================================================= */

function Dashboard({
  clients,
  shipments,
  storage,
  requests,
  loading,
  onAddShipment,
  onAddStorage,
  onAddClient,
  onNavigate,
}) {
  const monthStart = firstDayOfMonth();

  const monthShipments = useMemo(
    () =>
      shipments.filter(
        (x) =>
          String(x.shipment_date || "").slice(0, 10) >=
          monthStart
      ),
    [shipments, monthStart]
  );

  const monthRevenue = monthShipments.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const activeStorage = storage.filter(
    (x) => x.status === "active"
  );

  const newRequests = requests.filter(
    (x) => x.status === "new"
  );

  const latestShipments = shipments.slice(0, 7);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">
            Добро пожаловать
          </h1>

          <div className="page-subtitle">
            Операционный обзор SORTEX WMS
          </div>
        </div>

        <div className="top-actions">
          <Button onClick={onAddClient}>
            <Icon type="plus" /> Клиент
          </Button>

          <Button onClick={onAddShipment}>
            <Icon type="plus" /> Отгрузка
          </Button>

          <Button
            variant="secondary"
            onClick={onAddStorage}
          >
            <Icon type="plus" /> Хранение
          </Button>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi">
          <div className="kpi-label">
            Клиенты
          </div>

          <div className="kpi-value">
            {loading ? "…" : number(clients.length)}
          </div>

          <div className="kpi-foot">
            Всего в системе
          </div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">
            Отгрузки за месяц
          </div>

          <div className="kpi-value">
            {loading
              ? "…"
              : number(monthShipments.length)}
          </div>

          <div className="kpi-foot">
            С {formatDate(monthStart)}
          </div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">
            Выручка за месяц
          </div>

          <div className="kpi-value gold">
            {loading ? "…" : money(monthRevenue)}
          </div>

          <div className="kpi-foot">
            По сохранённым отгрузкам
          </div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">
            Новые заявки
          </div>

          <div className="kpi-value">
            {loading
              ? "…"
              : number(newRequests.length)}
          </div>

          <div className="kpi-foot">
            Требуют обработки
          </div>
        </div>
      </div>

      <div className="section card">
        <div className="section-header">
          <div>
            <div className="section-title">
              Быстрые действия
            </div>

            <div className="section-subtitle">
              Основные операции
            </div>
          </div>
        </div>

        <div className="section-body">
          <div className="quick-actions">
            <button
              className="quick-action"
              onClick={onAddClient}
            >
              <div className="quick-action-title">
                Новый клиент
              </div>

              <div className="quick-action-sub">
                Добавить карточку клиента
              </div>
            </button>

            <button
              className="quick-action"
              onClick={onAddShipment}
            >
              <div className="quick-action-title">
                Новая отгрузка
              </div>

              <div className="quick-action-sub">
                Создать складскую операцию
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() => onNavigate("reports")}
            >
              <div className="quick-action-title">
                Отчёты
              </div>

              <div className="quick-action-sub">
                Аналитика и выгрузка CSV
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="section card">
        <div className="section-header">
          <div>
            <div className="section-title">
              Последние отгрузки
            </div>

            <div className="section-subtitle">
              Последние сохранённые операции
            </div>
          </div>

          <Button
            small
            variant="secondary"
            onClick={() => onNavigate("shipments")}
          >
            Все отгрузки
          </Button>
        </div>

        {loading ? (
          <Loading />
        ) : latestShipments.length === 0 ? (
          <Empty>Отгрузок пока нет.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Товар</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>

              <tbody>
                {latestShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      {formatDate(
                        shipment.shipment_date
                      )}
                    </td>

                    <td>
                      {getClientName(
                        clients,
                        shipment.client_id
                      )}
                    </td>

                    <td>
                      {getProductName(
                        [],
                        shipment.product_id
                      ) !== "—"
                        ? getProductName(
                            [],
                            shipment.product_id
                          )
                        : shipment.product?.name ||
                          "—"}
                    </td>

                    <td>
                      {number(shipment.quantity)}
                    </td>

                    <td className="gold bold">
                      {money(shipment.total_rub)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section grid grid-2">
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">
                Хранение
              </div>

              <div className="section-subtitle">
                Активные размещения
              </div>
            </div>
          </div>

          <div className="section-body">
            <div className="stat-line">
              <span>Активных</span>
              <span>
                {number(activeStorage.length)}
              </span>
            </div>

            <div className="stat-line">
              <span>Всего записей</span>
              <span>
                {number(storage.length)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">
                Заявки
              </div>

              <div className="section-subtitle">
                Обращения клиентов
              </div>
            </div>
          </div>

          <div className="section-body">
            <div className="stat-line">
              <span>Новые</span>
              <span>
                {number(newRequests.length)}
              </span>
            </div>

            <div className="stat-line">
              <span>Всего</span>
              <span>
                {number(requests.length)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   Clients
   ========================================================= */

function Clients({
  clients,
  products,
  tariffs,
  shipments,
  storage,
  loading,
  selectedClientId,
  setSelectedClientId,
  onAddClient,
  onAddTariff,
  onAddShipment,
  onAddStorage,
  onDeleteClient,
  onDeleteStorage,
}) {
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        client.name,
        client.legal_name,
        client.inn,
        client.contact_name,
        client.phone,
        client.email,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [clients, search]);

  useEffect(() => {
    if (
      selectedClientId &&
      !clients.some(
        (client) => client.id === selectedClientId
      )
    ) {
      setSelectedClientId("");
    }
  }, [
    clients,
    selectedClientId,
    setSelectedClientId,
  ]);

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );

  const clientProducts = products.filter(
    (product) =>
      product.client_id === selectedClientId
  );

  const clientTariffs = tariffs.filter(
    (tariff) =>
      tariff.client_id === selectedClientId
  );

  const clientShipments = shipments.filter(
    (shipment) =>
      shipment.client_id === selectedClientId
  );

  const clientStorage = storage.filter(
    (record) =>
      record.client_id === selectedClientId
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">
            Клиенты
          </h1>

          <div className="page-subtitle">
            Карточки клиентов и связанные операции
          </div>
        </div>

        <div className="top-actions">
          <input
            className="input search"
            placeholder="Поиск клиента…"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <Button onClick={onAddClient}>
            <Icon type="plus" /> Новый клиент
          </Button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">
                Клиенты
              </div>

              <div className="section-subtitle">
                {filteredClients.length} из{" "}
                {clients.length}
              </div>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : filteredClients.length === 0 ? (
            <Empty>
              Клиенты не найдены.
            </Empty>
          ) : (
            <div className="client-list">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  className={`client-item ${
                    selectedClientId === client.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedClientId(client.id)
                  }
                >
                  <div className="client-name">
                    {client.name}
                  </div>

                  <div className="client-meta">
                    {client.inn
                      ? `ИНН ${client.inn}`
                      : client.email ||
                        client.phone ||
                        "Контакты не указаны"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          {!selectedClient ? (
            <Empty>
              Выберите клиента слева.
            </Empty>
          ) : (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">
                    {selectedClient.name}
                  </div>

                  <div className="section-subtitle">
                    {selectedClient.legal_name ||
                      "Карточка клиента"}
                  </div>
                </div>

                <div className="toolbar">
                  <Button small variant="danger" onClick={() => onDeleteClient(selectedClient)}>
                    Удалить клиента
                  </Button>
                  <Button
                    small
                    onClick={() =>
                      onAddShipment(
                        selectedClient.id
                      )
                    }
                  >
                    <Icon type="plus" /> Отгрузка
                  </Button>

                  <Button
                    small
                    variant="secondary"
                    onClick={() =>
                      onAddStorage(
                        selectedClient.id
                      )
                    }
                  >
                    <Icon type="plus" /> Хранение
                  </Button>

                  <Button
                    small
                    variant="secondary"
                    onClick={() =>
                      onAddTariff(
                        selectedClient.id
                      )
                    }
                  >
                    <Icon type="plus" /> Тариф
                  </Button>
                </div>
              </div>

              <div className="section-body">
                <div className="grid grid-2">
                  <div>
                    <div className="stat-line">
                      <span>Юр. название</span>
                      <span>
                        {selectedClient.legal_name ||
                          "—"}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>ИНН</span>
                      <span>
                        {selectedClient.inn || "—"}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>Контакт</span>
                      <span>
                        {selectedClient.contact_name ||
                          "—"}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>Телефон</span>
                      <span>
                        {selectedClient.phone || "—"}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>Email</span>
                      <span>
                        {selectedClient.email || "—"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="stat-line">
                      <span>Товаров</span>
                      <span>
                        {number(clientProducts.length)}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>Тарифов</span>
                      <span>
                        {number(clientTariffs.length)}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>Отгрузок</span>
                      <span>
                        {number(clientShipments.length)}
                      </span>
                    </div>

                    <div className="stat-line">
                      <span>Хранение</span>
                      <span>
                        {number(clientStorage.length)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div
                    className="card"
                    style={{
                      marginTop: 15,
                      padding: 15,
                    }}
                  >
                    <div className="form-label">
                      Примечание
                    </div>

                    <div
                      style={{
                        marginTop: 7,
                        lineHeight: 1.6,
                        fontSize: 13,
                      }}
                    >
                      {selectedClient.notes}
                    </div>
                  </div>
                )}

                <div className="section">
                  <div className="section-header">
                    <div><div className="section-title">Хранение клиента</div><div className="section-subtitle">Все записи хранения</div></div>
                  </div>
                  {clientStorage.length === 0 ? <Empty>Записей хранения ещё нет.</Empty> : <div className="table-wrap"><table><thead><tr><th>Период</th><th>Расчёт</th><th>Количество</th><th>Ставка</th><th>Сумма</th><th></th></tr></thead><tbody>{clientStorage.map((record)=><tr key={record.id}><td>{formatDate(record.start_date)} — {formatDate(record.end_date)}</td><td>{Number(record.unit_count||0)>0?"За единицу":"М³"}</td><td>{Number(record.unit_count||0)>0?number(record.unit_count):number(record.volume_m3)}</td><td>{money(Number(record.unit_count||0)>0?record.price_per_unit_day_rub:record.price_per_m3_day_rub)}</td><td className="gold">{money(record.total_rub)}</td><td><Button small variant="danger" onClick={()=>onDeleteStorage(record.id)}>Удалить</Button></td></tr>)}</tbody></table></div>}
                </div>

                <div className="section">
                  <div className="section-header">
                    <div>
                      <div className="section-title">
                        Товары клиента
                      </div>

                      <div className="section-subtitle">
                        {clientProducts.length
                          ? "Справочник товаров"
                          : "Товары ещё не добавлены"}
                      </div>
                    </div>
                  </div>

                  {clientProducts.length === 0 ? (
                    <Empty>
                      Добавьте товар через раздел
                      «Товары».
                    </Empty>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Название</th>
                            <th>Артикул</th>
                            <th>Размер</th>
                            <th>Вес, кг</th>
                          </tr>
                        </thead>

                        <tbody>
                          {clientProducts.map(
                            (product) => (
                              <tr key={product.id}>
                                <td className="bold">
                                  {product.name}
                                </td>

                                <td>
                                  {product.sku || "—"}
                                </td>

                                <td>
                                  {product.size_type || "—"}
                                </td>

                                <td className="gold">
                                  {number(
                                    product.weight_kg
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="section">
                  <div className="section-header">
                    <div>
                      <div className="section-title">
                        Тарифы
                      </div>

                      <div className="section-subtitle">
                        Тарифные ставки клиента
                      </div>
                    </div>
                  </div>

                  {clientTariffs.length === 0 ? (
                    <Empty>
                      Тарифы ещё не добавлены.
                    </Empty>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Тип</th>
                            <th>Товар</th>
                            <th>Ставка</th>
                            <th>Включено кг</th>
                            <th>Доп. кг</th>
                          </tr>
                        </thead>

                        <tbody>
                          {clientTariffs.map(
                            (tariff) => (
                              <tr key={tariff.id}>
                                <td>
                                  {statusLabel(
                                    TARIFF_TYPES,
                                    tariff.tariff_type
                                  )}
                                </td>

                                <td>
                                  {getProductName(
                                    products,
                                    tariff.product_id
                                  )}
                                </td>

                                <td className="gold">
                                  {money(
                                    tariff.price_rub
                                  )}
                                </td>

                                <td>
                                  {number(
                                    tariff.included_weight_kg
                                  )}
                                </td>

                                <td>
                                  {money(
                                    tariff.extra_kg_price_rub
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   Products
   ========================================================= */

function Products({
  products,
  clients,
  loading,
  onAddProduct,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((product) =>
      [
        product.name,
        product.sku,
        product.size_type,
        getClientName(clients, product.client_id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [products, clients, search]);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">
            Товары
          </h1>

          <div className="page-subtitle">
            Номенклатура клиентов
          </div>
        </div>

        <div className="top-actions">
          <input
            className="input search"
            placeholder="Поиск товара…"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <Button onClick={onAddProduct}>
            <Icon type="plus" /> Новый товар
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">
              Номенклатура
            </div>

            <div className="section-subtitle">
              {filtered.length} товаров
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty>
            Товары не найдены.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Артикул</th>
                  <th>Клиент</th>
                  <th>Размер</th>
                  <th>Вес, кг</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td className="bold">
                      {product.name}
                    </td>

                    <td>
                      {product.sku || "—"}
                    </td>

                    <td>
                      {getClientName(
                        clients,
                        product.client_id
                      )}
                    </td>

                    <td>
                      {product.size_type || "—"}
                    </td>

                    <td className="gold">
                      {number(product.weight_kg)}
                    </td>

                    <td>
                      <Badge
                        tone={
                          product.is_active === false
                            ? "red"
                            : "green"
                        }
                      >
                        {product.is_active === false
                          ? "Неактивен"
                          : "Активен"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   Shipments
   ========================================================= */

function Shipments({
  shipments,
  clients,
  products,
  loading,
  onAddShipment,
  onDeleteShipment,
}) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const clientName = getClientName(
        clients,
        shipment.client_id
      );

      const productName = getProductName(
        products,
        shipment.product_id
      );

      const textMatch =
        !q ||
        [
          clientName,
          productName,
          shipment.note,
          shipment.tariff_type,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(q)
          );

      const date = String(
        shipment.shipment_date || ""
      ).slice(0, 10);

      const fromMatch =
        !fromDate || date >= fromDate;

      const toMatch =
        !toDate || date <= toDate;

      return (
        textMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [
    shipments,
    clients,
    products,
    search,
    fromDate,
    toDate,
  ]);

  const total = filtered.reduce(
    (sum, shipment) =>
      sum + Number(shipment.total_rub || 0),
    0
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">
            Отгрузки
          </h1>

          <div className="page-subtitle">
            Складские операции и начисления
          </div>
        </div>

        <div className="top-actions">
          <Button onClick={onAddShipment}>
            <Icon type="plus" /> Новая отгрузка
          </Button>
        </div>
      </div>

      <div className="card section">
        <div className="section-body">
          <div className="form-grid-3">
            <Field label="Поиск">
              <input
                className="input"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Клиент, товар…"
              />
            </Field>

            <Field label="С даты">
              <input
                className="input"
                type="date"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(event.target.value)
                }
              />
            </Field>

            <Field label="По дату">
              <input
                className="input"
                type="date"
                value={toDate}
                onChange={(event) =>
                  setToDate(event.target.value)
                }
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="section grid grid-3">
        <div className="card report-box">
          <div className="report-box-label">
            Операций
          </div>

          <div className="report-box-value">
            {number(filtered.length)}
          </div>
        </div>

        <div className="card report-box">
          <div className="report-box-label">
            Количество
          </div>

          <div className="report-box-value">
            {number(
              filtered.reduce(
                (sum, x) =>
                  sum + Number(x.quantity || 0),
                0
              )
            )}
          </div>
        </div>

        <div className="card report-box">
          <div className="report-box-label">
            Сумма
          </div>

          <div className="report-box-value gold">
            {money(total)}
          </div>
        </div>
      </div>

      <div className="card section">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty>
            Отгрузок по заданным условиям нет.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Товар</th>
                  <th>Тип</th>
                  <th>Кол-во</th>
                  <th>Вес</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      {formatDate(
                        shipment.shipment_date
                      )}
                    </td>

                    <td>
                      {getClientName(
                        clients,
                        shipment.client_id
                      )}
                    </td>

                    <td>
                      {getProductName(
                        products,
                        shipment.product_id
                      )}
                    </td>

                    <td>
                      {statusLabel(
                        TARIFF_TYPES,
                        shipment.tariff_type
                      )}
                    </td>

                    <td>
                      {number(shipment.quantity)}
                    </td>

                    <td>
                      {number(
                        shipment.weight_kg
                      )}{" "}
                      кг
                    </td>

                    <td>
                      {money(
                        shipment.unit_price_rub
                      )}
                    </td>

                    <td className="gold bold">
                      {money(
                        shipment.total_rub
                      )}
                    </td>

                    <td>
                      <Badge
                        tone={statusTone(
                          shipment.status ||
                            "active"
                        )}
                      >
                        {statusLabel(
                          OPERATION_STATUSES,
                          shipment.status ||
                            "active"
                        )}
                      </Badge>
                    </td>
                    <td><Button small variant="danger" onClick={()=>onDeleteShipment(shipment.id)}>Удалить</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   Requests
   ========================================================= */

function Requests({
  requests,
  clients,
  loading,
  onUpdateRequest,
}) {
  const [statusFilter, setStatusFilter] =
    useState("all");

  const filtered = useMemo(
    () =>
      requests.filter(
        (request) =>
          statusFilter === "all" ||
          request.status === statusFilter
      ),
    [requests, statusFilter]
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">
            Заявки
          </h1>

          <div className="page-subtitle">
            Входящие обращения и сотрудничество
          </div>
        </div>

        <div className="top-actions">
          <select
            className="select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{ width: 190 }}
          >
            <option value="all">
              Все статусы
            </option>

            {REQUEST_STATUSES.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty>
            Заявок с таким статусом нет.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Компания</th>
                  <th>Контакт</th>
                  <th>Телефон</th>
                  <th>Email</th>
                  <th>Статус</th>
                  <th>Клиент</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((request) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    clients={clients}
                    onUpdateRequest={onUpdateRequest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function RequestRow({
  request,
  clients,
  onUpdateRequest,
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(
    request.status || "new"
  );
  const [clientId, setClientId] = useState(
    request.client_id || ""
  );
  const [note, setNote] = useState(
    request.internal_note || ""
  );

  const save = async () => {
    await onUpdateRequest(request.id, {
      status,
      client_id: clientId,
      internal_note: note,
    });

    setEditing(false);
  };

  return (
    <tr>
      <td>
        {formatDate(
          request.created_at
        )}
      </td>

      <td className="bold">
        {request.company_name ||
          request.name ||
          "—"}
      </td>

      <td>
        {request.contact_name ||
          request.name ||
          "—"}
      </td>

      <td>
        {request.phone || "—"}
      </td>

      <td>
        {request.email || "—"}
      </td>

      <td>
        {editing ? (
          <select
            className="select"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            style={{ minWidth: 140 }}
          >
            {REQUEST_STATUSES.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              )
            )}
          </select>
        ) : (
          <Badge
            tone={statusTone(
              request.status
            )}
          >
            {statusLabel(
              REQUEST_STATUSES,
              request.status
            )}
          </Badge>
        )}
      </td>

      <td>
        {editing ? (
          <select
            className="select"
            value={clientId}
            onChange={(event) =>
              setClientId(event.target.value)
            }
            style={{ minWidth: 180 }}
          >
            <option value="">
              Не привязан
            </option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.name}
              </option>
            ))}
          </select>
        ) : (
          getClientName(
            clients,
            request.client_id
          )
        )}
      </td>

      <td>
        {editing ? (
          <div
            className="toolbar"
            style={{
              alignItems: "stretch",
              flexDirection: "column",
            }}
          >
            <textarea
              className="textarea"
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Внутренняя заметка"
              style={{ minWidth: 220 }}
            />

            <div className="toolbar">
              <Button
                small
                onClick={save}
              >
                <Icon type="check" /> Сохранить
              </Button>

              <Button
                small
                variant="secondary"
                onClick={() =>
                  setEditing(false)
                }
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <Button
            small
            variant="secondary"
            onClick={() =>
              setEditing(true)
            }
          >
            <Icon type="edit" /> Изменить
          </Button>
        )}
      </td>
    </tr>
  );
}

/* =========================================================
   Reports
   ========================================================= */

function Reports({ clients, shipments, storage, products, loading }) {
  const [from,setFrom]=useState(firstDayOfMonth());
  const [to,setTo]=useState(today());
  const filteredShipments=useMemo(()=>shipments.filter(x=>{const d=String(x.shipment_date||"").slice(0,10);return (!from||d>=from)&&(!to||d<=to)}),[shipments,from,to]);
  const filteredStorage=useMemo(()=>storage.filter(x=>{const a=String(x.start_date||"").slice(0,10),b=String(x.end_date||"").slice(0,10);return (!to||a<=to)&&(!from||b>=from)}),[storage,from,to]);
  const rows=useMemo(()=>clients.map(client=>{const sh=filteredShipments.filter(x=>x.client_id===client.id);const st=filteredStorage.filter(x=>x.client_id===client.id);const shSum=sh.reduce((a,x)=>a+Number(x.total_rub||0),0);const stSum=st.reduce((a,x)=>a+Number(x.total_rub||0),0);return {client,sh,st,shSum,stSum,total:shSum+stSum}}).filter(x=>x.sh.length||x.st.length),[clients,filteredShipments,filteredStorage]);
  const exportClients=()=>downloadCSV(`sortex-report-${from||"all"}-${to||"all"}.csv`,rows.map(r=>({Клиент:r.client.name,Отгрузок:r.sh.length,Сумма_отгрузки:r.shSum,Хранение:r.st.length,Сумма_хранения:r.stSum,Итого:r.total})));
  const exportShipments=()=>downloadCSV(`sortex-shipments-${from||"all"}-${to||"all"}.csv`,filteredShipments.map(x=>({Дата:formatDate(x.shipment_date),Клиент:getClientName(clients,x.client_id),Товар:getProductName(products,x.product_id),Количество:x.quantity,Сумма:x.total_rub,Тип:statusLabel(TARIFF_TYPES,x.tariff_type)})));
  return <><div className="topbar"><div><h1 className="page-title">Отчёт</h1><div className="page-subtitle">Каждый клиент и все его операции за период</div></div><div className="top-actions"><Button onClick={exportClients}><Icon type="download"/> CSV отчёт</Button><Button variant="secondary" onClick={exportShipments}>CSV отгрузки</Button></div></div>
    <div className="card"><div className="section-body"><div className="form-grid-3"><Field label="С даты"><input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></Field><Field label="По дату"><input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)}/></Field><div className="report-box"><div className="report-box-label">Всего операций</div><div className="report-box-value">{number(filteredShipments.length+filteredStorage.length)}</div></div></div></div></div>
    {loading?<Loading/>:<div className="section card"><div className="section-header"><div><div className="section-title">Операции по клиентам</div><div className="section-subtitle">Отгрузки + хранение</div></div></div>{rows.length===0?<Empty>За выбранный период операций нет.</Empty>:<div className="table-wrap"><table><thead><tr><th>Клиент</th><th>Отгрузки</th><th>Сумма отгрузки</th><th>Хранение</th><th>Сумма хранения</th><th>Итого</th></tr></thead><tbody>{rows.map(r=><tr key={r.client.id}><td className="bold">{r.client.name}</td><td>{number(r.sh.length)}</td><td>{money(r.shSum)}</td><td>{number(r.st.length)}</td><td>{money(r.stSum)}</td><td className="gold bold">{money(r.total)}</td></tr>)}</tbody></table></div>}</div>}</>;
}

/* =========================================================
   Client modal
   ========================================================= */

function ClientModal({
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    legal_name: "",
    inn: "",
    contact_name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Новый клиент"
      subtitle="Создание карточки клиента"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Отмена
          </Button>

          <Button
            type="submit"
            form="client-form"
            disabled={saving}
          >
            {saving
              ? "Сохранение…"
              : "Сохранить клиента"}
          </Button>
        </>
      }
    >
      <form
        id="client-form"
        onSubmit={submit}
      >
        <div className="form-grid">
          <Field label="Название клиента *">
            <input
              className="input"
              value={form.name}
              onChange={(event) =>
                change(
                  "name",
                  event.target.value
                )
              }
              placeholder="ООО Ромашка"
              autoFocus
              required
            />
          </Field>

          <Field label="Юридическое название">
            <input
              className="input"
              value={form.legal_name}
              onChange={(event) =>
                change(
                  "legal_name",
                  event.target.value
                )
              }
              placeholder="ООО «Ромашка»"
            />
          </Field>

          <Field label="ИНН">
            <input
              className="input"
              value={form.inn}
              onChange={(event) =>
                change(
                  "inn",
                  event.target.value
                )
              }
              inputMode="numeric"
              placeholder="7700000000"
            />
          </Field>

          <Field label="Контактное лицо">
            <input
              className="input"
              value={form.contact_name}
              onChange={(event) =>
                change(
                  "contact_name",
                  event.target.value
                )
              }
              placeholder="Иван Иванов"
            />
          </Field>

          <Field label="Телефон">
            <input
              className="input"
              type="tel"
              value={form.phone}
              onChange={(event) =>
                change(
                  "phone",
                  event.target.value
                )
              }
              placeholder="+7 900 000-00-00"
            />
          </Field>

          <Field label="Email">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) =>
                change(
                  "email",
                  event.target.value
                )
              }
              placeholder="info@company.ru"
            />
          </Field>

          <Field
            label="Примечание"
            full
          >
            <textarea
              className="textarea"
              value={form.notes}
              onChange={(event) =>
                change(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Дополнительная информация"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   Product modal
   ========================================================= */

function ProductModal({ clients, defaultClientId, onClose, onSave }) {
  const [form, setForm] = useState({
    client_id: defaultClientId || "", name: "", sku: "", size_type: "",
    length_cm: "", width_cm: "", height_cm: "", weight_kg: "", notes: "", is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await onSave(form); } finally { setSaving(false); } };
  return (
    <Modal title="Новый товар" subtitle="Добавление товара клиента" onClose={onClose} footer={<>
      <Button variant="secondary" onClick={onClose} disabled={saving}>Отмена</Button>
      <Button type="submit" form="product-form" disabled={saving}>{saving ? "Сохранение…" : "Сохранить товар"}</Button>
    </>}>
      <form id="product-form" onSubmit={submit}>
        <div className="form-grid">
          <Field label="Клиент *"><select className="select" value={form.client_id} onChange={(e)=>change("client_id",e.target.value)} required><option value="">Выберите клиента</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Название товара *"><input className="input" value={form.name} onChange={(e)=>change("name",e.target.value)} required /></Field>
          <Field label="SKU"><input className="input" value={form.sku} onChange={(e)=>change("sku",e.target.value)} placeholder="Необязательно" /></Field>
          <Field label="Тип размера"><select className="select" value={form.size_type} onChange={(e)=>change("size_type",e.target.value)}><option value="">Не указан</option>{TARIFF_TYPES.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>
          <Field label="Длина, см"><input className="input" type="number" min="0" step="0.01" value={form.length_cm} onChange={(e)=>change("length_cm",e.target.value)} /></Field>
          <Field label="Ширина, см"><input className="input" type="number" min="0" step="0.01" value={form.width_cm} onChange={(e)=>change("width_cm",e.target.value)} /></Field>
          <Field label="Высота, см"><input className="input" type="number" min="0" step="0.01" value={form.height_cm} onChange={(e)=>change("height_cm",e.target.value)} /></Field>
          <Field label="Вес, кг"><input className="input" type="number" min="0" step="0.01" value={form.weight_kg} onChange={(e)=>change("weight_kg",e.target.value)} /></Field>
          <Field label="Примечание" full><textarea className="textarea" value={form.notes} onChange={(e)=>change("notes",e.target.value)} /></Field>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   Tariff modal
   ========================================================= */

function TariffModal({
  clients,
  products,
  defaultClientId,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    client_id: defaultClientId || "",
    product_id: "",
    tariff_type: "shipment",
    base_unit_price_rub: "",
    included_weight_kg: "",
    extra_kg_price_rub: "",
    effective_from: today(),
  });

  const [saving, setSaving] = useState(false);

  const clientProducts = products.filter(
    (product) =>
      !form.client_id ||
      product.client_id === form.client_id
  );

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Новый тариф"
      subtitle="Тарифная ставка клиента"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Отмена
          </Button>

          <Button
            type="submit"
            form="tariff-form"
            disabled={saving}
          >
            {saving
              ? "Сохранение…"
              : "Сохранить тариф"}
          </Button>
        </>
      }
    >
      <form
        id="tariff-form"
        onSubmit={submit}
      >
        <div className="form-grid">
          <Field label="Клиент *">
            <select
              className="select"
              value={form.client_id}
              onChange={(event) =>
                change(
                  "client_id",
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Выберите клиента
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Тип тарифа *">
            <select
              className="select"
              value={form.tariff_type}
              onChange={(event) =>
                change(
                  "tariff_type",
                  event.target.value
                )
              }
              required
            >
              {TARIFF_TYPES.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Товар">
            <select
              className="select"
              value={form.product_id}
              onChange={(event) =>
                change(
                  "product_id",
                  event.target.value
                )
              }
            >
              <option value="">
                Все товары
              </option>

              {clientProducts.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Базовая ставка, ₽">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={
                form.base_unit_price_rub
              }
              onChange={(event) =>
                change(
                  "base_unit_price_rub",
                  event.target.value
                )
              }
            />
          </Field>

          <Field label="Включённый вес, кг">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={
                form.included_weight_kg
              }
              onChange={(event) =>
                change(
                  "included_weight_kg",
                  event.target.value
                )
              }
            />
          </Field>

          <Field label="Доп. кг, ₽">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={
                form.extra_kg_price_rub
              }
              onChange={(event) =>
                change(
                  "extra_kg_price_rub",
                  event.target.value
                )
              }
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   Shipment modal
   ========================================================= */

function ShipmentModal({
  clients,
  products,
  tariffs,
  defaultClientId,
  defaultProductId,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    client_id: defaultClientId || "",
    product_id: defaultProductId || "",
    shipment_date: today(),
    quantity: "",
    weight_kg: "",
    tariff_type: "shipment",
    unit_price_rub: "",
    total_rub: "",
    base_unit_price_rub: "",
    included_weight_kg: "",
    extra_kg_price_rub: "",
    extra_kg_rub: "",
    receiving_enabled: false,
    receiving_unit_price_rub: "",
    receiving_total_rub: "",
    note: "",
  });

  const [saving, setSaving] = useState(false);

  const clientProducts = products.filter(
    (product) =>
      !form.client_id ||
      product.client_id === form.client_id
  );

  const clientTariffs = tariffs.filter(
    (tariff) =>
      tariff.client_id === form.client_id
  );

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (!form.product_id) return;

    const product =
      clientProducts.find(
        (item) =>
          item.id === form.product_id
      );

    if (
      product &&
      !form.unit_price_rub
    ) {
      change(
        "unit_price_rub",
        product.weight_kg || ""
      );
    }
  }, [
    form.product_id,
    clientProducts,
  ]);

  useEffect(() => {
    if (!form.client_id) return;

    if (
      form.product_id &&
      !clientProducts.some(
        (product) =>
          product.id === form.product_id
      )
    ) {
      change("product_id", "");
    }
  }, [
    form.client_id,
    clientProducts,
  ]);

  useEffect(() => {
    const tariff =
      clientTariffs.find(
        (item) =>
          item.tariff_type ===
            form.tariff_type &&
          (!item.product_id ||
            item.product_id ===
              form.product_id)
      );

    if (!tariff) return;

    setForm((prev) => ({
      ...prev,
      base_unit_price_rub:
        prev.base_unit_price_rub ||
        tariff.price_rub ||
        "",
      included_weight_kg:
        prev.included_weight_kg ||
        tariff.included_weight_kg ||
        "",
      extra_kg_price_rub:
        prev.extra_kg_price_rub ||
        tariff.extra_kg_price_rub ||
        "",
    }));
  }, [
    form.client_id,
    form.product_id,
    form.tariff_type,
    clientTariffs,
  ]);

  useEffect(() => {
    const quantity =
      Number(form.quantity || 0);

    const weight =
      Number(form.weight_kg || 0);

    const unitPrice =
      Number(
        form.unit_price_rub || 0
      );

    const basePrice =
      Number(
        form.base_unit_price_rub || 0
      );

    const includedWeight =
      Number(
        form.included_weight_kg || 0
      );

    const extraKgPrice =
      Number(
        form.extra_kg_price_rub || 0
      );

    const effectiveUnitPrice =
      unitPrice || basePrice;

    const extraKg = Math.max(
      0,
      weight - includedWeight
    );

    const extraRub =
      extraKg * extraKgPrice;

    const shipmentTotal =
      quantity * effectiveUnitPrice +
      extraRub;

    const receivingTotal =
      form.receiving_enabled
        ? quantity *
          Number(
            form.receiving_unit_price_rub ||
              0
          )
        : 0;

    setForm((prev) => ({
      ...prev,
      extra_kg_rub:
        extraRub || "",
      receiving_total_rub:
        receivingTotal || "",
      total_rub:
        shipmentTotal +
          receivingTotal ||
        "",
    }));
  }, [
    form.quantity,
    form.weight_kg,
    form.unit_price_rub,
    form.base_unit_price_rub,
    form.included_weight_kg,
    form.extra_kg_price_rub,
    form.receiving_enabled,
    form.receiving_unit_price_rub,
  ]);

  const totalPreview =
    Number(form.total_rub || 0);

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Новая отгрузка"
      subtitle="Создание складской операции"
      onClose={onClose}
      large
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Отмена
          </Button>

          <Button
            type="submit"
            form="shipment-form"
            disabled={saving}
          >
            {saving
              ? "Сохранение…"
              : "Сохранить отгрузку"}
          </Button>
        </>
      }
    >
      <form
        id="shipment-form"
        onSubmit={submit}
      >
        <div className="form-grid">
          <Field label="Клиент *">
            <select
              className="select"
              value={form.client_id}
              onChange={(event) =>
                change(
                  "client_id",
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Выберите клиента
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Товар *">
            <select
              className="select"
              value={form.product_id}
              onChange={(event) =>
                change(
                  "product_id",
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Выберите товар
              </option>

              {clientProducts.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Дата отгрузки *">
            <input
              className="input"
              type="date"
              value={form.shipment_date}
              onChange={(event) =>
                change(
                  "shipment_date",
                  event.target.value
                )
              }
              required
            />
          </Field>

          <Field label="Тип тарифа">
            <select
              className="select"
              value={form.tariff_type}
              onChange={(event) =>
                change(
                  "tariff_type",
                  event.target.value
                )
              }
            >
              {TARIFF_TYPES.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Количество *">
            <input
              className="input"
              type="number"
              min="0.01"
              step="0.01"
              value={form.quantity}
              onChange={(event) =>
                change(
                  "quantity",
                  event.target.value
                )
              }
              placeholder="0"
              required
            />
          </Field>

          <Field label="Вес, кг">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.weight_kg}
              onChange={(event) =>
                change(
                  "weight_kg",
                  event.target.value
                )
              }
              placeholder="0"
            />
          </Field>

          <Field label="Цена за единицу, ₽">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.unit_price_rub}
              onChange={(event) =>
                change(
                  "unit_price_rub",
                  event.target.value
                )
              }
              placeholder="0"
            />
          </Field>

          <Field label="Базовая ставка, ₽">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={
                form.base_unit_price_rub
              }
              onChange={(event) =>
                change(
                  "base_unit_price_rub",
                  event.target.value
                )
              }
              placeholder="0"
            />
          </Field>

          <Field label="Включено кг">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={
                form.included_weight_kg
              }
              onChange={(event) =>
                change(
                  "included_weight_kg",
                  event.target.value
                )
              }
              placeholder="0"
            />
          </Field>

          <Field label="Цена дополнительного кг, ₽">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={
                form.extra_kg_price_rub
              }
              onChange={(event) =>
                change(
                  "extra_kg_price_rub",
                  event.target.value
                )
              }
              placeholder="0"
            />
          </Field>

          <Field label="Доп. кг, сумма, ₽">
            <input
              className="input"
              type="number"
              value={form.extra_kg_rub}
              readOnly
            />
          </Field>

          <Field label="Приёмка">
            <select
              className="select"
              value={
                form.receiving_enabled
                  ? "yes"
                  : "no"
              }
              onChange={(event) =>
                change(
                  "receiving_enabled",
                  event.target.value ===
                    "yes"
                )
              }
            >
              <option value="no">
                Без приёмки
              </option>

              <option value="yes">
                С приёмкой
              </option>
            </select>
          </Field>

          {form.receiving_enabled && (
            <Field label="Приёмка за единицу, ₽">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={
                  form.receiving_unit_price_rub
                }
                onChange={(event) =>
                  change(
                    "receiving_unit_price_rub",
                    event.target.value
                  )
                }
                placeholder="0"
              />
            </Field>
          )}

          <Field
            label="Примечание"
            full
          >
            <textarea
              className="textarea"
              value={form.note}
              onChange={(event) =>
                change(
                  "note",
                  event.target.value
                )
              }
              placeholder="Комментарий к отгрузке"
            />
          </Field>
        </div>

        <div
          className="total-preview"
          style={{ marginTop: 15 }}
        >
          <div className="total-preview-label">
            Итоговая сумма
          </div>

          <div className="total-preview-value">
            {money(totalPreview)}
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   Storage modal
   ========================================================= */

function StorageModal({ clients, defaultClientId, onClose, onSave }) {
  const [form, setForm] = useState({
    client_id: defaultClientId || "", start_date: today(), end_date: today(),
    billing_mode: "m3", volume_m3: "", unit_count: "",
    price_per_m3_day_rub: "", price_per_unit_day_rub: "", total_rub: "", status: "planned", note: "",
  });
  const [saving, setSaving] = useState(false);
  const change = (key, value) => setForm((prev)=>({...prev,[key]:value}));
  useEffect(()=>{
    const days=form.start_date&&form.end_date?daysBetween(form.start_date,form.end_date):0;
    const total=form.billing_mode==="m3" ? Number(form.volume_m3||0)*days*Number(form.price_per_m3_day_rub||0) : Number(form.unit_count||0)*days*Number(form.price_per_unit_day_rub||0);
    setForm(prev=>({...prev,total_rub:total||""}));
  },[form.billing_mode,form.volume_m3,form.unit_count,form.price_per_m3_day_rub,form.price_per_unit_day_rub,form.start_date,form.end_date]);
  const submit=async(e)=>{e.preventDefault();setSaving(true);try{await onSave(form)}finally{setSaving(false)}};
  return <Modal title="Хранение" subtitle="М³ или за единицу" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose} disabled={saving}>Отмена</Button><Button type="submit" form="storage-form" disabled={saving}>{saving?"Сохранение…":"Сохранить"}</Button></>}>
    <form id="storage-form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Клиент *"><select className="select" value={form.client_id} onChange={e=>change("client_id",e.target.value)} required><option value="">Выберите клиента</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Статус"><select className="select" value={form.status} onChange={e=>change("status",e.target.value)}>{STORAGE_STATUSES.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>
        <Field label="Расчёт"><select className="select" value={form.billing_mode} onChange={e=>change("billing_mode",e.target.value)}><option value="m3">По м³</option><option value="unit">За единицу</option></select></Field>
        <Field label="Дата начала *"><input className="input" type="date" value={form.start_date} onChange={e=>change("start_date",e.target.value)} required /></Field>
        <Field label="Дата окончания *"><input className="input" type="date" value={form.end_date} onChange={e=>change("end_date",e.target.value)} required /></Field>
        {form.billing_mode==="m3" ? <><Field label="Объём, м³ *"><input className="input" type="number" min="0.001" step="0.001" value={form.volume_m3} onChange={e=>change("volume_m3",e.target.value)} required /></Field><Field label="Цена за м³ / день, ₽"><input className="input" type="number" min="0" step="0.01" value={form.price_per_m3_day_rub} onChange={e=>change("price_per_m3_day_rub",e.target.value)} /></Field></> : <><Field label="Количество единиц *"><input className="input" type="number" min="1" step="1" value={form.unit_count} onChange={e=>change("unit_count",e.target.value)} required /></Field><Field label="Цена за единицу / день, ₽"><input className="input" type="number" min="0" step="0.01" value={form.price_per_unit_day_rub} onChange={e=>change("price_per_unit_day_rub",e.target.value)} /></Field></>}
        <Field label="Примечание" full><textarea className="textarea" value={form.note} onChange={e=>change("note",e.target.value)} /></Field>
      </div>
      <div className="total-preview" style={{marginTop:15}}><div className="total-preview-label">Итоговая сумма</div><div className="total-preview-value">{money(form.total_rub)}</div></div>
    </form>
  </Modal>;
}

/* =========================================================
   App
   ========================================================= */

function App() {
  const [session, setSession] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [clients, setClients] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [tariffs, setTariffs] =
    useState([]);

  const [shipments, setShipments] =
    useState([]);

  const [storage, setStorage] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  const [page, setPage] =
    useState("dashboard");

  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);

  const [modal, setModal] =
    useState(null);

  const [selectedClientId, setSelectedClientId] =
    useState("");

  const [toast, setToast] =
    useState(null);

  const showToast = (message) => {
    setToast({
      type: "success",
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const showError = (error) => {
    console.error(error);

    const message = [
      error?.message,
      error?.details,
      error?.hint,
      error?.code
        ? `Код: ${error.code}`
        : null,
    ]
      .filter(Boolean)
      .join(" — ") ||
      "Не удалось сохранить данные. Проверьте подключение к Supabase и права доступа.";

    setToast({
      type: "error",
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 7000);
  };

  /* -------------------------------------------------------
     Auth
     ------------------------------------------------------- */

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;

        setSession(data.session);
        setAuthLoading(false);
      })
      .catch((error) => {
        console.error(error);

        if (mounted) {
          setAuthLoading(false);
        }
      });

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  /* -------------------------------------------------------
     Load data
     ------------------------------------------------------- */

  const loadAll = async () => {
    if (!supabase || !session) return;

    setLoading(true);

    try {
      const [
        clientsResult,
        productsResult,
        tariffsResult,
        shipmentsResult,
        storageResult,
        requestsResult,
      ] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("products")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("service_tariffs")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("shipments")
          .select("*")
          .order("shipment_date", {
            ascending: false,
          }),

        supabase
          .from("storage_records")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("cooperation_requests")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),
      ]);

      const namedResults = [
        ["clients", clientsResult],
        ["products", productsResult],
        [
          "service_tariffs",
          tariffsResult,
        ],
        ["shipments", shipmentsResult],
        [
          "storage_records",
          storageResult,
        ],
        [
          "cooperation_requests",
          requestsResult,
        ],
      ];

      const failed = namedResults.find(
        ([, result]) => result.error
      );

      if (failed?.[1]?.error) {
        const error = failed[1].error;

        throw new Error(
          `Не удалось загрузить таблицу ${failed[0]}: ${
            error.message ||
            error.details ||
            "неизвестная ошибка"
          }`
        );
      }

      setClients(
        clientsResult.data || []
      );

      setProducts(
        productsResult.data || []
      );

      setTariffs(
        (tariffsResult.data || []).map((t) => ({
          ...t,
          tariff_type: t.tariff_type || t.service_type || "shipment",
          base_unit_price_rub: t.base_unit_price_rub ?? t.price_rub ?? 0,
        }))
      );

      setShipments(
        shipmentsResult.data || []
      );

      setStorage(
        (storageResult.data || []).map((r) => ({
          ...r,
          billing_mode: Number(r.unit_count || 0) > 0 ? "unit" : "m3",
        }))
      );

      setRequests(
        requestsResult.data || []
      );
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadAll();
    }
  }, [session]);

  /* -------------------------------------------------------
     CRUD
     ------------------------------------------------------- */

  const addClient = async (payload) => {
    try {
      const clientPayload = {
        name: String(
          payload.name || ""
        ).trim(),

        legal_name:
          payload.legal_name || null,

        inn:
          payload.inn || null,

        contact_name:
          payload.contact_name || null,

        phone:
          payload.phone || null,

        email:
          payload.email || null,

        notes:
          payload.notes || null,

        is_active: true,
      };

      if (!clientPayload.name) {
        throw new Error(
          "Укажите название клиента."
        );
      }

      let result = await supabase
        .from("clients")
        .insert(clientPayload)
        .select()
        .single();

      /*
       * Compatibility fallback:
       * older clients table may not contain is_active.
       */
      if (
        result.error &&
        /is_active|column.*does not exist|schema cache/i.test(
          result.error.message || ""
        )
      ) {
        result = await supabase
          .from("clients")
          .insert({
            name: clientPayload.name,
            legal_name:
              clientPayload.legal_name,
            inn: clientPayload.inn,
            contact_name:
              clientPayload.contact_name,
            phone: clientPayload.phone,
            email: clientPayload.email,
            notes: clientPayload.notes,
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        setClients((prev) => [
          result.data,
          ...prev,
        ]);
      }

      setModal(null);

      showToast(
        "Клиент успешно добавлен."
      );
    } catch (error) {
      showError(error);
    }
  };

  const addProduct = async (payload) => {
    try {
      if (!payload.client_id) {
        throw new Error("Выберите клиента.");
      }

      const name = String(payload.name || "").trim();
      if (!name) throw new Error("Укажите название товара.");

      const insertPayload = {
        client_id: payload.client_id,
        name,
        sku: String(payload.sku || "").trim() || null,
        size_type: payload.size_type || null,
        length_cm: payload.length_cm === "" ? null : Number(payload.length_cm),
        width_cm: payload.width_cm === "" ? null : Number(payload.width_cm),
        height_cm: payload.height_cm === "" ? null : Number(payload.height_cm),
        weight_kg: payload.weight_kg === "" ? null : Number(payload.weight_kg),
        notes: payload.notes || null,
        is_active: payload.is_active !== false,
      };

      const { data, error } = await supabase
        .from("products")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      setProducts((prev) => [data, ...prev]);
      setModal(null);
      showToast("Товар успешно добавлен.");
    } catch (error) {
      showError(error);
    }
  };

  const addTariff = async (payload) => {
    try {
      if (!payload.client_id) throw new Error("Выберите клиента.");

      const insertPayload = {
        client_id: payload.client_id,
        product_id: payload.product_id || null,
        service_type: payload.tariff_type === "receiving" ? "receiving" : "shipment",
        price_rub: Number(payload.base_unit_price_rub || 0),
        enabled: true,
        effective_from: payload.effective_from || today(),
        included_weight_kg: Number(payload.included_weight_kg || 0),
        extra_kg_price_rub: Number(payload.extra_kg_price_rub || 0),
      };

      const { data, error } = await supabase
        .from("service_tariffs")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      setTariffs((prev) => [{ ...data, tariff_type: data.service_type, base_unit_price_rub: data.price_rub }, ...prev]);
      setModal(null);
      showToast("Тариф успешно добавлен.");
    } catch (error) {
      showError(error);
    }
  };

  const addShipment = async (payload) => {
    try {
      const quantity =
        Number(payload.quantity);

      const weight =
        Number(
          payload.weight_kg || 0
        );

      const unitPrice =
        Number(
          payload.unit_price_rub || 0
        );

      const total =
        Number(
          payload.total_rub || 0
        );

      if (!payload.client_id) {
        throw new Error(
          "Выберите клиента."
        );
      }

      if (!payload.product_id) {
        throw new Error(
          "Выберите товар."
        );
      }

      if (!payload.shipment_date) {
        throw new Error(
          "Укажите дату отгрузки."
        );
      }

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Количество должно быть больше нуля."
        );
      }

      const extendedPayload = {
        client_id:
          payload.client_id,

        product_id:
          payload.product_id,

        shipment_date:
          payload.shipment_date,

        quantity,

        tariff_type:
          payload.tariff_type ||
          "shipment",

        unit_price_rub:
          unitPrice,

        total_rub:
          total,

        weight_kg:
          weight,

        base_unit_price_rub:
          Number(
            payload.base_unit_price_rub ||
              0
          ),

        included_weight_kg:
          Number(
            payload.included_weight_kg ||
              0
          ),

        extra_kg_price_rub:
          Number(
            payload.extra_kg_price_rub ||
              0
          ),

        extra_kg_rub:
          Number(
            payload.extra_kg_rub || 0
          ),

        receiving_enabled:
          Boolean(
            payload.receiving_enabled
          ),

        receiving_unit_price_rub:
          Number(
            payload.receiving_unit_price_rub ||
              0
          ),

        receiving_total_rub:
          Number(
            payload.receiving_total_rub ||
              0
          ),

        note:
          payload.note || null,

        created_by:
          session?.user?.id || null,
      };

      let result = await supabase
        .from("shipments")
        .insert(extendedPayload)
        .select()
        .single();

      /*
       * Compatibility fallback:
       * if the current Supabase schema is older
       * and does not contain the extended fields.
       */
      if (
        result.error &&
        /column.*does not exist|schema cache|receiving_|base_unit|included_weight|extra_kg|created_by/i.test(
          result.error.message || ""
        )
      ) {
        result = await supabase
          .from("shipments")
          .insert({
            client_id:
              extendedPayload.client_id,

            product_id:
              extendedPayload.product_id,

            shipment_date:
              extendedPayload.shipment_date,

            quantity:
              extendedPayload.quantity,

            tariff_type:
              extendedPayload.tariff_type,

            unit_price_rub:
              extendedPayload.unit_price_rub,

            total_rub:
              extendedPayload.total_rub,

            weight_kg:
              extendedPayload.weight_kg,

            note:
              extendedPayload.note,
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        setShipments((prev) => [
          result.data,
          ...prev,
        ]);
      }

      setModal(null);

      showToast(
        "Отгрузка успешно добавлена."
      );
    } catch (error) {
      showError(error);
    }
  };

  const addStorage = async (payload) => {
    try {
      if (!payload.client_id) throw new Error("Выберите клиента.");
      if (!payload.start_date || !payload.end_date) throw new Error("Укажите период хранения.");
      if (payload.end_date < payload.start_date) throw new Error("Дата окончания не может быть раньше даты начала.");

      const mode = payload.billing_mode === "unit" ? "unit" : "m3";
      const volume = mode === "m3" ? Number(payload.volume_m3 || 0) : 0;
      const units = mode === "unit" ? Math.max(1, Number(payload.unit_count || 0)) : 0;
      const days = daysBetween(payload.start_date, payload.end_date);
      const priceM3 = mode === "m3" ? Number(payload.price_per_m3_day_rub || 0) : 0;
      const priceUnit = mode === "unit" ? Number(payload.price_per_unit_day_rub || 0) : 0;
      const total = mode === "m3" ? volume * days * priceM3 : units * days * priceUnit;

      if (mode === "m3" && volume <= 0) throw new Error("Укажите объём в м³.");
      if (mode === "unit" && units <= 0) throw new Error("Укажите количество единиц.");

      const insertPayload = {
        client_id: payload.client_id,
        volume_m3: volume,
        start_date: payload.start_date,
        end_date: payload.end_date,
        tariff_type: "storage",
        price_per_m3_day_rub: priceM3,
        total_rub: Number(total.toFixed(2)),
        status: payload.status || "planned",
        note: payload.note || null,
        created_by: session?.user?.id || null,
        unit_count: units,
        price_per_unit_day_rub: priceUnit,
      };

      const { data, error } = await supabase
        .from("storage_records")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      setStorage((prev) => [{ ...data, billing_mode: units > 0 ? "unit" : "m3" }, ...prev]);
      setModal(null);
      showToast("Хранение сохранено.");
    } catch (error) {
      showError(error);
    }
  };

  const deleteShipment = async (id) => {
    if (!window.confirm("Удалить эту отгрузку?")) return;
    try {
      const { error } = await supabase.from("shipments").delete().eq("id", id);
      if (error) throw error;
      setShipments((prev) => prev.filter((x) => x.id !== id));
      showToast("Отгрузка удалена.");
    } catch (error) { showError(error); }
  };

  const deleteStorage = async (id) => {
    if (!window.confirm("Удалить эту запись хранения?")) return;
    try {
      const { error } = await supabase.from("storage_records").delete().eq("id", id);
      if (error) throw error;
      setStorage((prev) => prev.filter((x) => x.id !== id));
      showToast("Запись хранения удалена.");
    } catch (error) { showError(error); }
  };

  const deleteClient = async (client) => {
    if (!window.confirm(`Удалить клиента «${client.name}» и все его операции?`)) return;
    try {
      // Удаляем зависимые записи в безопасном порядке.
      const tables = [
        ["cooperation_requests", setRequests],
        ["shipments", setShipments],
        ["storage_records", setStorage],
        ["service_tariffs", setTariffs],
        ["products", setProducts],
      ];
      for (const [table] of tables) {
        const { error } = await supabase.from(table).delete().eq("client_id", client.id);
        if (error) throw error;
      }
      const { error } = await supabase.from("clients").delete().eq("id", client.id);
      if (error) throw error;
      setClients((prev) => prev.filter((x) => x.id !== client.id));
      setRequests((prev) => prev.filter((x) => x.client_id !== client.id));
      setShipments((prev) => prev.filter((x) => x.client_id !== client.id));
      setStorage((prev) => prev.filter((x) => x.client_id !== client.id));
      setTariffs((prev) => prev.filter((x) => x.client_id !== client.id));
      setProducts((prev) => prev.filter((x) => x.client_id !== client.id));
      if (selectedClientId === client.id) setSelectedClientId("");
      showToast("Клиент и его данные удалены.");
    } catch (error) { showError(error); }
  };

  const updateRequest = async (
    id,
    patch
  ) => {
    try {
      const status =
        patch.status;

      const updatePayload = {
        status,

        client_id:
          patch.client_id || null,

        internal_note:
          patch.internal_note || null,
      };

      if (status !== "new") {
        updatePayload.processed_at =
          new Date().toISOString();

        updatePayload.processed_by =
          session?.user?.id || null;
      } else {
        updatePayload.processed_at =
          null;

        updatePayload.processed_by =
          null;
      }

      const {
        data,
        error,
      } = await supabase
        .from("cooperation_requests")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setRequests((prev) =>
        prev.map((x) =>
          x.id === id ? data : x
        )
      );

      showToast(
        "Заявка обновлена."
      );
    } catch (error) {
      showError(error);
    }
  };

  /* -------------------------------------------------------
     Modal helpers
     ------------------------------------------------------- */

  const openClientModal = () =>
    setModal({
      type: "client",
    });

  const openProductModal = (
    clientId = ""
  ) =>
    setModal({
      type: "product",
      clientId,
    });

  const openTariffModal = (
    clientId = ""
  ) =>
    setModal({
      type: "tariff",
      clientId,
    });

  const openShipmentModal = (
    clientId = "",
    productId = ""
  ) =>
    setModal({
      type: "shipment",
      clientId,
      productId,
    });

  const openStorageModal = (
    clientId = ""
  ) =>
    setModal({
      type: "storage",
      clientId,
    });

  /* -------------------------------------------------------
     Navigation
     ------------------------------------------------------- */

  const navItems = [
    {
      id: "dashboard",
      label: "Главная",
      icon: "home",
    },
    {
      id: "clients",
      label: "Клиенты",
      icon: "clients",
    },
    {
      id: "products",
      label: "Товары",
      icon: "products",
    },
    {
      id: "shipments",
      label: "Отгрузка",
      icon: "shipment",
    },
    {
      id: "requests",
      label: "Заявки",
      icon: "requests",
    },
    {
      id: "reports",
      label: "Отчет",
      icon: "report",
    },
  ];

  const navigateTo = (
    nextPage
  ) => {
    setPage(nextPage);
    setMobileNavOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  /* -------------------------------------------------------
     No Supabase configuration
     ------------------------------------------------------- */

  if (!supabase) {
    return (
      <>
        <style>{CSS}</style>

        <div className="login">
          <div className="login-card">
            <div className="login-title">
              SORTEX WMS
            </div>

            <div
              className="error"
              style={{
                marginTop: 15,
              }}
            >
              Не найдены переменные
              окружения Supabase.
              <br />
              <br />
              Проверь файл .env:
              <br />
              VITE_SUPABASE_URL
              <br />
              VITE_SUPABASE_ANON_KEY
            </div>
          </div>
        </div>
      </>
    );
  }

  if (authLoading) {
    return (
      <>
        <style>{CSS}</style>

        <div className="login">
          <div className="login-card">
            <div className="loading">
              Проверка авторизации…
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <style>{CSS}</style>

        <Login
          onLogin={(newSession) =>
            setSession(newSession)
          }
        />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      <div className="app">
        <div
          className={`sidebar-overlay ${
            mobileNavOpen
              ? "visible"
              : ""
          }`}
          onClick={() =>
            setMobileNavOpen(false)
          }
        />

        <aside
          className={`sidebar ${
            mobileNavOpen
              ? "mobile-open"
              : ""
          }`}
        >
          <div className="brand">
            <div className="brand-mark">
              <span />
            </div>

            <div>
              <div className="brand-title">
                SORTEX WMS
              </div>

              <div className="brand-subtitle">
                Warehouse management
              </div>
            </div>
          </div>

          <div className="nav-label">
            Рабочее пространство
          </div>

          <nav className="nav">
            {navItems.map(
              (item) => (
                <button
                  key={item.id}
                  className={`nav-button ${
                    page === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    navigateTo(item.id)
                  }
                >
                  <span className="nav-icon">
                    <Icon
                      type={item.icon}
                    />
                  </span>

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </nav>

          <div className="sidebar-bottom">
            <div className="user-box">
              <div className="user-email">
                {session.user?.email}
              </div>

              <Button
                small
                variant="secondary"
                onClick={logout}
                style={{
                  width: "100%",
                }}
              >
                <Icon type="logout" /> Выйти
              </Button>
            </div>
          </div>
        </aside>

        <main className="main">
          <button
            className="button mobile-nav-toggle"
            onClick={() =>
              setMobileNavOpen(true)
            }
            aria-label="Открыть меню"
          >
            ☰ Меню
          </button>

          {page === "dashboard" && (
            <Dashboard
              clients={clients}
              shipments={shipments}
              storage={storage}
              requests={requests}
              loading={loading}
              onAddShipment={() =>
                openShipmentModal()
              }
              onAddStorage={() =>
                openStorageModal()
              }
              onAddClient={
                openClientModal
              }
              onNavigate={
                navigateTo
              }
            />
          )}

          {page === "clients" && (
            <Clients
              clients={clients}
              products={products}
              tariffs={tariffs}
              shipments={shipments}
              storage={storage}
              loading={loading}
              selectedClientId={
                selectedClientId
              }
              setSelectedClientId={
                setSelectedClientId
              }
              onAddClient={
                openClientModal
              }
              onAddTariff={
                openTariffModal
              }
              onAddShipment={(
                clientId
              ) =>
                openShipmentModal(
                  clientId
                )
              }
              onAddStorage={(
                clientId
              ) =>
                openStorageModal(
                  clientId
                )
              }
              onDeleteClient={deleteClient}
              onDeleteStorage={deleteStorage}
            />
          )}

          {page === "products" && (
            <Products
              products={products}
              clients={clients}
              loading={loading}
              onAddProduct={() =>
                openProductModal()
              }
            />
          )}

          {page === "shipments" && (
            <Shipments
              shipments={shipments}
              clients={clients}
              products={products}
              loading={loading}
              onAddShipment={() =>
                openShipmentModal()
              }
              onDeleteShipment={deleteShipment}
            />
          )}

          {page === "requests" && (
            <Requests
              requests={requests}
              clients={clients}
              loading={loading}
              onUpdateRequest={
                updateRequest
              }
            />
          )}

          {page === "reports" && (
            <Reports
              clients={clients}
              products={products}
              shipments={shipments}
              storage={storage}
              loading={loading}
            />
          )}
        </main>
      </div>

      {modal?.type === "client" && (
        <ClientModal
          onClose={() =>
            setModal(null)
          }
          onSave={addClient}
        />
      )}

      {modal?.type === "product" && (
        <ProductModal
          clients={clients}
          defaultClientId={
            modal.clientId
          }
          onClose={() =>
            setModal(null)
          }
          onSave={addProduct}
        />
      )}

      {modal?.type === "tariff" && (
        <TariffModal
          clients={clients}
          products={products}
          defaultClientId={
            modal.clientId
          }
          onClose={() =>
            setModal(null)
          }
          onSave={addTariff}
        />
      )}

      {modal?.type === "shipment" && (
        <ShipmentModal
          clients={clients}
          products={products}
          tariffs={tariffs}
          defaultClientId={
            modal.clientId
          }
          defaultProductId={
            modal.productId
          }
          onClose={() =>
            setModal(null)
          }
          onSave={addShipment}
        />
      )}

      {modal?.type === "storage" && (
        <StorageModal
          clients={clients}
          defaultClientId={
            modal.clientId
          }
          onClose={() =>
            setModal(null)
          }
          onSave={addStorage}
        />
      )}

      {toast && (
        <div className="toast-container">
          <div
            className={`toast ${
              toast.type === "error"
                ? "error-toast"
                : ""
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   Start application
   ========================================================= */

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Не найден элемент <div id="root"></div> в index.html'
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);