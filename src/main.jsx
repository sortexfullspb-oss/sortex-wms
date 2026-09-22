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
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("В выбранном периоде нет данных для сохранения отчета.");
  }

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
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Do not revoke the object URL immediately: some browsers cancel
  // the download when it is revoked in the same tick.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
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
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
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
  z-index: 20;
}

.sidebar.collapsed {
  width: 78px;
  padding: 14px 10px;
}

.sidebar.collapsed .brand {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar.collapsed .brand > div:last-child,
.sidebar.collapsed .nav-label,
.sidebar.collapsed .nav-button span:last-child,
.sidebar.collapsed .user-email {
  display: none;
}

.sidebar.collapsed .nav-button {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar-toggle {
  position: absolute;
  top: 18px;
  right: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--gold-line);
  background: var(--panel-2);
  color: var(--gold-2);
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 3;
  box-shadow: var(--shadow);
}

.mobile-nav-toggle {
  display: none;
}

.sidebar-overlay {
  display: none;
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
  transition: margin-left .2s ease, width .2s ease;
}

.main.sidebar-collapsed {
  width: calc(100% - 114px);
  margin-left: 114px;
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
  overflow-x: auto;
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
  z-index: 100;
  background: rgba(0,0,0,.66);
  backdrop-filter: blur(7px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
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
  width: 32px;
  height: 32px;
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
  right: 20px;
  bottom: 20px;
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


@media (max-width: 960px) {
  .mobile-nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar {
    left: 10px;
    top: 10px;
    bottom: 10px;
    transform: translateX(-120%);
    transition: transform .2s ease;
    width: min(280px, calc(100vw - 30px));
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: min(280px, calc(100vw - 30px));
    padding: 20px;
  }

  .sidebar.collapsed .brand > div:last-child,
  .sidebar.collapsed .nav-label,
  .sidebar.collapsed .nav-button span:last-child,
  .sidebar.collapsed .user-email {
    display: block;
  }

  .sidebar.collapsed .nav-button {
    justify-content: flex-start;
    padding-left: 12px;
    padding-right: 12px;
  }

  .sidebar-overlay.visible {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    z-index: 15;
  }

  .main,
  .main.sidebar-collapsed {
    width: auto;
    margin-left: 0;
    padding: 18px 12px 30px;
  }
}

@media (max-width: 1100px) {
  .grid-4 {
    grid-template-columns: repeat(2, minmax(0,1fr));
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .sidebar {
    position: static;
    width: auto;
    margin: 10px;
    height: auto;
  }

  .app {
    display: block;
  }

  .main {
    width: auto;
    margin-left: 0;
    padding: 18px 12px 30px;
  }

  .grid-3,
  .grid-2,
  .form-grid,
  .form-grid-3,
  .report-summary,
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .grid-4 {
    grid-template-columns: 1fr 1fr;
  }

  .topbar {
    flex-direction: column;
  }

  .top-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 520px) {
  .grid-4 {
    grid-template-columns: 1fr;
  }

  .sidebar {
    margin: 8px;
  }

  .main {
    padding-left: 8px;
    padding-right: 8px;
  }

  .page-title {
    font-size: 23px;
  }
}

@media print {
  body {
    background: white;
    color: black;
  }

  .sidebar,
  .top-actions,
  .no-print,
  .button,
  .modal-backdrop {
    display: none !important;
  }

  .main {
    margin: 0;
    width: 100%;
    padding: 0;
  }

  .card {
    box-shadow: none;
    border-color: #ddd;
    background: white;
  }

  .print-only {
    display: block;
  }

  td,
  th {
    color: black;
    border-color: #ddd;
  }
}
`;

/* =========================================================
   Icons
   ========================================================= */

function Icon({ type }) {
  const paths = {
    home: "M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6",
    clients:
      "M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6",
    products:
      "M4 7h16M6 3h12v18H6zM9 11h6M9 15h6M9 19h3",
    shipment:
      "M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    requests:
      "M4 4h16v14H7l-3 3V4ZM8 8h8M8 12h6",
    report:
      "M4 19V5M4 19h17M8 16v-4M12 16V8M16 16v-6M20 16v-9",
    plus: "M12 5v14M5 12h14",
    logout:
      "M10 17l5-5-5-5M15 12H3M21 5v14M17 3h4v18h-4",
    search:
      "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM16 16l5 5",
    close: "M6 6l12 12M18 6 6 18",
    storage:
      "M4 5h16v14H4zM7 8h10M7 12h10M7 16h6",
    refresh:
      "M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4",
  };

  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type] || paths.home} />
    </svg>
  );
}

/* =========================================================
   Generic UI
   ========================================================= */

function Button({ children, onClick, variant = "", small = false, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`button ${variant} ${small ? "small" : ""}`}
      onClick={onClick}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

function Modal({ title, subtitle, onClose, children, footer, large = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`modal ${large ? "large" : ""}`}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button className="close" onClick={onClose}>
            <Icon type="close" />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ value, request = false }) {
  let label = value;

  if (request) {
    label =
      REQUEST_STATUSES.find((x) => x.value === value)?.label || value;
  } else {
    label =
      [
        ...OPERATION_STATUSES,
        ...STORAGE_STATUSES,
        ...TARIFF_TYPES,
      ].find((x) => x.value === value)?.label || value;
  }

  let cls = "gray";

  if (["active", "completed", "contacted"].includes(value)) cls = "green";
  if (["cancelled", "closed"].includes(value)) cls = "red";
  if (["new", "planned", "in_progress"].includes(value)) cls = "gold";

  return <span className={`badge ${cls}`}>{label}</span>;
}

function Loading() {
  return <div className="loading">Загрузка данных…</div>;
}

function Empty({ text = "Нет данных" }) {
  return <div className="empty">{text}</div>;
}

/* =========================================================
   Login
   ========================================================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!supabase) {
      setError("Не настроены VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setError("");
    setLoading(true);

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    onLogin(data.session);
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <span />
          </div>
          <div>
            <div className="brand-title">SORTEX WMS</div>
            <div className="brand-subtitle">Warehouse management</div>
          </div>
        </div>

        <div className="login-title">Вход в систему</div>
        <div className="login-subtitle">
          Закрытая административная панель SORTEX.
        </div>

        <form onSubmit={submit} style={{ marginTop: 25 }}>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label className="form-label">Пароль</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="error" style={{ marginTop: 13 }}>
              {error}
            </div>
          )}

          <button
            className="button"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 16 }}
          >
            {loading ? "Вход…" : "Войти"}
          </button>
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

  const monthShipments = shipments.filter(
    (x) => x.shipment_date >= monthStart
  );

  const monthStorage = storage.filter(
    (x) => x.start_date <= today() && x.end_date >= monthStart
  );

  const shipmentRevenue = monthShipments.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const storageRevenue = monthStorage.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const activeClients = clients.filter((x) => x.is_active).length;

  const newRequests = requests.filter((x) => x.status === "new").length;

  if (loading) return <Loading />;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Главная</h1>
          <div className="page-subtitle">
            Операционный центр SORTEX WMS
          </div>
        </div>

        <div className="top-actions">
          <Button onClick={onAddClient}>
            <Icon type="plus" /> Клиент
          </Button>
          <Button onClick={onAddShipment}>
            <Icon type="plus" /> Отгрузка
          </Button>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi">
          <div className="kpi-label">Оборот за месяц</div>
          <div className="kpi-value">
            {money(shipmentRevenue + storageRevenue)}
          </div>
          <div className="kpi-foot">Отгрузки + хранение</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Активные клиенты</div>
          <div className="kpi-value">{activeClients}</div>
          <div className="kpi-foot">В базе клиентов</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Отгрузки</div>
          <div className="kpi-value">{monthShipments.length}</div>
          <div className="kpi-foot">С начала месяца</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Новые заявки</div>
          <div className="kpi-value">{newRequests}</div>
          <div className="kpi-foot">Требуют обработки</div>
        </div>
      </div>

      <div className="section card">
        <div className="section-header">
          <div>
            <div className="section-title">Быстрые действия</div>
            <div className="section-subtitle">
              Основные операции склада
            </div>
          </div>
        </div>

        <div className="section-body">
          <div className="quick-actions">
            <button className="quick-action" onClick={onAddShipment}>
              <div className="quick-action-title">Новая отгрузка</div>
              <div className="quick-action-sub">
                Рассчитать и сохранить услугу
              </div>
            </button>

            <button className="quick-action" onClick={onAddStorage}>
              <div className="quick-action-title">Новое хранение</div>
              <div className="quick-action-sub">
                м³ или количество единиц
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() => onNavigate("requests")}
            >
              <div className="quick-action-title">Заявки</div>
              <div className="quick-action-sub">
                Проверить входящие обращения
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-2 section">
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Последние отгрузки</div>
              <div className="section-subtitle">Операции</div>
            </div>
            <Button small variant="secondary" onClick={() => onNavigate("shipments")}>
              Все
            </Button>
          </div>

          <div className="section-body" style={{ padding: 0 }}>
            {shipments.length === 0 ? (
              <Empty />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Клиент</th>
                      <th>Количество</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.slice(0, 5).map((x) => (
                      <tr key={x.id}>
                        <td>{formatDate(x.shipment_date)}</td>
                        <td>{x.client_name || "—"}</td>
                        <td>{number(x.quantity)}</td>
                        <td className="gold bold">{money(x.total_rub)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Новые заявки</div>
              <div className="section-subtitle">Входящие обращения</div>
            </div>
            <Button small variant="secondary" onClick={() => onNavigate("requests")}>
              Все
            </Button>
          </div>

          <div className="section-body" style={{ padding: 0 }}>
            {requests.length === 0 ? (
              <Empty />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Имя</th>
                      <th>Компания</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 5).map((x) => (
                      <tr key={x.id}>
                        <td>{formatDate(x.created_at)}</td>
                        <td>{x.name}</td>
                        <td>{x.company_name || "—"}</td>
                        <td>
                          <StatusBadge value={x.status} request />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
}) {
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return clients;

    return clients.filter((x) =>
      [
        x.name,
        x.legal_name,
        x.inn,
        x.contact_name,
        x.phone,
        x.email,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [clients, search]);

  const selectedClient =
    clients.find((x) => x.id === selectedClientId) ||
    filteredClients[0] ||
    clients[0];

  useEffect(() => {
    if (!selectedClientId && clients[0]) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId, setSelectedClientId]);

  const clientProducts = products.filter(
    (x) => x.client_id === selectedClient?.id
  );

  const clientTariffs = tariffs.filter(
    (x) => x.client_id === selectedClient?.id
  );

  const clientShipments = shipments.filter(
    (x) => x.client_id === selectedClient?.id
  );

  const clientStorage = storage.filter(
    (x) => x.client_id === selectedClient?.id
  );

  const shipmentTotal = clientShipments.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const storageTotal = clientStorage.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Клиенты</h1>
          <div className="page-subtitle">
            Клиенты, товары и персональные тарифы
          </div>
        </div>

        <div className="top-actions">
          <div className="search">
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск клиента…"
            />
          </div>
          <Button onClick={onAddClient}>
            <Icon type="plus" /> Добавить
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="detail-layout">
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Список клиентов</div>
                <div className="section-subtitle">
                  {filteredClients.length} клиентов
                </div>
              </div>
            </div>

            <div className="client-list">
              {filteredClients.length === 0 ? (
                <Empty text="Клиенты не найдены" />
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    className={`client-item ${
                      selectedClient?.id === client.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <div className="client-name">{client.name}</div>
                    <div className="client-meta">
                      {client.inn || client.phone || "Без реквизитов"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="grid" style={{ alignContent: "start" }}>
            {!selectedClient ? (
              <div className="card">
                <Empty text="Выберите клиента" />
              </div>
            ) : (
              <>
                <div className="card">
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
                      <Button
                        small
                        onClick={() =>
                          onAddShipment(selectedClient.id)
                        }
                      >
                        + Отгрузка
                      </Button>
                      <Button
                        small
                        onClick={() =>
                          onAddStorage(selectedClient.id)
                        }
                      >
                        + Хранение
                      </Button>
                    </div>
                  </div>

                  <div className="section-body">
                    <div className="grid grid-3">
                      <div>
                        <div className="muted" style={{ fontSize: 11 }}>
                          Контакт
                        </div>
                        <div style={{ marginTop: 5 }}>
                          {selectedClient.contact_name || "—"}
                        </div>
                      </div>

                      <div>
                        <div className="muted" style={{ fontSize: 11 }}>
                          Телефон
                        </div>
                        <div style={{ marginTop: 5 }}>
                          {selectedClient.phone || "—"}
                        </div>
                      </div>

                      <div>
                        <div className="muted" style={{ fontSize: 11 }}>
                          Email
                        </div>
                        <div style={{ marginTop: 5 }}>
                          {selectedClient.email || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-3" style={{ marginTop: 18 }}>
                      <div className="report-box">
                        <div className="report-box-label">
                          Отгрузки
                        </div>
                        <div className="report-box-value">
                          {money(shipmentTotal)}
                        </div>
                      </div>

                      <div className="report-box">
                        <div className="report-box-label">
                          Хранение
                        </div>
                        <div className="report-box-value">
                          {money(storageTotal)}
                        </div>
                      </div>

                      <div className="report-box">
                        <div className="report-box-label">
                          Всего операций
                        </div>
                        <div className="report-box-value">
                          {clientShipments.length +
                            clientStorage.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="section-header">
                    <div>
                      <div className="section-title">Товары</div>
                      <div className="section-subtitle">
                        {clientProducts.length} позиций
                      </div>
                    </div>
                  </div>

                  <div className="section-body" style={{ padding: 0 }}>
                    {clientProducts.length === 0 ? (
                      <Empty text="У клиента пока нет товаров" />
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Название</th>
                              <th>Размер</th>
                              <th>Вес</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientProducts.map((p) => (
                              <tr key={p.id}>
                                <td className="gold">{p.sku}</td>
                                <td>{p.name}</td>
                                <td>
                                  {p.length_cm &&
                                  p.width_cm &&
                                  p.height_cm
                                    ? `${p.length_cm} × ${p.width_cm} × ${p.height_cm} см`
                                    : "—"}
                                </td>
                                <td>
                                  {p.weight_kg
                                    ? `${number(p.weight_kg)} кг`
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="section-header">
                    <div>
                      <div className="section-title">Тарифы</div>
                      <div className="section-subtitle">
                        Тарифы клиента
                      </div>
                    </div>

                    <Button
                      small
                      onClick={() =>
                        onAddTariff(selectedClient.id)
                      }
                    >
                      <Icon type="plus" /> Тариф
                    </Button>
                  </div>

                  <div className="section-body" style={{ padding: 0 }}>
                    {clientTariffs.length === 0 ? (
                      <Empty text="Тарифы ещё не добавлены" />
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Услуга</th>
                              <th>Товар</th>
                              <th>Цена</th>
                              <th>Включённый вес</th>
                              <th>Доп. кг</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientTariffs.map((t) => {
                              const product = products.find(
                                (p) => p.id === t.product_id
                              );

                              return (
                                <tr key={t.id}>
                                  <td>
                                    {SERVICE_TYPES.find(
                                      (s) =>
                                        s.value === t.service_type
                                    )?.label || t.service_type}
                                  </td>
                                  <td>
                                    {product?.name ||
                                      (t.product_id
                                        ? "Товар"
                                        : "Для клиента")}
                                  </td>
                                  <td className="gold bold">
                                    {money(t.price_rub)}
                                  </td>
                                  <td>
                                    {number(t.included_weight_kg)} кг
                                  </td>
                                  <td>
                                    {money(t.extra_kg_price_rub)}
                                  </td>
                                </tr>
                              );
                            })}
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
      )}
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

  const filtered = products.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      p.sku?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      clients
        .find((c) => c.id === p.client_id)
        ?.name?.toLowerCase()
        .includes(q)
    );
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Товары</h1>
          <div className="page-subtitle">
            Товары клиентов и параметры хранения
          </div>
        </div>

        <div className="top-actions">
          <div className="search">
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SKU, название, клиент…"
            />
          </div>

          <Button onClick={onAddProduct}>
            <Icon type="plus" /> Товар
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty text="Товары не найдены" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Название</th>
                  <th>Клиент</th>
                  <th>Габариты</th>
                  <th>Объём</th>
                  <th>Вес</th>
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => {
                  const client = clients.find(
                    (c) => c.id === p.client_id
                  );

                  const volume =
                    Number(p.length_cm || 0) *
                    Number(p.width_cm || 0) *
                    Number(p.height_cm || 0) /
                    1000000;

                  return (
                    <tr key={p.id}>
                      <td className="gold bold">{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{client?.name || "—"}</td>
                      <td>
                        {p.length_cm &&
                        p.width_cm &&
                        p.height_cm
                          ? `${p.length_cm} × ${p.width_cm} × ${p.height_cm} см`
                          : "—"}
                      </td>
                      <td>
                        {volume
                          ? `${number(volume)} м³`
                          : "—"}
                      </td>
                      <td>
                        {p.weight_kg
                          ? `${number(p.weight_kg)} кг`
                          : "—"}
                      </td>
                      <td>
                        {p.is_active ? (
                          <StatusBadge value="active" />
                        ) : (
                          <StatusBadge value="cancelled" />
                        )}
                      </td>
                    </tr>
                  );
                })}
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
}) {
  const [search, setSearch] = useState("");

  const filtered = shipments.filter((s) => {
    const client = clients.find((c) => c.id === s.client_id);
    const product = products.find((p) => p.id === s.product_id);
    const q = search.toLowerCase().trim();

    if (!q) return true;

    return (
      client?.name?.toLowerCase().includes(q) ||
      product?.name?.toLowerCase().includes(q) ||
      product?.sku?.toLowerCase().includes(q) ||
      s.shipment_date?.includes(q)
    );
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Отгрузка</h1>
          <div className="page-subtitle">
            Отгрузки, приёмка и стоимость услуг
          </div>
        </div>

        <div className="top-actions">
          <div className="search">
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск…"
            />
          </div>

          <Button onClick={() => onAddShipment()}>
            <Icon type="plus" /> Новая отгрузка
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty text="Отгрузок пока нет" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Товар</th>
                  <th>Количество</th>
                  <th>Вес</th>
                  <th>Тариф</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => {
                  const client = clients.find(
                    (c) => c.id === s.client_id
                  );

                  const product = products.find(
                    (p) => p.id === s.product_id
                  );

                  return (
                    <tr key={s.id}>
                      <td>{formatDate(s.shipment_date)}</td>
                      <td>{client?.name || "—"}</td>
                      <td>
                        <div>{product?.name || "—"}</div>
                        {product?.sku && (
                          <div className="muted" style={{ fontSize: 10 }}>
                            {product.sku}
                          </div>
                        )}
                      </td>
                      <td>{number(s.quantity)}</td>
                      <td>
                        {s.weight_kg
                          ? `${number(s.weight_kg)} кг`
                          : "—"}
                      </td>
                      <td>
                        <StatusBadge value={s.tariff_type} />
                      </td>
                      <td className="gold bold">
                        {money(s.total_rub)}
                      </td>
                      <td>
                        <StatusBadge value={s.status} />
                      </td>
                    </tr>
                  );
                })}
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
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Заявки</h1>
          <div className="page-subtitle">
            Входящие заявки на сотрудничество
          </div>
        </div>

        <div className="toolbar">
          <select
            className="select"
            style={{ width: 170 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Все статусы</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty text="Заявок нет" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Имя</th>
                  <th>Компания</th>
                  <th>Телефон</th>
                  <th>Клиент</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const client = clients.find(
                    (c) => c.id === r.client_id
                  );

                  return (
                    <tr key={r.id}>
                      <td>{formatDate(r.created_at)}</td>
                      <td>{r.name}</td>
                      <td>{r.company_name || "—"}</td>
                      <td>{r.phone}</td>
                      <td>{client?.name || "—"}</td>
                      <td>
                        <StatusBadge value={r.status} request />
                      </td>
                      <td>
                        <Button
                          small
                          variant="secondary"
                          onClick={() => setSelected(r)}
                        >
                          Открыть
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <RequestModal
          request={selected}
          clients={clients}
          onClose={() => setSelected(null)}
          onSave={async (id, patch) => {
            await onUpdateRequest(id, patch);
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function RequestModal({
  request,
  clients,
  onClose,
  onSave,
}) {
  const [status, setStatus] = useState(request.status || "new");
  const [clientId, setClientId] = useState(request.client_id || "");
  const [note, setNote] = useState(request.internal_note || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    await onSave(request.id, {
      status,
      client_id: clientId || null,
      internal_note: note || null,
    });

    setSaving(false);
  };

  return (
    <Modal
      title="Заявка"
      subtitle={`Создана ${formatDate(request.created_at)}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </>
      }
    >
      <div className="grid grid-2">
        <div className="stat-line">
          <span>Имя</span>
          <span>{request.name}</span>
        </div>

        <div className="stat-line">
          <span>Компания</span>
          <span>{request.company_name || "—"}</span>
        </div>

        <div className="stat-line">
          <span>Телефон</span>
          <span>{request.phone}</span>
        </div>

        <div className="stat-line">
          <span>Email</span>
          <span>{request.email || "—"}</span>
        </div>
      </div>

      {request.message && (
        <div
          style={{
            marginTop: 17,
            padding: 13,
            borderRadius: 12,
            background: "rgba(255,255,255,.025)",
            color: "var(--muted)",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          {request.message}
        </div>
      )}

      <div className="form-grid" style={{ marginTop: 18 }}>
        <div className="form-field">
          <label className="form-label">Статус</label>
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {REQUEST_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Привязать клиента</label>
          <select
            className="select"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Не привязывать</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field full">
          <label className="form-label">Внутренняя заметка</label>
          <textarea
            className="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Заметка только для администратора…"
          />
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Reports
   ========================================================= */

function Reports({
  clients,
  shipments,
  storage,
  loading,
  onNotify,
}) {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const [clientId, setClientId] = useState("");

  const operations = useMemo(() => {
    const shipmentRows = shipments
      .filter((x) => {
        const okDate =
          x.shipment_date >= from && x.shipment_date <= to;
        const okClient =
          !clientId || x.client_id === clientId;

        return okDate && okClient;
      })
      .map((x) => {
        const client = clients.find(
          (c) => c.id === x.client_id
        );

        return {
          type: "Отгрузка",
          date: x.shipment_date,
          client: client?.name || "—",
          description: `Отгрузка × ${x.quantity}`,
          amount: Number(x.total_rub || 0),
          id: x.id,
        };
      });

    const storageRows = storage
      .filter((x) => {
        const okDate =
          x.start_date <= to && x.end_date >= from;
        const okClient =
          !clientId || x.client_id === clientId;

        return okDate && okClient;
      })
      .map((x) => {
        const client = clients.find(
          (c) => c.id === x.client_id
        );

        return {
          type: "Хранение",
          date: x.start_date,
          client: client?.name || "—",
          description: `${number(x.volume_m3)} м³ / ${number(
            x.unit_count
          )} ед.`,
          amount: Number(x.total_rub || 0),
          id: x.id,
        };
      });

    return [...shipmentRows, ...storageRows].sort((a, b) =>
      String(b.date).localeCompare(String(a.date))
    );
  }, [shipments, storage, clients, from, to, clientId]);

  const total = operations.reduce(
    (sum, x) => sum + x.amount,
    0
  );

  const shipmentTotal = operations
    .filter((x) => x.type === "Отгрузка")
    .reduce((sum, x) => sum + x.amount, 0);

  const storageTotal = operations
    .filter((x) => x.type === "Хранение")
    .reduce((sum, x) => sum + x.amount, 0);

  const exportReport = () => {
    try {
      if (!from || !to || from > to) {
        throw new Error("Проверьте период отчета: дата начала не может быть позже даты окончания.");
      }

      const rows = operations.map((x) => ({
        Дата: formatDate(x.date),
        Тип: x.type,
        Клиент: x.client,
        Операция: x.description,
        Сумма: Number(x.amount || 0).toFixed(2),
        Валюта: "RUB",
      }));

      downloadCSV(`sortex-report-${from}-${to}.csv`, rows);
      onNotify?.(`Отчет сохранен: ${rows.length} строк.`);
    } catch (error) {
      console.error(error);
      onNotify?.(error?.message || "Не удалось сохранить отчет.", "error");
    }
  };

  return (
    <>
      <div className="topbar no-print">
        <div>
          <h1 className="page-title">Отчет</h1>
          <div className="page-subtitle">
            Отчет по операциям за выбранный период
          </div>
        </div>

        <div className="top-actions">
          <Button variant="secondary" onClick={() => window.print()}>
            Печать / PDF
          </Button>
          <Button onClick={exportReport} disabled={loading || operations.length === 0}>
            Сохранить отчет CSV
          </Button>
        </div>
      </div>

      <div className="card no-print">
        <div className="section-body">
          <div className="form-grid-3">
            <div className="form-field">
              <label className="form-label">С даты</label>
              <input
                className="input"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">По дату</label>
              <input
                className="input"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Клиент</label>
              <select
                className="select"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Все клиенты</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="report-summary section">
            <div className="report-box">
              <div className="report-box-label">
                Всего
              </div>
              <div className="report-box-value gold">
                {money(total)}
              </div>
            </div>

            <div className="report-box">
              <div className="report-box-label">
                Отгрузки
              </div>
              <div className="report-box-value">
                {money(shipmentTotal)}
              </div>
            </div>

            <div className="report-box">
              <div className="report-box-label">
                Хранение
              </div>
              <div className="report-box-value">
                {money(storageTotal)}
              </div>
            </div>
          </div>

          <div className="card section">
            <div className="section-header">
              <div>
                <div className="section-title">
                  Операции
                </div>
                <div className="section-subtitle">
                  {formatDate(from)} — {formatDate(to)}
                </div>
              </div>
            </div>

            {operations.length === 0 ? (
              <Empty text="За выбранный период операций нет" />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Тип</th>
                      <th>Клиент</th>
                      <th>Операция</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((x) => (
                      <tr key={`${x.type}-${x.id}`}>
                        <td>{formatDate(x.date)}</td>
                        <td>{x.type}</td>
                        <td>{x.client}</td>
                        <td>{x.description}</td>
                        <td className="gold bold">
                          {money(x.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="print-only">
            <h2>SORTEX WMS — Отчет</h2>
            <p>
              Период: {formatDate(from)} — {formatDate(to)}
            </p>
            <p>Всего: {money(total)}</p>
          </div>
        </>
      )}
    </>
  );
}

/* =========================================================
   Client Modal
   ========================================================= */

function ClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    legal_name: "",
    inn: "",
    contact_name: "",
    phone: "",
    email: "",
    notes: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [clientProducts, setClientProducts] = useState([]);

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addClientProduct = () => {
    setClientProducts((prev) => [
      ...prev,
      { sku: "", name: "", price_rub: "" },
    ]);
  };

  const updateClientProduct = (index, key, value) => {
    setClientProducts((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  const removeClientProduct = (index) => {
    setClientProducts((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const save = async () => {
    if (!form.name.trim()) return;

    const invalidProduct = clientProducts.some(
      (item) =>
        !item.sku.trim() ||
        !item.name.trim() ||
        !Number.isFinite(Number(item.price_rub)) ||
        Number(item.price_rub) < 0
    );

    if (invalidProduct) return;

    setSaving(true);
    await onSave({
      ...form,
      name: form.name.trim(),
      legal_name: form.legal_name || null,
      inn: form.inn || null,
      contact_name: form.contact_name || null,
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
      client_products: clientProducts.map((item) => ({
        sku: item.sku.trim(),
        name: item.name.trim(),
        price_rub: Number(item.price_rub),
      })),
    });
    setSaving(false);
  };

  return (
    <Modal
      title="Новый клиент"
      subtitle="Добавление клиента в SORTEX WMS"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Создать клиента"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Название *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ООО Клиент"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Юридическое название</label>
          <input
            className="input"
            value={form.legal_name}
            onChange={(e) => set("legal_name", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">ИНН</label>
          <input
            className="input"
            value={form.inn}
            onChange={(e) => set("inn", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Контактное лицо</label>
          <input
            className="input"
            value={form.contact_name}
            onChange={(e) =>
              set("contact_name", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Телефон</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="form-field full">
          <div className="section-header" style={{ marginBottom: 10 }}>
            <div>
              <div className="form-label" style={{ marginBottom: 3 }}>Товары клиента</div>
              <div className="muted" style={{ fontSize: 12 }}>
                Выберите название товара и задайте стоимость этого товара.
              </div>
            </div>
            <Button small type="button" onClick={addClientProduct}>
              + Товар
            </Button>
          </div>

          {clientProducts.length === 0 ? (
            <div className="empty" style={{ padding: 16 }}>
              Товары можно добавить сразу при создании клиента.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {clientProducts.map((item, index) => (
                <div
                  key={index}
                  className="card"
                  style={{ padding: 12, boxShadow: "none" }}
                >
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label className="form-label">SKU *</label>
                      <input
                        className="input"
                        value={item.sku}
                        onChange={(e) =>
                          updateClientProduct(index, "sku", e.target.value)
                        }
                        placeholder="SKU-001"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Название товара *</label>
                      <input
                        className="input"
                        value={item.name}
                        onChange={(e) =>
                          updateClientProduct(index, "name", e.target.value)
                        }
                        placeholder="Название товара"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Сумма за товар, ₽ *</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price_rub}
                        onChange={(e) =>
                          updateClientProduct(index, "price_rub", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button
                    small
                    variant="secondary"
                    type="button"
                    onClick={() => removeClientProduct(index)}
                    style={{ marginTop: 8 }}
                  >
                    Удалить товар
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-field full">
          <label className="form-label">Заметки</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Product Modal
   ========================================================= */

function ProductModal({
  clients,
  defaultClientId = "",
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    client_id: defaultClientId,
    sku: "",
    name: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    weight_kg: "",
    notes: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.client_id || !form.sku.trim() || !form.name.trim()) {
      return;
    }

    setSaving(true);

    await onSave({
      client_id: form.client_id,
      sku: form.sku.trim(),
      name: form.name.trim(),
      length_cm: form.length_cm
        ? Number(form.length_cm)
        : null,
      width_cm: form.width_cm
        ? Number(form.width_cm)
        : null,
      height_cm: form.height_cm
        ? Number(form.height_cm)
        : null,
      weight_kg: form.weight_kg
        ? Number(form.weight_kg)
        : null,
      notes: form.notes || null,
      is_active: true,
    });

    setSaving(false);
  };

  return (
    <Modal
      title="Новый товар"
      subtitle="Добавление товара клиента"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Создать товар"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field full">
          <label className="form-label">Клиент *</label>
          <select
            className="select"
            value={form.client_id}
            onChange={(e) =>
              set("client_id", e.target.value)
            }
          >
            <option value="">Выберите клиента</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">SKU *</label>
          <input
            className="input"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            placeholder="SKU-001"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Название *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Товар"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Длина, см</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.length_cm}
            onChange={(e) =>
              set("length_cm", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Ширина, см</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.width_cm}
            onChange={(e) =>
              set("width_cm", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Высота, см</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.height_cm}
            onChange={(e) =>
              set("height_cm", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Вес, кг</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.001"
            value={form.weight_kg}
            onChange={(e) =>
              set("weight_kg", e.target.value)
            }
          />
        </div>

        <div className="form-field full">
          <label className="form-label">Заметки</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Tariff Modal
   ========================================================= */

function TariffModal({
  clients,
  products,
  defaultClientId = "",
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    client_id: defaultClientId,
    product_id: "",
    service_type: "shipment",
    price_rub: "",
    included_weight_kg: "1",
    extra_kg_price_rub: "8",
    effective_from: today(),
    notes: "",
    enabled: true,
  });

  const [saving, setSaving] = useState(false);

  const clientProducts = products.filter(
    (p) => p.client_id === form.client_id
  );

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.client_id || !form.price_rub) return;

    setSaving(true);

    await onSave({
      client_id: form.client_id,
      product_id: form.product_id || null,
      service_type: form.service_type,
      price_rub: Number(form.price_rub),
      enabled: true,
      effective_from: form.effective_from || today(),
      effective_to: null,
      notes: form.notes || null,
      included_weight_kg: Number(
        form.included_weight_kg || 1
      ),
      extra_kg_price_rub: Number(
        form.extra_kg_price_rub || 8
      ),
    });

    setSaving(false);
  };

  return (
    <Modal
      title="Новый тариф"
      subtitle="Тариф клиента в рублях"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Создать тариф"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field full">
          <label className="form-label">Клиент *</label>
          <select
            className="select"
            value={form.client_id}
            onChange={(e) => {
              set("client_id", e.target.value);
              set("product_id", "");
            }}
          >
            <option value="">Выберите клиента</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Услуга *</label>
          <select
            className="select"
            value={form.service_type}
            onChange={(e) =>
              set("service_type", e.target.value)
            }
          >
            {SERVICE_TYPES.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Товар</label>
          <select
            className="select"
            value={form.product_id}
            onChange={(e) =>
              set("product_id", e.target.value)
            }
            disabled={!form.client_id}
          >
            <option value="">Для всего клиента</option>
            {clientProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Цена, ₽ *</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.price_rub}
            onChange={(e) =>
              set("price_rub", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Включённый вес, кг
          </label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.001"
            value={form.included_weight_kg}
            onChange={(e) =>
              set("included_weight_kg", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Дополнительный кг, ₽
          </label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.extra_kg_price_rub}
            onChange={(e) =>
              set("extra_kg_price_rub", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Действует с
          </label>
          <input
            className="input"
            type="date"
            value={form.effective_from}
            onChange={(e) =>
              set("effective_from", e.target.value)
            }
          />
        </div>

        <div className="form-field full">
          <label className="form-label">Заметки</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Shipment Modal
   ========================================================= */

function ShipmentModal({
  clients,
  products,
  tariffs,
  defaultClientId = "",
  defaultProductId = "",
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    client_id: defaultClientId,
    product_id: defaultProductId,
    shipment_date: today(),
    quantity: "1",
    tariff_type: "shipment",
    tariff_id: "",
    weight_kg: "",
    receiving_enabled: false,
    receiving_unit_price_rub: "5",
    note: "",
  });

  const [saving, setSaving] = useState(false);

  const clientProducts = products.filter(
    (p) => p.client_id === form.client_id
  );

  const clientTariffs = tariffs.filter(
    (t) =>
      t.client_id === form.client_id &&
      t.service_type === "shipment" &&
      t.enabled !== false &&
      (!t.product_id || t.product_id === form.product_id)
  );

  const selectedTariff = tariffs.find(
    (t) => t.id === form.tariff_id
  );

  const quantity = Math.max(0, Number(form.quantity || 0));

  const baseUnitPrice = Number(
    selectedTariff?.price_rub || 0
  );

  const includedWeight = Number(
    selectedTariff?.included_weight_kg ?? 1
  );

  const extraKgPrice = Number(
    selectedTariff?.extra_kg_price_rub ?? 8
  );

  const weight = Number(form.weight_kg || 0);

  const includedTotal = includedWeight * quantity;

  const extraWeight = Math.max(
    0,
    weight - includedTotal
  );

  const extraKgTotal =
    extraWeight * extraKgPrice;

  const baseTotal =
    quantity * baseUnitPrice;

  const receivingUnitPrice = Number(
    form.receiving_unit_price_rub || 5
  );

  const receivingTotal = form.receiving_enabled
    ? quantity * receivingUnitPrice
    : 0;

  const total =
    baseTotal + extraKgTotal + receivingTotal;

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!form.tariff_id && clientTariffs[0]) {
      set("tariff_id", clientTariffs[0].id);
    }
  }, [form.client_id, form.product_id, clientTariffs.length]);

  const save = async () => {
    if (
      !form.client_id ||
      !form.product_id ||
      quantity <= 0
    ) {
      return;
    }

    setSaving(true);

    await onSave({
      client_id: form.client_id,
      product_id: form.product_id,
      shipment_date: form.shipment_date,
      quantity,
      tariff_type: form.tariff_type,
      unit_price_rub: baseUnitPrice,
      total_rub: total,
      weight_kg: weight,
      base_unit_price_rub: baseUnitPrice,
      included_weight_kg: includedWeight,
      extra_kg_price_rub: extraKgPrice,
      extra_kg_rub: extraKgTotal,
      receiving_enabled: form.receiving_enabled,
      receiving_unit_price_rub: receivingUnitPrice,
      receiving_total_rub: receivingTotal,
      note: form.note || null,
    });

    setSaving(false);
  };

  return (
    <Modal
      title="Новая отгрузка"
      subtitle="Стоимость рассчитывается автоматически"
      onClose={onClose}
      large
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить отгрузку"}
          </Button>
        </>
      }
    >
      <div className="form-grid-3">
        <div className="form-field">
          <label className="form-label">Клиент *</label>
          <select
            className="select"
            value={form.client_id}
            onChange={(e) => {
              set("client_id", e.target.value);
              set("product_id", "");
              set("tariff_id", "");
            }}
          >
            <option value="">Выберите клиента</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Товар *</label>
          <select
            className="select"
            value={form.product_id}
            onChange={(e) => {
              set("product_id", e.target.value);
              set("tariff_id", "");
            }}
            disabled={!form.client_id}
          >
            <option value="">Выберите товар</option>
            {clientProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Дата *</label>
          <input
            className="input"
            type="date"
            value={form.shipment_date}
            onChange={(e) =>
              set("shipment_date", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Количество *</label>
          <input
            className="input"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) =>
              set("quantity", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Тип тарифа</label>
          <select
            className="select"
            value={form.tariff_type}
            onChange={(e) =>
              set("tariff_type", e.target.value)
            }
          >
            {TARIFF_TYPES.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">
            Тариф отгрузки
          </label>
          <select
            className="select"
            value={form.tariff_id}
            onChange={(e) =>
              set("tariff_id", e.target.value)
            }
            disabled={!form.client_id}
          >
            <option value="">
              {clientTariffs.length
                ? "Выберите тариф"
                : "Тариф не задан"}
            </option>

            {clientTariffs.map((t) => (
              <option key={t.id} value={t.id}>
                {money(t.price_rub)}
                {t.product_id ? " · товар" : " · клиент"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">
            Общий вес, кг
          </label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.001"
            value={form.weight_kg}
            onChange={(e) =>
              set("weight_kg", e.target.value)
            }
            placeholder="0"
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Приёмка
          </label>
          <select
            className="select"
            value={form.receiving_enabled ? "yes" : "no"}
            onChange={(e) =>
              set(
                "receiving_enabled",
                e.target.value === "yes"
              )
            }
          >
            <option value="no">Нет</option>
            <option value="yes">Да</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">
            Приёмка за единицу, ₽
          </label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.receiving_unit_price_rub}
            onChange={(e) =>
              set(
                "receiving_unit_price_rub",
                e.target.value
              )
            }
            disabled={!form.receiving_enabled}
          />
        </div>

        <div className="form-field full">
          <label className="form-label">Комментарий</label>
          <textarea
            className="textarea"
            value={form.note}
            onChange={(e) =>
              set("note", e.target.value)
            }
          />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 15 }}>
          <div className="stat-line">
            <span>Базовая стоимость</span>
            <span>{money(baseTotal)}</span>
          </div>

          <div className="stat-line">
            <span>Включённый вес</span>
            <span>{number(includedTotal)} кг</span>
          </div>

          <div className="stat-line">
            <span>Дополнительный вес</span>
            <span>
              {number(extraWeight)} кг ·{" "}
              {money(extraKgTotal)}
            </span>
          </div>

          <div className="stat-line">
            <span>Приёмка</span>
            <span>{money(receivingTotal)}</span>
          </div>
        </div>

        <div className="total-preview">
          <div className="total-preview-label">
            Итого к оплате
          </div>
          <div className="total-preview-value">
            {money(total)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Storage Modal
   ========================================================= */

function StorageModal({
  clients,
  defaultClientId = "",
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    client_id: defaultClientId,
    mode: "m3",
    volume_m3: "",
    unit_count: "",
    start_date: today(),
    end_date: today(),
    price_per_m3_day_rub: "",
    price_per_unit_day_rub: "0.20",
    note: "",
  });

  const [saving, setSaving] = useState(false);

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const days = daysBetween(
    form.start_date,
    form.end_date
  );

  const volume = Number(form.volume_m3 || 0);
  const units = Number(form.unit_count || 0);

  const m3Price = Number(
    form.price_per_m3_day_rub || 0
  );

  const unitPrice = Number(
    form.price_per_unit_day_rub || 0
  );

  const total =
    form.mode === "m3"
      ? volume * m3Price * days
      : units * unitPrice * days;

  const save = async () => {
    if (
      !form.client_id ||
      !form.start_date ||
      !form.end_date
    ) {
      return;
    }

    if (form.mode === "m3" && volume <= 0) return;
    if (form.mode === "unit" && units <= 0) return;

    setSaving(true);

    await onSave({
      client_id: form.client_id,
      volume_m3:
        form.mode === "m3" ? volume : 0,
      start_date: form.start_date,
      end_date: form.end_date,
      tariff_type: "storage",
      price_per_m3_day_rub:
        form.mode === "m3" ? m3Price : 0,
      total_rub: total,
      status: "planned",
      note: form.note || null,
      unit_count:
        form.mode === "unit" ? Math.round(units) : 0,
      price_per_unit_day_rub:
        form.mode === "unit" ? unitPrice : 0,
    });

    setSaving(false);
  };

  return (
    <Modal
      title="Новое хранение"
      subtitle="Хранение по м³ или по единицам"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить хранение"}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-field full">
          <label className="form-label">Клиент *</label>
          <select
            className="select"
            value={form.client_id}
            onChange={(e) =>
              set("client_id", e.target.value)
            }
          >
            <option value="">Выберите клиента</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">
            Способ расчёта
          </label>
          <select
            className="select"
            value={form.mode}
            onChange={(e) =>
              set("mode", e.target.value)
            }
          >
            <option value="m3">По м³</option>
            <option value="unit">По единицам</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">
            {form.mode === "m3"
              ? "Объём, м³"
              : "Количество единиц"}
          </label>
          {form.mode === "m3" ? (
            <input
              className="input"
              type="number"
              min="0"
              step="0.001"
              value={form.volume_m3}
              onChange={(e) =>
                set("volume_m3", e.target.value)
              }
            />
          ) : (
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={form.unit_count}
              onChange={(e) =>
                set("unit_count", e.target.value)
              }
            />
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Дата начала *</label>
          <input
            className="input"
            type="date"
            value={form.start_date}
            onChange={(e) =>
              set("start_date", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Дата окончания *</label>
          <input
            className="input"
            type="date"
            value={form.end_date}
            min={form.start_date}
            onChange={(e) =>
              set("end_date", e.target.value)
            }
          />
        </div>

        {form.mode === "m3" ? (
          <div className="form-field">
            <label className="form-label">
              ₽ / м³ / день
            </label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.price_per_m3_day_rub}
              onChange={(e) =>
                set(
                  "price_per_m3_day_rub",
                  e.target.value
                )
              }
            />
          </div>
        ) : (
          <div className="form-field">
            <label className="form-label">
              ₽ / единицу / день
            </label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.price_per_unit_day_rub}
              onChange={(e) =>
                set(
                  "price_per_unit_day_rub",
                  e.target.value
                )
              }
            />
          </div>
        )}

        <div className="form-field">
          <label className="form-label">
            Количество дней
          </label>
          <input
            className="input"
            value={days}
            disabled
          />
        </div>

        <div className="form-field full">
          <label className="form-label">
            Комментарий
          </label>
          <textarea
            className="textarea"
            value={form.note}
            onChange={(e) =>
              set("note", e.target.value)
            }
          />
        </div>
      </div>

      <div className="total-preview" style={{ marginTop: 16 }}>
        <div className="total-preview-label">
          Стоимость хранения
        </div>
        <div className="total-preview-value">
          {money(total)}
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Main App
   ========================================================= */

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [storage, setStorage] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [selectedClientId, setSelectedClientId] =
    useState(null);

  const [modal, setModal] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const showError = (error) => {
    console.error(error);

    const message =
      error?.message ||
      error?.details ||
      error?.hint ||
      "Произошла ошибка. Проверьте подключение к базе данных и права доступа.";

    showToast(message, "error");
  };

  /* ---------------- Authentication ---------------- */

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data.session);
          setAuthLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ---------------- Data loading ---------------- */

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
          .order("name"),

        supabase
          .from("products")
          .select("*")
          .order("name"),

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
          .order("start_date", {
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
        ["service_tariffs", tariffsResult],
        ["shipments", shipmentsResult],
        ["storage_records", storageResult],
        ["cooperation_requests", requestsResult],
      ];

      const failed = namedResults.find(([, result]) => result.error);

      if (failed?.[1]?.error) {
        const error = failed[1].error;
        throw new Error(
          `Не удалось загрузить таблицу ${failed[0]}: ${
            error.message || error.details || "неизвестная ошибка"
          }`
        );
      }

      setClients(clientsResult.data || []);
      setProducts(productsResult.data || []);
      setTariffs(tariffsResult.data || []);
      setShipments(shipmentsResult.data || []);
      setStorage(storageResult.data || []);
      setRequests(requestsResult.data || []);

      if (!selectedClientId && clientsResult.data?.[0]) {
        setSelectedClientId(clientsResult.data[0].id);
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    loadAll();
  }, [session]);

  /* ---------------- Realtime requests ---------------- */

  useEffect(() => {
    if (!supabase || !session) return;

    const channel = supabase
      .channel("sortex-cooperation-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cooperation_requests",
        },
        () => {
          loadRequestsOnly();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const loadRequestsOnly = async () => {
    if (!supabase || !session) return;

    const { data, error } = await supabase
      .from("cooperation_requests")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setRequests(data || []);
    }
  };

  /* ---------------- CRUD ---------------- */

  const addClient = async (payload) => {
    try {
      const clientProducts = Array.isArray(payload.client_products)
        ? payload.client_products
        : [];
      const { client_products, ...clientPayload } = payload;

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert({
          ...clientPayload,
          is_active: true,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      const createdProducts = [];

      for (const item of clientProducts) {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .insert({
            client_id: clientData.id,
            sku: item.sku.trim(),
            name: item.name.trim(),
            is_active: true,
          })
          .select()
          .single();

        if (productError) throw productError;
        createdProducts.push(productData);

        const { data: tariffData, error: tariffError } = await supabase
          .from("service_tariffs")
          .insert({
            client_id: clientData.id,
            product_id: productData.id,
            service_type: "shipment",
            price_rub: Number(item.price_rub),
            enabled: true,
            effective_from: today(),
            effective_to: null,
            notes: null,
            included_weight_kg: 1,
            extra_kg_price_rub: 0,
          })
          .select()
          .single();

        if (tariffError) throw tariffError;
        setTariffs((prev) => [tariffData, ...prev]);
      }

      setClients((prev) =>
        [...prev, clientData].sort((a, b) =>
          String(a.name).localeCompare(String(b.name))
        )
      );
      setProducts((prev) => [...prev, ...createdProducts]);
      setSelectedClientId(clientData.id);
      setModal(null);
      showToast(
        clientProducts.length
          ? `Клиент создан. Добавлено товаров: ${clientProducts.length}.`
          : "Клиент создан."
      );
    } catch (error) {
      showError(error);
    }
  };

  const addProduct = async (payload) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) => [...prev, data]);
      setModal(null);
      showToast("Товар создан.");
    } catch (error) {
      showError(error);
    }
  };

  const addTariff = async (payload) => {
    try {
      const { data, error } = await supabase
        .from("service_tariffs")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setTariffs((prev) => [data, ...prev]);
      setModal(null);
      showToast("Тариф создан.");
    } catch (error) {
      showError(error);
    }
  };

  const addShipment = async (payload) => {
    try {
      /*
       * IMPORTANT:
       * We intentionally do not send "status".
       * PostgreSQL will use:
       * default 'active'::operation_status
       *
       * tariff_type is one of:
       * small / medium / large / shipment
       */

      const insertPayload = {
        client_id: payload.client_id,
        product_id: payload.product_id,
        shipment_date: payload.shipment_date,
        quantity: payload.quantity,
        tariff_type: payload.tariff_type,
        unit_price_rub: payload.unit_price_rub,
        total_rub: payload.total_rub,
        weight_kg: payload.weight_kg,
        base_unit_price_rub:
          payload.base_unit_price_rub,
        included_weight_kg:
          payload.included_weight_kg,
        extra_kg_price_rub:
          payload.extra_kg_price_rub,
        extra_kg_rub: payload.extra_kg_rub,
        receiving_enabled:
          payload.receiving_enabled,
        receiving_unit_price_rub:
          payload.receiving_unit_price_rub,
        receiving_total_rub:
          payload.receiving_total_rub,
        note: payload.note,
        created_by: session?.user?.id || null,
      };

      const { data, error } = await supabase
        .from("shipments")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      setShipments((prev) => [data, ...prev]);
      setModal(null);
      showToast("Отгрузка сохранена.");
    } catch (error) {
      showError(error);
    }
  };

  const addStorage = async (payload) => {
    try {
      /*
       * tariff_type = storage
       * status = planned
       *
       * All NOT NULL fields from storage_records
       * are explicitly supplied.
       */

      const insertPayload = {
        client_id: payload.client_id,
        volume_m3: payload.volume_m3,
        start_date: payload.start_date,
        end_date: payload.end_date,
        tariff_type: "storage",
        price_per_m3_day_rub:
          payload.price_per_m3_day_rub,
        total_rub: payload.total_rub,
        status: "planned",
        note: payload.note,
        created_by: session?.user?.id || null,
        unit_count: payload.unit_count,
        price_per_unit_day_rub:
          payload.price_per_unit_day_rub,
      };

      const { data, error } = await supabase
        .from("storage_records")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      setStorage((prev) => [data, ...prev]);
      setModal(null);
      showToast("Хранение сохранено.");
    } catch (error) {
      showError(error);
    }
  };

  const updateRequest = async (id, patch) => {
    try {
      const status = patch.status;

      const updatePayload = {
        status,
        client_id: patch.client_id || null,
        internal_note: patch.internal_note || null,
      };

      /*
       * The existing table allows processed_at / processed_by.
       * When request leaves "new", mark it processed.
       */
      if (status !== "new") {
        updatePayload.processed_at =
          new Date().toISOString();
        updatePayload.processed_by =
          session?.user?.id || null;
      } else {
        updatePayload.processed_at = null;
        updatePayload.processed_by = null;
      }

      const { data, error } = await supabase
        .from("cooperation_requests")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setRequests((prev) =>
        prev.map((x) => (x.id === id ? data : x))
      );

      showToast("Заявка обновлена.");
    } catch (error) {
      showError(error);
    }
  };

  /* ---------------- Modal helpers ---------------- */

  const openClientModal = () =>
    setModal({ type: "client" });

  const openProductModal = (clientId = "") =>
    setModal({
      type: "product",
      clientId,
    });

  const openTariffModal = (clientId = "") =>
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

  const openStorageModal = (clientId = "") =>
    setModal({
      type: "storage",
      clientId,
    });

  /* ---------------- Navigation ---------------- */

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

  const navigateTo = (nextPage) => {
    setPage(nextPage);
    setMobileNavOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

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
              style={{ marginTop: 15 }}
            >
              Не найдены переменные окружения Supabase.
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
          className={`sidebar-overlay ${mobileNavOpen ? "visible" : ""}`}
          onClick={() => setMobileNavOpen(false)}
        />

        <aside
          className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
            mobileNavOpen ? "mobile-open" : ""
          }`}
        >
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
            title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
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

          <div className="nav-label">Рабочее пространство</div>

          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-button ${
                  page === item.id ? "active" : ""
                }`}
                onClick={() => navigateTo(item.id)}
              >
                <span className="nav-icon">
                  <Icon type={item.icon} />
                </span>

                <span>{item.label}</span>
              </button>
            ))}
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
                style={{ width: "100%" }}
              >
                <Icon type="logout" /> Выйти
              </Button>
            </div>
          </div>
        </aside>

        <main className={`main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <button
            className="button mobile-nav-toggle"
            onClick={() => setMobileNavOpen(true)}
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
              onAddClient={openClientModal}
              onNavigate={navigateTo}
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
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              onAddClient={openClientModal}
              onAddTariff={openTariffModal}
              onAddShipment={(clientId) =>
                openShipmentModal(clientId)
              }
              onAddStorage={(clientId) =>
                openStorageModal(clientId)
              }
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
            />
          )}

          {page === "requests" && (
            <Requests
              requests={requests}
              clients={clients}
              loading={loading}
              onUpdateRequest={updateRequest}
            />
          )}

          {page === "reports" && (
            <Reports
              clients={clients}
              shipments={shipments}
              storage={storage}
              loading={loading}
              onNotify={showToast}
            />
          )}
        </main>
      </div>

      {modal?.type === "client" && (
        <ClientModal
          onClose={() => setModal(null)}
          onSave={addClient}
        />
      )}

      {modal?.type === "product" && (
        <ProductModal
          clients={clients}
          defaultClientId={modal.clientId}
          onClose={() => setModal(null)}
          onSave={addProduct}
        />
      )}

      {modal?.type === "tariff" && (
        <TariffModal
          clients={clients}
          products={products}
          defaultClientId={modal.clientId}
          onClose={() => setModal(null)}
          onSave={addTariff}
        />
      )}

      {modal?.type === "shipment" && (
        <ShipmentModal
          clients={clients}
          products={products}
          tariffs={tariffs}
          defaultClientId={modal.clientId}
          defaultProductId={modal.productId}
          onClose={() => setModal(null)}
          onSave={addShipment}
        />
      )}

      {modal?.type === "storage" && (
        <StorageModal
          clients={clients}
          defaultClientId={modal.clientId}
          onClose={() => setModal(null)}
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

const rootElement = document.getElementById("root");

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
