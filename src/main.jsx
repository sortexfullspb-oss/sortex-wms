import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   SORTEX WMS
   One-file application: src/main.jsx

   Required .env:
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =========================================================
   GLOBAL STYLES
   ========================================================= */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');

:root {
  --bg: #11100e;
  --bg-soft: #171614;
  --panel: #1b1916;
  --panel-2: #211e1a;
  --panel-3: #26221d;
  --line: rgba(231, 193, 113, .14);
  --line-strong: rgba(231, 193, 113, .25);

  --gold: #d7ae61;
  --gold-light: #f0d18b;
  --gold-soft: rgba(215, 174, 97, .11);
  --gold-glow: rgba(215, 174, 97, .13);

  --text: #f4efe5;
  --text-soft: #bdb5a8;
  --text-muted: #817a70;

  --green: #89aa83;
  --red: #bd7770;
  --blue: #8297aa;

  --shadow:
    0 20px 60px rgba(0, 0, 0, .30),
    0 0 80px rgba(215, 174, 97, .025);

  --radius: 16px;
  --radius-small: 11px;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  width: 100%;
  min-height: 100%;
  background: var(--bg);
}

body {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
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

.app {
  min-height: 100vh;
  background:
    radial-gradient(
      ellipse 80% 60% at 50% -15%,
      rgba(215, 174, 97, .055),
      transparent 65%
    ),
    radial-gradient(
      ellipse 45% 40% at 100% 100%,
      rgba(215, 174, 97, .025),
      transparent 70%
    ),
    var(--bg);
}

/* =========================================================
   LOGIN
   ========================================================= */

.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  position: relative;
  overflow: hidden;
}

.login-screen::before {
  content: "";
  position: absolute;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: rgba(215, 174, 97, .035);
  filter: blur(100px);
  top: -350px;
  left: 50%;
  transform: translateX(-50%);
}

.login-card {
  width: 100%;
  max-width: 430px;
  position: relative;
  padding: 44px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background:
    linear-gradient(
      145deg,
      rgba(39, 35, 29, .94),
      rgba(22, 20, 17, .97)
    );
  box-shadow: var(--shadow);
}

.login-logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo-mark {
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  color: #15120e;
  background: linear-gradient(
    145deg,
    var(--gold-light),
    var(--gold)
  );
  font-family: Manrope, sans-serif;
  font-weight: 800;
  font-size: 18px;
  box-shadow:
    0 8px 30px rgba(215, 174, 97, .12),
    inset 0 1px rgba(255,255,255,.25);
}

.login-title {
  font-family: Manrope, sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: .08em;
}

.login-subtitle {
  color: var(--text-muted);
  margin-top: 7px;
  font-size: 13px;
}

/* =========================================================
   LAYOUT
   ========================================================= */

.shell {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 250px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  padding: 25px 15px;
  background:
    linear-gradient(
      180deg,
      #171511 0%,
      #12110f 100%
    );
  border-right: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 10px 28px;
}

.brand-symbol {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #efd18b, #c99d50);
  color: #15120d;
  font-family: Manrope, sans-serif;
  font-weight: 800;
  font-size: 13px;
  box-shadow: 0 6px 20px rgba(215,174,97,.08);
}

.brand-name {
  font-family: Manrope, sans-serif;
  font-weight: 800;
  letter-spacing: .12em;
  font-size: 14px;
}

.brand-caption {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 3px;
  letter-spacing: .08em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-title {
  color: #5f594f;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .14em;
  padding: 17px 12px 8px;
}

.nav-button {
  width: 100%;
  border: 1px solid transparent;
  color: var(--text-soft);
  background: transparent;
  padding: 11px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  transition: all .18s ease;
}

.nav-button:hover {
  color: var(--text);
  background: rgba(255,255,255,.025);
}

.nav-button:active {
  transform: translateY(1px);
  background: rgba(215,174,97,.10);
  box-shadow: inset 0 0 18px rgba(215,174,97,.06);
}

.nav-button.active {
  color: var(--gold-light);
  background: linear-gradient(
    90deg,
    rgba(215,174,97,.10),
    rgba(215,174,97,.035)
  );
  border-color: rgba(215,174,97,.12);
  box-shadow: inset 2px 0 0 var(--gold);
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 16px;
  opacity: .9;
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid var(--line);
  padding-top: 15px;
}

.user-card {
  padding: 11px;
  border-radius: 11px;
  background: rgba(255,255,255,.018);
  margin-bottom: 8px;
}

.user-email {
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   MAIN
   ========================================================= */

.main {
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
}

.topbar {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
  border-bottom: 1px solid var(--line);
  background: rgba(17,16,14,.75);
  backdrop-filter: blur(18px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-family: Manrope, sans-serif;
  font-size: 20px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content {
  padding: 30px 34px 50px;
  max-width: 1600px;
}

/* =========================================================
   COMMON
   ========================================================= */

button.primary {
  border: 1px solid rgba(238, 206, 143, .25);
  background: linear-gradient(145deg, #dfbc73, #c69b50);
  color: #17130d;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 16px;
  box-shadow: 0 5px 20px rgba(215,174,97,.07);
  transition: all .18s ease;
}

button.primary:hover {
  filter: brightness(1.04);
  transform: translateY(-1px);
  box-shadow: 0 7px 25px rgba(215,174,97,.11);
}

button.primary:active {
  transform: translateY(0);
  box-shadow: inset 0 0 18px rgba(70,40,5,.14);
}

button.secondary,
button.ghost {
  border: 1px solid var(--line);
  background: rgba(255,255,255,.025);
  color: var(--text-soft);
  border-radius: 10px;
  padding: 10px 15px;
  transition: all .18s ease;
}

button.secondary:hover,
button.ghost:hover {
  border-color: var(--line-strong);
  color: var(--text);
  background: rgba(215,174,97,.045);
}

button.secondary:active,
button.ghost:active {
  background: rgba(215,174,97,.10);
  box-shadow: inset 0 0 16px rgba(215,174,97,.05);
}

button.danger {
  border: 1px solid rgba(189,119,112,.22);
  color: #d0958e;
  background: rgba(189,119,112,.06);
  border-radius: 10px;
  padding: 10px 15px;
}

button.small {
  padding: 7px 10px;
  font-size: 12px;
}

button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.grid {
  display: grid;
  gap: 16px;
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.card {
  background:
    linear-gradient(
      145deg,
      rgba(34,31,26,.95),
      rgba(27,25,22,.96)
    );
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 15px 45px rgba(0,0,0,.10);
}

.card-padding {
  padding: 20px;
}

.stat-card {
  padding: 20px;
  min-height: 135px;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  right: -50px;
  bottom: -70px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(215,174,97,.035);
  filter: blur(20px);
}

.stat-label {
  color: var(--text-muted);
  font-size: 12px;
}

.stat-value {
  margin-top: 13px;
  font-family: Manrope, sans-serif;
  font-size: 29px;
  font-weight: 700;
  letter-spacing: -.03em;
}

.stat-description {
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 18px;
}

.section-title {
  font-family: Manrope, sans-serif;
  font-weight: 700;
  font-size: 16px;
}

.section-description {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.search {
  min-width: 240px;
}

input,
select,
textarea {
  width: 100%;
  color: var(--text);
  background: #151310;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 9px;
  outline: none;
  padding: 10px 12px;
  transition: all .18s ease;
}

input::placeholder,
textarea::placeholder {
  color: #625d55;
}

input:focus,
select:focus,
textarea:focus {
  border-color: rgba(215,174,97,.36);
  box-shadow: 0 0 0 3px rgba(215,174,97,.045);
}

select option {
  background: #171511;
  color: var(--text);
}

textarea {
  min-height: 90px;
  resize: vertical;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  color: var(--text-soft);
  font-size: 11px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 13px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 13px;
}

.field-full {
  grid-column: 1 / -1;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  color: #706a61;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .09em;
  font-weight: 600;
  padding: 12px 15px;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

td {
  padding: 14px 15px;
  border-bottom: 1px solid rgba(255,255,255,.045);
  font-size: 12px;
  color: var(--text-soft);
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: none;
}

tbody tr {
  transition: background .16s ease;
}

tbody tr:hover {
  background: rgba(215,174,97,.025);
}

.primary-text {
  color: var(--text);
  font-weight: 600;
}

.muted {
  color: var(--text-muted);
}

.gold {
  color: var(--gold-light);
}

.money {
  color: #e2c27e;
  font-variant-numeric: tabular-nums;
}

.empty {
  padding: 55px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,.07);
}

.badge.new {
  color: #dfc27f;
  background: rgba(215,174,97,.07);
}

.badge.work {
  color: #9cb1c2;
  background: rgba(130,151,170,.08);
}

.badge.success {
  color: #9ab393;
  background: rgba(137,170,131,.07);
}

.badge.closed {
  color: #9b958c;
  background: rgba(255,255,255,.035);
}

.badge.danger {
  color: #d0958e;
  background: rgba(189,119,112,.07);
}

/* =========================================================
   MODAL
   ========================================================= */

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,0,.68);
  backdrop-filter: blur(7px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  width: min(680px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background:
    linear-gradient(
      145deg,
      #25211c,
      #171511
    );
  border: 1px solid var(--line-strong);
  border-radius: 19px;
  box-shadow: 0 35px 100px rgba(0,0,0,.55);
}

.modal.large {
  width: min(950px, 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 21px 23px;
  border-bottom: 1px solid var(--line);
}

.modal-title {
  font-family: Manrope, sans-serif;
  font-size: 17px;
  font-weight: 700;
}

.modal-body {
  padding: 23px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 17px 23px;
  border-top: 1px solid var(--line);
}

.close-button {
  width: 31px;
  height: 31px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-muted);
  border-radius: 8px;
}

.close-button:hover {
  color: var(--text);
  background: rgba(255,255,255,.035);
}

/* =========================================================
   DASHBOARD
   ========================================================= */

.hero {
  padding: 26px;
  min-height: 180px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  right: -100px;
  top: -190px;
  border-radius: 50%;
  background: rgba(215,174,97,.055);
  filter: blur(45px);
}

.hero-title {
  font-family: Manrope, sans-serif;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -.025em;
  position: relative;
}

.hero-text {
  max-width: 650px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
  margin-top: 9px;
  position: relative;
}

.hero-gold {
  color: var(--gold-light);
}

/* =========================================================
   CLIENT DETAIL
   ========================================================= */

.client-list {
  display: grid;
  gap: 8px;
}

.client-item {
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: rgba(255,255,255,.018);
  transition: all .16s ease;
  cursor: pointer;
}

.client-item:hover {
  background: rgba(215,174,97,.035);
}

.client-item.active {
  border-color: rgba(215,174,97,.18);
  background: rgba(215,174,97,.065);
}

.client-name {
  color: var(--text);
  font-weight: 600;
  font-size: 13px;
}

.client-meta {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 10px;
}

.detail-panel {
  min-height: 500px;
}

.detail-tabs {
  display: flex;
  gap: 5px;
  border-bottom: 1px solid var(--line);
  padding: 0 20px;
}

.detail-tab {
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 13px 10px;
  border-bottom: 2px solid transparent;
}

.detail-tab.active {
  color: var(--gold-light);
  border-bottom-color: var(--gold);
}

/* =========================================================
   REPORT
   ========================================================= */

.report-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.report-number {
  font-family: Manrope, sans-serif;
  font-size: 21px;
  font-weight: 700;
  margin-top: 7px;
}

.print-only {
  display: none;
}

/* =========================================================
   TOAST
   ========================================================= */

.toast-container {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  min-width: 280px;
  max-width: 400px;
  padding: 13px 15px;
  border-radius: 11px;
  border: 1px solid var(--line);
  background: #211e1a;
  color: var(--text-soft);
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
  font-size: 12px;
}

.toast.success {
  border-color: rgba(137,170,131,.22);
}

.toast.error {
  border-color: rgba(189,119,112,.25);
}

/* =========================================================
   MOBILE
   ========================================================= */

.mobile-menu {
  display: none;
}

@media (max-width: 1100px) {
  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform .22s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main {
    margin-left: 0;
    width: 100%;
  }

  .mobile-menu {
    display: block;
    margin-right: 12px;
    border: 1px solid var(--line);
    background: transparent;
    color: var(--text-soft);
    width: 35px;
    height: 35px;
    border-radius: 9px;
  }

  .topbar {
    padding: 0 17px;
  }

  .content {
    padding: 20px 15px 40px;
  }

  .grid-4,
  .grid-3,
  .grid-2,
  .form-grid,
  .form-grid-3 {
    grid-template-columns: 1fr;
  }

  .search {
    min-width: 0;
    width: 100%;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .login-card {
    padding: 30px 22px;
  }

  .report-summary {
    grid-template-columns: 1fr;
  }
}

@media print {
  body {
    background: white !important;
    color: black !important;
  }

  .sidebar,
  .topbar,
  .toolbar,
  button,
  .no-print {
    display: none !important;
  }

  .main {
    margin: 0;
    width: 100%;
  }

  .content {
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

  td,
  th,
  .primary-text,
  .muted,
  .money {
    color: black !important;
  }
}
`;

function injectStyles() {
  if (!document.getElementById("sortex-styles")) {
    const style = document.createElement("style");
    style.id = "sortex-styles";
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}

/* =========================================================
   HELPERS
   ========================================================= */

const money = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;

const dateRu = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ru-RU");
};

const today = () => new Date().toISOString().slice(0, 10);

const firstDayOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const daysBetween = (start, end) => {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const diff = Math.ceil((b - a) / 86400000);
  return Math.max(1, diff);
};

const volumeM3 = (length, width, height) => {
  return (
    (Number(length || 0) *
      Number(width || 0) *
      Number(height || 0)) /
    1000000
  );
};

const prettyEnum = (value) => {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (x) => x.toUpperCase());
};

const statusLabel = {
  new: "Новая",
  in_progress: "В работе",
  contacted: "Связались",
  closed: "Закрыта",
};

const statusClass = {
  new: "new",
  in_progress: "work",
  contacted: "success",
  closed: "closed",
};

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const csv = rows
    .map((row) => row.map(csvEscape).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/* =========================================================
   BASIC COMPONENTS
   ========================================================= */

function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  large = false,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal ${large ? "large" : ""}`}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>

          <button
            className="close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full = false,
}) {
  return (
    <div className={`field ${full ? "field-full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const label = statusLabel[status] || prettyEnum(status);

  return (
    <span className={`badge ${statusClass[status] || "closed"}`}>
      {label}
    </span>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onLogin();
    }

    setLoading(false);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">SX</div>

          <div className="login-title">
            SORTEX
          </div>

          <div className="login-subtitle">
            Warehouse Management System
          </div>
        </div>

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          <Field label="E-mail">
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Пароль">
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          {error && (
            <div
              style={{
                color: "#d0958e",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="primary"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 6,
              height: 44,
            }}
          >
            {loading ? "Вход..." : "Войти в систему"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

const navItems = [
  ["dashboard", "Главная", "⌂"],
  ["clients", "Клиенты", "◉"],
  ["products", "Товары", "▦"],
  ["shipments", "Отгрузка", "↗"],
  ["requests", "Заявки", "◇"],
  ["reports", "Отчет", "▤"],
];

function Sidebar({
  page,
  setPage,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <aside
      className={`sidebar ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="brand">
        <div className="brand-symbol">SX</div>

        <div>
          <div className="brand-name">
            SORTEX
          </div>

          <div className="brand-caption">
            WAREHOUSE SYSTEM
          </div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-section-title">
          Управление
        </div>

        {navItems.map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            className={`nav-button ${
              page === id ? "active" : ""
            }`}
            onClick={() => {
              setPage(id);
              setMobileOpen(false);
            }}
          >
            <span className="nav-icon">
              {icon}
            </span>

            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div
            style={{
              fontSize: 11,
              color: "var(--text-soft)",
              marginBottom: 4,
            }}
          >
            Администратор
          </div>

          <div className="user-email">
            {user?.email}
          </div>
        </div>

        <button
          className="nav-button"
          type="button"
          onClick={onLogout}
        >
          <span className="nav-icon">↪</span>
          Выйти
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  clients,
  products,
  shipments,
  storage,
  requests,
  loading,
}) {
  const monthStart = firstDayOfMonth();

  const monthShipments = useMemo(
    () =>
      shipments.filter(
        (x) => x.shipment_date >= monthStart
      ),
    [shipments, monthStart]
  );

  const monthStorage = useMemo(
    () =>
      storage.filter(
        (x) => x.start_date >= monthStart
      ),
    [storage, monthStart]
  );

  const shipmentRevenue = monthShipments.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const storageRevenue = monthStorage.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const newRequests = requests.filter(
    (x) => x.status === "new"
  ).length;

  return (
    <>
      <div className="card hero">
        <div className="hero-title">
          Добро пожаловать в{" "}
          <span className="hero-gold">
            SORTEX WMS
          </span>
        </div>

        <div className="hero-text">
          Управление клиентами, товарами, тарифами,
          хранением, отгрузками и заявками —
          в одной рабочей системе.
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-label">
            Активные клиенты
          </div>

          <div className="stat-value">
            {loading ? "—" : clients.length}
          </div>

          <div className="stat-description">
            Клиентская база SORTEX
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Отгрузки за месяц
          </div>

          <div className="stat-value money">
            {money(shipmentRevenue)}
          </div>

          <div className="stat-description">
            {monthShipments.length} операций
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Хранение за месяц
          </div>

          <div className="stat-value money">
            {money(storageRevenue)}
          </div>

          <div className="stat-description">
            {monthStorage.length} записей
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Новые заявки
          </div>

          <div className="stat-value">
            {newRequests}
          </div>

          <div className="stat-description">
            Требуют обработки
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-padding">
            <div className="section-header">
              <div>
                <div className="section-title">
                  Последние заявки
                </div>

                <div className="section-description">
                  Последние обращения клиентов
                </div>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="empty">
                Заявок пока нет
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Телефон</th>
                      <th>Статус</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests
                      .slice(0, 5)
                      .map((request) => (
                        <tr key={request.id}>
                          <td>
                            <div className="primary-text">
                              {request.name}
                            </div>

                            <div className="muted">
                              {dateRu(
                                request.created_at
                              )}
                            </div>
                          </td>

                          <td>{request.phone}</td>

                          <td>
                            <Badge
                              status={request.status}
                            />
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
          <div className="card-padding">
            <div className="section-header">
              <div>
                <div className="section-title">
                  Последние отгрузки
                </div>

                <div className="section-description">
                  Операции текущего периода
                </div>
              </div>
            </div>

            {shipments.length === 0 ? (
              <div className="empty">
                Отгрузок пока нет
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Количество</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shipments
                      .slice(0, 5)
                      .map((shipment) => (
                        <tr key={shipment.id}>
                          <td>
                            {dateRu(
                              shipment.shipment_date
                            )}
                          </td>

                          <td>
                            {shipment.quantity}
                          </td>

                          <td className="money">
                            {money(
                              shipment.total_rub
                            )}
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

      <div style={{ height: 18 }} />

      <div className="card card-padding">
        <div className="section-title">
          Состояние системы
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 12,
            marginTop: 15,
          }}
        >
          <div>
            <div className="muted">
              Товары
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 20,
              }}
            >
              {products.length}
            </div>
          </div>

          <div>
            <div className="muted">
              Все заявки
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 20,
              }}
            >
              {requests.length}
            </div>
          </div>

          <div>
            <div className="muted">
              Все отгрузки
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 20,
              }}
            >
              {shipments.length}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   CLIENTS
   ========================================================= */

function Clients({
  clients,
  products,
  tariffs,
  shipments,
  storage,
  refresh,
  notify,
}) {
  const [selectedId, setSelectedId] =
    useState(null);

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);

  const [clientForm, setClientForm] = useState({
    name: "",
    legal_name: "",
    inn: "",
    contact_name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [tariffForm, setTariffForm] = useState({
    product_id: "",
    service_type: "",
    price_rub: "",
    included_weight_kg: "1",
    extra_kg_price_rub: "8",
    effective_from: today(),
    effective_to: "",
    notes: "",
  });

  const [storageForm, setStorageForm] = useState({
    mode: "m3",
    volume_m3: "",
    unit_count: "",
    start_date: today(),
    end_date: today(),
    price_per_m3_day_rub: "",
    price_per_unit_day_rub: "",
    note: "",
  });

  const filteredClients = clients.filter((client) => {
    const q = search.toLowerCase();

    return (
      client.name?.toLowerCase().includes(q) ||
      client.legal_name
        ?.toLowerCase()
        .includes(q) ||
      client.inn?.toLowerCase().includes(q)
    );
  });

  const selectedClient =
    clients.find((x) => x.id === selectedId) ||
    null;

  const selectedProducts = products.filter(
    (x) => x.client_id === selectedId
  );

  const selectedTariffs = tariffs.filter(
    (x) => x.client_id === selectedId
  );

  const selectedShipments = shipments.filter(
    (x) => x.client_id === selectedId
  );

  const selectedStorage = storage.filter(
    (x) => x.client_id === selectedId
  );

  const clientRevenue =
    selectedShipments.reduce(
      (sum, x) =>
        sum + Number(x.total_rub || 0),
      0
    ) +
    selectedStorage.reduce(
      (sum, x) =>
        sum + Number(x.total_rub || 0),
      0
    );

  async function createClient(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("clients")
      .insert({
        ...clientForm,
        is_active: true,
      });

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Клиент добавлен");
    setModal(null);

    setClientForm({
      name: "",
      legal_name: "",
      inn: "",
      contact_name: "",
      phone: "",
      email: "",
      notes: "",
    });

    refresh();
  }

  async function createTariff(e) {
    e.preventDefault();

    if (!selectedId) return;

    const payload = {
      client_id: selectedId,
      product_id:
        tariffForm.product_id || null,
      service_type:
        tariffForm.service_type,
      price_rub:
        Number(tariffForm.price_rub || 0),
      included_weight_kg:
        Number(
          tariffForm.included_weight_kg || 1
        ),
      extra_kg_price_rub:
        Number(
          tariffForm.extra_kg_price_rub || 0
        ),
      effective_from:
        tariffForm.effective_from,
      effective_to:
        tariffForm.effective_to || null,
      notes: tariffForm.notes || null,
      enabled: true,
    };

    const { error } = await supabase
      .from("service_tariffs")
      .insert(payload);

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Тариф сохранён");
    setModal(null);
    refresh();
  }

  async function createStorage(e) {
    e.preventDefault();

    if (!selectedId) return;

    const days = daysBetween(
      storageForm.start_date,
      storageForm.end_date
    );

    const volume =
      storageForm.mode === "m3"
        ? Number(storageForm.volume_m3 || 0)
        : 0;

    const units =
      storageForm.mode === "unit"
        ? Number(storageForm.unit_count || 0)
        : 0;

    const m3Price =
      Number(
        storageForm.price_per_m3_day_rub || 0
      );

    const unitPrice =
      Number(
        storageForm.price_per_unit_day_rub || 0
      );

    const total =
      storageForm.mode === "m3"
        ? volume * days * m3Price
        : units * days * unitPrice;

    const { error } = await supabase
      .from("storage_records")
      .insert({
        client_id: selectedId,
        volume_m3: volume,
        start_date: storageForm.start_date,
        end_date: storageForm.end_date,
        price_per_m3_day_rub: m3Price,
        total_rub: total,
        unit_count: units,
        price_per_unit_day_rub: unitPrice,
        note: storageForm.note || null,
      });

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Хранение добавлено");
    setModal(null);
    refresh();
  }

  return (
    <>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-padding">
            <div className="section-header">
              <div>
                <div className="section-title">
                  Клиенты
                </div>

                <div className="section-description">
                  Клиентская база и условия работы
                </div>
              </div>

              <button
                className="primary"
                onClick={() => setModal("client")}
              >
                + Клиент
              </button>
            </div>

            <div style={{ marginBottom: 13 }}>
              <input
                className="search"
                placeholder="Поиск клиента..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="client-list">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`client-item ${
                    selectedId === client.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedId(client.id)
                  }
                >
                  <div className="client-name">
                    {client.name}
                  </div>

                  <div className="client-meta">
                    {client.inn
                      ? `ИНН ${client.inn}`
                      : "ИНН не указан"}
                    {" · "}
                    {client.phone ||
                      "Телефон не указан"}
                  </div>
                </div>
              ))}

              {!filteredClients.length && (
                <div className="empty">
                  Клиенты не найдены
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card detail-panel">
          {!selectedClient ? (
            <div className="empty">
              Выберите клиента слева
            </div>
          ) : (
            <>
              <div className="card-padding">
                <div className="section-header">
                  <div>
                    <div className="section-title">
                      {selectedClient.name}
                    </div>

                    <div className="section-description">
                      {selectedClient.legal_name ||
                        "Карточка клиента"}
                    </div>
                  </div>

                  <div className="toolbar">
                    <button
                      className="secondary small"
                      onClick={() =>
                        setModal("tariff")
                      }
                    >
                      + Тариф
                    </button>

                    <button
                      className="primary small"
                      onClick={() =>
                        setModal("storage")
                      }
                    >
                      + Хранение
                    </button>
                  </div>
                </div>

                <div className="grid grid-3">
                  <div>
                    <div className="muted">
                      Контакт
                    </div>

                    <div
                      className="primary-text"
                      style={{ marginTop: 5 }}
                    >
                      {selectedClient.contact_name ||
                        "—"}
                    </div>
                  </div>

                  <div>
                    <div className="muted">
                      Телефон
                    </div>

                    <div
                      className="primary-text"
                      style={{ marginTop: 5 }}
                    >
                      {selectedClient.phone ||
                        "—"}
                    </div>
                  </div>

                  <div>
                    <div className="muted">
                      Оборот
                    </div>

                    <div
                      className="money"
                      style={{
                        marginTop: 5,
                        fontWeight: 700,
                      }}
                    >
                      {money(clientRevenue)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-tabs">
                <div className="detail-tab active">
                  Обзор
                </div>
              </div>

              <div className="card-padding">
                <div className="grid grid-3">
                  <div className="card card-padding">
                    <div className="muted">
                      Товары
                    </div>

                    <div
                      style={{
                        fontSize: 23,
                        marginTop: 7,
                      }}
                    >
                      {selectedProducts.length}
                    </div>
                  </div>

                  <div className="card card-padding">
                    <div className="muted">
                      Тарифы
                    </div>

                    <div
                      style={{
                        fontSize: 23,
                        marginTop: 7,
                      }}
                    >
                      {selectedTariffs.length}
                    </div>
                  </div>

                  <div className="card card-padding">
                    <div className="muted">
                      Отгрузки
                    </div>

                    <div
                      style={{
                        fontSize: 23,
                        marginTop: 7,
                      }}
                    >
                      {selectedShipments.length}
                    </div>
                  </div>
                </div>

                <div style={{ height: 18 }} />

                <div className="section-title">
                  Тарифы клиента
                </div>

                <div style={{ height: 10 }} />

                {selectedTariffs.length === 0 ? (
                  <div className="empty">
                    Тарифы ещё не добавлены
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Услуга</th>
                          <th>Товар</th>
                          <th>Цена</th>
                          <th>С</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedTariffs.map(
                          (tariff) => {
                            const product =
                              products.find(
                                (p) =>
                                  p.id ===
                                  tariff.product_id
                              );

                            return (
                              <tr key={tariff.id}>
                                <td>
                                  {prettyEnum(
                                    tariff.service_type
                                  )}
                                </td>

                                <td>
                                  {product?.name ||
                                    "Для клиента"}
                                </td>

                                <td className="money">
                                  {money(
                                    tariff.price_rub
                                  )}
                                </td>

                                <td>
                                  {dateRu(
                                    tariff.effective_from
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ height: 18 }} />

                <div className="section-title">
                  Последнее хранение
                </div>

                <div style={{ height: 10 }} />

                {selectedStorage.length === 0 ? (
                  <div className="empty">
                    Записей хранения нет
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Период</th>
                          <th>Объём</th>
                          <th>Сумма</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedStorage
                          .slice(0, 5)
                          .map((item) => (
                            <tr key={item.id}>
                              <td>
                                {dateRu(
                                  item.start_date
                                )}
                                {" — "}
                                {dateRu(
                                  item.end_date
                                )}
                              </td>

                              <td>
                                {Number(
                                  item.volume_m3 || 0
                                ).toFixed(3)}{" "}
                                м³
                                {item.unit_count
                                  ? ` · ${item.unit_count} шт.`
                                  : ""}
                              </td>

                              <td className="money">
                                {money(
                                  item.total_rub
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={modal === "client"}
        title="Новый клиент"
        onClose={() => setModal(null)}
        footer={
          <>
            <button
              className="secondary"
              onClick={() => setModal(null)}
            >
              Отмена
            </button>

            <button
              className="primary"
              form="client-form"
            >
              Сохранить
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={createClient}>
          <div className="form-grid">
            <Field label="Название">
              <input
                required
                value={clientForm.name}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    name: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Юридическое название">
              <input
                value={clientForm.legal_name}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    legal_name:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="ИНН">
              <input
                value={clientForm.inn}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    inn: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Контактное лицо">
              <input
                value={clientForm.contact_name}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    contact_name:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Телефон">
              <input
                value={clientForm.phone}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    phone: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="E-mail">
              <input
                type="email"
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    email: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Заметка" full>
              <textarea
                value={clientForm.notes}
                onChange={(e) =>
                  setClientForm({
                    ...clientForm,
                    notes: e.target.value,
                  })
                }
              />
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal === "tariff"}
        title="Тариф клиента"
        onClose={() => setModal(null)}
        footer={
          <>
            <button
              className="secondary"
              onClick={() => setModal(null)}
            >
              Отмена
            </button>

            <button
              className="primary"
              form="tariff-form"
            >
              Сохранить тариф
            </button>
          </>
        }
      >
        <form id="tariff-form" onSubmit={createTariff}>
          <div className="form-grid">
            <Field label="Товар">
              <select
                value={tariffForm.product_id}
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    product_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Для всего клиента
                </option>

                {selectedProducts.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.sku} —{" "}
                      {product.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Тип услуги">
              <input
                required
                placeholder="например: fulfillment"
                value={tariffForm.service_type}
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    service_type:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Цена, ₽">
              <input
                type="number"
                step="0.01"
                required
                value={tariffForm.price_rub}
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    price_rub:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Включённый вес, кг">
              <input
                type="number"
                step="0.01"
                value={
                  tariffForm.included_weight_kg
                }
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    included_weight_kg:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Доп. кг, ₽">
              <input
                type="number"
                step="0.01"
                value={
                  tariffForm.extra_kg_price_rub
                }
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    extra_kg_price_rub:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Дата начала">
              <input
                type="date"
                value={
                  tariffForm.effective_from
                }
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    effective_from:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Дата окончания">
              <input
                type="date"
                value={
                  tariffForm.effective_to
                }
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    effective_to:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Примечание" full>
              <textarea
                value={tariffForm.notes}
                onChange={(e) =>
                  setTariffForm({
                    ...tariffForm,
                    notes: e.target.value,
                  })
                }
              />
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal === "storage"}
        title={`Хранение — ${selectedClient?.name || ""}`}
        onClose={() => setModal(null)}
        footer={
          <>
            <button
              className="secondary"
              onClick={() => setModal(null)}
            >
              Отмена
            </button>

            <button
              className="primary"
              form="storage-form"
            >
              Добавить хранение
            </button>
          </>
        }
      >
        <form id="storage-form" onSubmit={createStorage}>
          <div className="form-grid">
            <Field label="Расчёт">
              <select
                value={storageForm.mode}
                onChange={(e) =>
                  setStorageForm({
                    ...storageForm,
                    mode: e.target.value,
                  })
                }
              >
                <option value="m3">
                  По м³
                </option>

                <option value="unit">
                  По единицам
                </option>
              </select>
            </Field>

            {storageForm.mode === "m3" ? (
              <Field label="Объём, м³">
                <input
                  type="number"
                  step="0.001"
                  required
                  value={
                    storageForm.volume_m3
                  }
                  onChange={(e) =>
                    setStorageForm({
                      ...storageForm,
                      volume_m3:
                        e.target.value,
                    })
                  }
                />
              </Field>
            ) : (
              <Field label="Количество единиц">
                <input
                  type="number"
                  required
                  value={
                    storageForm.unit_count
                  }
                  onChange={(e) =>
                    setStorageForm({
                      ...storageForm,
                      unit_count:
                        e.target.value,
                    })
                  }
                />
              </Field>
            )}

            <Field label="Начало">
              <input
                type="date"
                required
                value={storageForm.start_date}
                onChange={(e) =>
                  setStorageForm({
                    ...storageForm,
                    start_date:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Окончание">
              <input
                type="date"
                required
                value={storageForm.end_date}
                onChange={(e) =>
                  setStorageForm({
                    ...storageForm,
                    end_date:
                      e.target.value,
                  })
                }
              />
            </Field>

            {storageForm.mode === "m3" ? (
              <Field label="Цена за м³ / день, ₽">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={
                    storageForm.price_per_m3_day_rub
                  }
                  onChange={(e) =>
                    setStorageForm({
                      ...storageForm,
                      price_per_m3_day_rub:
                        e.target.value,
                    })
                  }
                />
              </Field>
            ) : (
              <Field label="Цена за единицу / день, ₽">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={
                    storageForm.price_per_unit_day_rub
                  }
                  onChange={(e) =>
                    setStorageForm({
                      ...storageForm,
                      price_per_unit_day_rub:
                        e.target.value,
                    })
                  }
                />
              </Field>
            )}

            <Field label="Примечание" full>
              <textarea
                value={storageForm.note}
                onChange={(e) =>
                  setStorageForm({
                    ...storageForm,
                    note: e.target.value,
                  })
                }
              />
            </Field>
          </div>
        </form>
      </Modal>
    </>
  );
}

/* =========================================================
   PRODUCTS
   ========================================================= */

function Products({
  products,
  clients,
  refresh,
  notify,
}) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    sku: "",
    name: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    weight_kg: "",
    notes: "",
  });

  const filtered = products.filter((product) => {
    const client = clients.find(
      (x) => x.id === product.client_id
    );

    const q = search.toLowerCase();

    return (
      product.sku
        ?.toLowerCase()
        .includes(q) ||
      product.name
        ?.toLowerCase()
        .includes(q) ||
      client?.name
        ?.toLowerCase()
        .includes(q)
    );
  });

  async function createProduct(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("products")
      .insert({
        client_id: form.client_id,
        sku: form.sku,
        name: form.name,
        length_cm:
          Number(form.length_cm || 0) ||
          null,
        width_cm:
          Number(form.width_cm || 0) ||
          null,
        height_cm:
          Number(form.height_cm || 0) ||
          null,
        weight_kg:
          Number(form.weight_kg || 0) ||
          null,
        notes: form.notes || null,
        is_active: true,
      });

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Товар добавлен");
    setModal(false);

    setForm({
      client_id: "",
      sku: "",
      name: "",
      length_cm: "",
      width_cm: "",
      height_cm: "",
      weight_kg: "",
      notes: "",
    });

    refresh();
  }

  return (
    <>
      <div className="card">
        <div className="card-padding">
          <div className="section-header">
            <div>
              <div className="section-title">
                Товары
              </div>

              <div className="section-description">
                SKU, размеры, вес и принадлежность
                клиенту
              </div>
            </div>

            <div className="toolbar">
              <input
                className="search"
                placeholder="Поиск товара..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <button
                className="primary"
                onClick={() => setModal(true)}
              >
                + Товар
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Товар</th>
                  <th>Клиент</th>
                  <th>Размер</th>
                  <th>Вес</th>
                  <th>Объём</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((product) => {
                  const client = clients.find(
                    (x) =>
                      x.id ===
                      product.client_id
                  );

                  const vol = volumeM3(
                    product.length_cm,
                    product.width_cm,
                    product.height_cm
                  );

                  return (
                    <tr key={product.id}>
                      <td>
                        <span className="primary-text">
                          {product.sku}
                        </span>
                      </td>

                      <td>
                        {product.name}
                      </td>

                      <td>
                        {client?.name || "—"}
                      </td>

                      <td>
                        {product.length_cm
                          ? `${product.length_cm} × ${product.width_cm} × ${product.height_cm} см`
                          : "—"}
                      </td>

                      <td>
                        {product.weight_kg
                          ? `${product.weight_kg} кг`
                          : "—"}
                      </td>

                      <td>
                        {vol
                          ? `${vol.toFixed(4)} м³`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="empty">
                Товары не найдены
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={modal}
        title="Новый товар"
        onClose={() => setModal(false)}
        footer={
          <>
            <button
              className="secondary"
              onClick={() => setModal(false)}
            >
              Отмена
            </button>

            <button
              className="primary"
              form="product-form"
            >
              Сохранить
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={createProduct}>
          <div className="form-grid">
            <Field label="Клиент">
              <select
                required
                value={form.client_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    client_id:
                      e.target.value,
                  })
                }
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

            <Field label="SKU">
              <input
                required
                value={form.sku}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sku: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Название" full>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Длина, см">
              <input
                type="number"
                step="0.01"
                value={form.length_cm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    length_cm:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Ширина, см">
              <input
                type="number"
                step="0.01"
                value={form.width_cm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    width_cm:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Высота, см">
              <input
                type="number"
                step="0.01"
                value={form.height_cm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    height_cm:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Вес, кг">
              <input
                type="number"
                step="0.001"
                value={form.weight_kg}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weight_kg:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Примечание" full>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
              />
            </Field>
          </div>
        </form>
      </Modal>
    </>
  );
}

/* =========================================================
   SHIPMENTS
   ========================================================= */

function Shipments({
  shipments,
  clients,
  products,
  tariffs,
  enums,
  refresh,
  notify,
}) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    client_id: "",
    product_id: "",
    shipment_date: today(),
    quantity: "1",
    weight_kg: "",
    tariff_type: "",
    tariff_id: "",
    unit_price_rub: "",
    included_weight_kg: "1",
    extra_kg_price_rub: "8",
    receiving_enabled: false,
    receiving_unit_price_rub: "5",
    note: "",
  });

  const clientProducts = products.filter(
    (x) => x.client_id === form.client_id
  );

  const clientTariffs = tariffs.filter(
    (x) =>
      x.client_id === form.client_id &&
      x.enabled !== false &&
      (!x.product_id ||
        x.product_id === form.product_id)
  );

  const tariffTypes =
    enums.tariff_type || [];

  const shipmentTotal = useMemo(() => {
    const quantity = Number(
      form.quantity || 0
    );

    const weight = Number(
      form.weight_kg || 0
    );

    const price = Number(
      form.unit_price_rub || 0
    );

    const included =
      Number(
        form.included_weight_kg || 0
      ) * quantity;

    const extraWeight = Math.max(
      0,
      weight - included
    );

    const extra =
      extraWeight *
      Number(form.extra_kg_price_rub || 0);

    const receiving = form.receiving_enabled
      ? quantity *
        Number(
          form.receiving_unit_price_rub || 0
        )
      : 0;

    return quantity * price + extra + receiving;
  }, [form]);

  function chooseTariff(id) {
    const tariff = clientTariffs.find(
      (x) => x.id === id
    );

    if (!tariff) {
      setForm({
        ...form,
        tariff_id: "",
      });

      return;
    }

    setForm({
      ...form,
      tariff_id: id,
      unit_price_rub:
        tariff.price_rub ?? "",
      included_weight_kg:
        tariff.included_weight_kg ??
        "1",
      extra_kg_price_rub:
        tariff.extra_kg_price_rub ??
        "8",
    });
  }

  function resetForm() {
    setForm({
      client_id: "",
      product_id: "",
      shipment_date: today(),
      quantity: "1",
      weight_kg: "",
      tariff_type:
        tariffTypes[0] || "",
      tariff_id: "",
      unit_price_rub: "",
      included_weight_kg: "1",
      extra_kg_price_rub: "8",
      receiving_enabled: false,
      receiving_unit_price_rub: "5",
      note: "",
    });
  }

  async function createShipment(e) {
    e.preventDefault();

    if (!form.client_id || !form.product_id) {
      notify(
        "Выберите клиента и товар",
        "error"
      );
      return;
    }

    if (!form.tariff_type) {
      notify(
        "Укажите тип тарифа отгрузки",
        "error"
      );
      return;
    }

    const quantity = Number(
      form.quantity || 0
    );

    const weight = Number(
      form.weight_kg || 0
    );

    const includedTotal =
      Number(
        form.included_weight_kg || 0
      ) * quantity;

    const extraWeight = Math.max(
      0,
      weight - includedTotal
    );

    const extraKgRub =
      extraWeight *
      Number(form.extra_kg_price_rub || 0);

    const receivingTotal = form.receiving_enabled
      ? quantity *
        Number(
          form.receiving_unit_price_rub || 0
        )
      : 0;

    const total =
      quantity *
        Number(form.unit_price_rub || 0) +
      extraKgRub +
      receivingTotal;

    const { error } = await supabase
      .from("shipments")
      .insert({
        client_id: form.client_id,
        product_id: form.product_id,
        shipment_date:
          form.shipment_date,
        quantity,
        tariff_type:
          form.tariff_type,
        unit_price_rub:
          Number(form.unit_price_rub || 0),
        total_rub: total,
        note: form.note || null,
        weight_kg: weight,
        base_unit_price_rub:
          Number(form.unit_price_rub || 0),
        included_weight_kg:
          Number(
            form.included_weight_kg || 0
          ),
        extra_kg_price_rub:
          Number(
            form.extra_kg_price_rub || 0
          ),
        extra_kg_rub:
          extraKgRub,
        receiving_enabled:
          form.receiving_enabled,
        receiving_unit_price_rub:
          Number(
            form.receiving_unit_price_rub || 0
          ),
        receiving_total_rub:
          receivingTotal,
      });

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Отгрузка добавлена");
    setModal(false);
    resetForm();
    refresh();
  }

  const filtered = shipments.filter(
    (shipment) => {
      const client = clients.find(
        (x) => x.id === shipment.client_id
      );

      const product = products.find(
        (x) => x.id === shipment.product_id
      );

      const q = search.toLowerCase();

      return (
        client?.name
          ?.toLowerCase()
          .includes(q) ||
        product?.name
          ?.toLowerCase()
          .includes(q) ||
        product?.sku
          ?.toLowerCase()
          .includes(q)
      );
    }
  );

  return (
    <>
      <div className="card">
        <div className="card-padding">
          <div className="section-header">
            <div>
              <div className="section-title">
                Отгрузка
              </div>

              <div className="section-description">
                Добавление операций и автоматический
                расчёт стоимости услуг
              </div>
            </div>

            <div className="toolbar">
              <input
                className="search"
                placeholder="Поиск..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <button
                className="primary"
                onClick={() => {
                  resetForm();
                  setModal(true);
                }}
              >
                + Отгрузка
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Товар</th>
                  <th>Кол-во</th>
                  <th>Вес</th>
                  <th>Тип</th>
                  <th>Сумма</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((shipment) => {
                  const client = clients.find(
                    (x) =>
                      x.id ===
                      shipment.client_id
                  );

                  const product = products.find(
                    (x) =>
                      x.id ===
                      shipment.product_id
                  );

                  return (
                    <tr key={shipment.id}>
                      <td>
                        {dateRu(
                          shipment.shipment_date
                        )}
                      </td>

                      <td>
                        {client?.name || "—"}
                      </td>

                      <td>
                        <div className="primary-text">
                          {product?.name || "—"}
                        </div>

                        <div className="muted">
                          {product?.sku || ""}
                        </div>
                      </td>

                      <td>
                        {shipment.quantity}
                      </td>

                      <td>
                        {Number(
                          shipment.weight_kg || 0
                        ).toFixed(2)}{" "}
                        кг
                      </td>

                      <td>
                        {prettyEnum(
                          shipment.tariff_type
                        )}
                      </td>

                      <td className="money">
                        {money(
                          shipment.total_rub
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="empty">
                Отгрузок нет
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={modal}
        title="Новая отгрузка"
        onClose={() => setModal(false)}
        large
        footer={
          <>
            <button
              className="secondary"
              onClick={() => setModal(false)}
            >
              Отмена
            </button>

            <button
              className="primary"
              form="shipment-form"
            >
              Создать отгрузку
            </button>
          </>
        }
      >
        <form
          id="shipment-form"
          onSubmit={createShipment}
        >
          <div className="form-grid-3">
            <Field label="Клиент">
              <select
                required
                value={form.client_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    client_id:
                      e.target.value,
                    product_id: "",
                    tariff_id: "",
                    unit_price_rub: "",
                  })
                }
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

            <Field label="Товар">
              <select
                required
                disabled={!form.client_id}
                value={form.product_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    product_id:
                      e.target.value,
                    tariff_id: "",
                    unit_price_rub: "",
                  })
                }
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
                      {product.sku} —{" "}
                      {product.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Дата">
              <input
                type="date"
                value={form.shipment_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shipment_date:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Тип тарифа">
              {tariffTypes.length ? (
                <select
                  required
                  value={form.tariff_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tariff_type:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Выберите тип
                  </option>

                  {tariffTypes.map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {prettyEnum(value)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  placeholder="Значение enum tariff_type"
                  value={form.tariff_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tariff_type:
                        e.target.value,
                    })
                  }
                />
              )}
            </Field>

            <Field label="Тариф клиента">
              <select
                value={form.tariff_id}
                disabled={!form.client_id}
                onChange={(e) =>
                  chooseTariff(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Ручная цена
                </option>

                {clientTariffs.map(
                  (tariff) => (
                    <option
                      key={tariff.id}
                      value={tariff.id}
                    >
                      {prettyEnum(
                        tariff.service_type
                      )}{" "}
                      —{" "}
                      {money(
                        tariff.price_rub
                      )}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Количество">
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Вес, кг">
              <input
                type="number"
                step="0.001"
                value={form.weight_kg}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weight_kg:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Цена за единицу, ₽">
              <input
                type="number"
                step="0.01"
                required
                value={form.unit_price_rub}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit_price_rub:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Вес включённый, кг">
              <input
                type="number"
                step="0.01"
                value={
                  form.included_weight_kg
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    included_weight_kg:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Доп. кг, ₽">
              <input
                type="number"
                step="0.01"
                value={
                  form.extra_kg_price_rub
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    extra_kg_price_rub:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Приёмка">
              <select
                value={
                  form.receiving_enabled
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    receiving_enabled:
                      e.target.value ===
                      "yes",
                  })
                }
              >
                <option value="no">
                  Нет
                </option>

                <option value="yes">
                  Да
                </option>
              </select>
            </Field>

            {form.receiving_enabled && (
              <Field label="Приёмка за единицу, ₽">
                <input
                  type="number"
                  step="0.01"
                  value={
                    form.receiving_unit_price_rub
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      receiving_unit_price_rub:
                        e.target.value,
                    })
                  }
                />
              </Field>
            )}

            <Field label="Комментарий" full>
              <textarea
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value,
                  })
                }
              />
            </Field>
          </div>

          <div
            className="card"
            style={{
              marginTop: 20,
              padding: 20,
              background:
                "rgba(215,174,97,.045)",
            }}
          >
            <div className="muted">
              Расчёт стоимости
            </div>

            <div
              style={{
                marginTop: 8,
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: 30,
                color:
                  "var(--gold-light)",
              }}
            >
              {money(shipmentTotal)}
            </div>

            <div
              className="muted"
              style={{
                marginTop: 5,
              }}
            >
              База + дополнительные килограммы +
              приёмка
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

/* =========================================================
   REQUESTS
   ========================================================= */

function Requests({
  requests,
  clients,
  refresh,
  notify,
}) {
  const [filter, setFilter] =
    useState("all");

  const [selected, setSelected] =
    useState(null);

  const filtered = requests.filter(
    (request) =>
      filter === "all" ||
      request.status === filter
  );

  async function updateRequest(
    id,
    values
  ) {
    const {
      data: {
        user,
      } = {},
    } =
      await supabase.auth.getUser();

    const { error } = await supabase
      .from("cooperation_requests")
      .update({
        ...values,
        processed_by:
          values.status !== "new"
            ? user?.id || null
            : null,
        processed_at:
          values.status !== "new"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", id);

    if (error) {
      notify(error.message, "error");
      return;
    }

    notify("Заявка обновлена");
    refresh();

    if (selected?.id === id) {
      setSelected({
        ...selected,
        ...values,
      });
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-padding">
          <div className="section-header">
            <div>
              <div className="section-title">
                Заявки
              </div>

              <div className="section-description">
                Все обращения с сайта
              </div>
            </div>

            <div className="toolbar">
              {[
                ["all", "Все"],
                ["new", "Новые"],
                [
                  "in_progress",
                  "В работе",
                ],
                [
                  "contacted",
                  "Связались",
                ],
                ["closed", "Закрытые"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={
                    filter === value
                      ? "primary small"
                      : "secondary small"
                  }
                  onClick={() =>
                    setFilter(value)
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Имя</th>
                  <th>Компания</th>
                  <th>Телефон</th>
                  <th>E-mail</th>
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() =>
                      setSelected(request)
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <td>
                      {dateRu(
                        request.created_at
                      )}
                    </td>

                    <td>
                      <span className="primary-text">
                        {request.name}
                      </span>
                    </td>

                    <td>
                      {request.company_name ||
                        "—"}
                    </td>

                    <td>
                      {request.phone}
                    </td>

                    <td>
                      {request.email || "—"}
                    </td>

                    <td>
                      <Badge
                        status={request.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="empty">
                Заявок нет
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!selected}
        title={
          selected
            ? `Заявка — ${selected.name}`
            : ""
        }
        onClose={() => setSelected(null)}
        large
        footer={
          selected && (
            <button
              className="secondary"
              onClick={() =>
                setSelected(null)
              }
            >
              Закрыть
            </button>
          )
        }
      >
        {selected && (
          <div>
            <div className="grid grid-3">
              <div>
                <div className="muted">
                  Имя
                </div>

                <div
                  className="primary-text"
                  style={{
                    marginTop: 5,
                  }}
                >
                  {selected.name}
                </div>
              </div>

              <div>
                <div className="muted">
                  Телефон
                </div>

                <div
                  className="primary-text"
                  style={{
                    marginTop: 5,
                  }}
                >
                  {selected.phone}
                </div>
              </div>

              <div>
                <div className="muted">
                  E-mail
                </div>

                <div
                  className="primary-text"
                  style={{
                    marginTop: 5,
                  }}
                >
                  {selected.email ||
                    "—"}
                </div>
              </div>
            </div>

            <div style={{ height: 20 }} />

            <div className="form-grid">
              <Field label="Статус">
                <select
                  value={selected.status}
                  onChange={(e) =>
                    updateRequest(
                      selected.id,
                      {
                        status:
                          e.target.value,
                      }
                    )
                  }
                >
                  <option value="new">
                    Новая
                  </option>

                  <option value="in_progress">
                    В работе
                  </option>

                  <option value="contacted">
                    Связались
                  </option>

                  <option value="closed">
                    Закрыта
                  </option>
                </select>
              </Field>

              <Field label="Привязать клиента">
                <select
                  value={
                    selected.client_id || ""
                  }
                  onChange={(e) =>
                    updateRequest(
                      selected.id,
                      {
                        client_id:
                          e.target.value ||
                          null,
                      }
                    )
                  }
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
              </Field>

              <Field label="Сообщение" full>
                <textarea
                  readOnly
                  value={
                    selected.message ||
                    "Сообщение не указано"
                  }
                />
              </Field>

              <Field label="Внутренняя заметка" full>
                <textarea
                  defaultValue={
                    selected.internal_note ||
                    ""
                  }
                  onBlur={(e) =>
                    updateRequest(
                      selected.id,
                      {
                        internal_note:
                          e.target.value,
                      }
                    )
                  }
                  placeholder="Только для SORTEX"
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* =========================================================
   REPORTS
   ========================================================= */

function Reports({
  clients,
  shipments,
  storage,
}) {
  const [from, setFrom] =
    useState(firstDayOfMonth());

  const [to, setTo] =
    useState(today());

  const [clientId, setClientId] =
    useState("");

  const reportShipments =
    shipments.filter((item) => {
      return (
        item.shipment_date >= from &&
        item.shipment_date <= to &&
        (!clientId ||
          item.client_id === clientId)
      );
    });

  const reportStorage =
    storage.filter((item) => {
      return (
        item.start_date <= to &&
        item.end_date >= from &&
        (!clientId ||
          item.client_id === clientId)
      );
    });

  const shipmentTotal =
    reportShipments.reduce(
      (sum, x) =>
        sum + Number(x.total_rub || 0),
      0
    );

  const storageTotal =
    reportStorage.reduce(
      (sum, x) =>
        sum + Number(x.total_rub || 0),
      0
    );

  const total =
    shipmentTotal + storageTotal;

  function exportReport() {
    const rows = [
      [
        "Тип",
        "Дата",
        "Клиент",
        "Описание",
        "Количество",
        "Сумма, ₽",
      ],
    ];

    reportShipments.forEach((item) => {
      const client = clients.find(
        (x) => x.id === item.client_id
      );

      rows.push([
        "Отгрузка",
        item.shipment_date,
        client?.name || "",
        item.product_id,
        item.quantity,
        Number(item.total_rub || 0)
          .toFixed(2),
      ]);
    });

    reportStorage.forEach((item) => {
      const client = clients.find(
        (x) => x.id === item.client_id
      );

      rows.push([
        "Хранение",
        `${item.start_date} — ${item.end_date}`,
        client?.name || "",
        `${item.volume_m3 || 0} м³`,
        item.unit_count || "",
        Number(item.total_rub || 0)
          .toFixed(2),
      ]);
    });

    rows.push([]);
    rows.push([
      "",
      "",
      "",
      "ИТОГО",
      "",
      total.toFixed(2),
    ]);

    downloadCSV(
      `sortex-report-${from}-${to}.csv`,
      rows
    );
  }

  return (
    <>
      <div className="card no-print">
        <div className="card-padding">
          <div className="section-header">
            <div>
              <div className="section-title">
                Отчет
              </div>

              <div className="section-description">
                Финансовый отчет за выбранный период
              </div>
            </div>

            <div className="toolbar">
              <button
                className="secondary"
                onClick={() =>
                  window.print()
                }
              >
                Печать / PDF
              </button>

              <button
                className="primary"
                onClick={exportReport}
              >
                Скачать CSV
              </button>
            </div>
          </div>

          <div className="form-grid-3">
            <Field label="От">
              <input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
              />
            </Field>

            <Field label="До">
              <input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
              />
            </Field>

            <Field label="Клиент">
              <select
                value={clientId}
                onChange={(e) =>
                  setClientId(e.target.value)
                }
              >
                <option value="">
                  Все клиенты
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
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="print-only">
        <h1>SORTEX WMS</h1>
        <p>
          Отчёт за {dateRu(from)} —{" "}
          {dateRu(to)}
        </p>
      </div>

      <div className="report-summary">
        <div className="card card-padding">
          <div className="muted">
            Отгрузки
          </div>

          <div className="report-number money">
            {money(shipmentTotal)}
          </div>

          <div className="muted">
            {reportShipments.length} операций
          </div>
        </div>

        <div className="card card-padding">
          <div className="muted">
            Хранение
          </div>

          <div className="report-number money">
            {money(storageTotal)}
          </div>

          <div className="muted">
            {reportStorage.length} записей
          </div>
        </div>

        <div className="card card-padding">
          <div className="muted">
            Общая сумма
          </div>

          <div className="report-number money">
            {money(total)}
          </div>

          <div className="muted">
            За выбранный период
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="card">
        <div className="card-padding">
          <div className="section-title">
            Операции
          </div>

          <div style={{ height: 12 }} />

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Описание</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>

              <tbody>
                {reportShipments.map(
                  (item) => {
                    const client =
                      clients.find(
                        (x) =>
                          x.id ===
                          item.client_id
                      );

                    return (
                      <tr key={`s-${item.id}`}>
                        <td>
                          <span className="badge work">
                            Отгрузка
                          </span>
                        </td>

                        <td>
                          {dateRu(
                            item.shipment_date
                          )}
                        </td>

                        <td>
                          {client?.name ||
                            "—"}
                        </td>

                        <td>
                          Операция отгрузки
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td className="money">
                          {money(
                            item.total_rub
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}

                {reportStorage.map(
                  (item) => {
                    const client =
                      clients.find(
                        (x) =>
                          x.id ===
                          item.client_id
                      );

                    return (
                      <tr key={`st-${item.id}`}>
                        <td>
                          <span className="badge new">
                            Хранение
                          </span>
                        </td>

                        <td>
                          {dateRu(
                            item.start_date
                          )}
                        </td>

                        <td>
                          {client?.name ||
                            "—"}
                        </td>

                        <td>
                          {Number(
                            item.volume_m3 ||
                              0
                          ).toFixed(3)}{" "}
                          м³
                          {item.unit_count
                            ? ` / ${item.unit_count} шт.`
                            : ""}
                        </td>

                        <td>
                          —
                        </td>

                        <td className="money">
                          {money(
                            item.total_rub
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {!reportShipments.length &&
              !reportStorage.length && (
                <div className="empty">
                  За выбранный период операций
                  нет
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [session, setSession] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [page, setPage] =
    useState("dashboard");

  const [mobileOpen, setMobileOpen] =
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

  const [enums, setEnums] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [toasts, setToasts] =
    useState([]);

  useEffect(() => {
    injectStyles();

    let mounted = true;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSession(session);
        setAuthLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setAuthLoading(false);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function notify(
    message,
    type = "success"
  ) {
    const id =
      Date.now() +
      Math.random();

    setToasts((items) => [
      ...items,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((items) =>
        items.filter(
          (item) => item.id !== id
        )
      );
    }, 3500);
  }

  async function loadData() {
    if (!session) return;

    setLoading(true);

    const [
      clientsRes,
      productsRes,
      tariffsRes,
      shipmentsRes,
      storageRes,
      requestsRes,
      enumsRes,
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

      supabase.rpc(
        "get_sortex_enums"
      ),
    ]);

    if (clientsRes.error)
      notify(
        clientsRes.error.message,
        "error"
      );

    if (productsRes.error)
      notify(
        productsRes.error.message,
        "error"
      );

    if (tariffsRes.error)
      notify(
        tariffsRes.error.message,
        "error"
      );

    if (shipmentsRes.error)
      notify(
        shipmentsRes.error.message,
        "error"
      );

    if (storageRes.error)
      notify(
        storageRes.error.message,
        "error"
      );

    if (requestsRes.error)
      notify(
        requestsRes.error.message,
        "error"
      );

    setClients(
      clientsRes.data || []
    );

    setProducts(
      productsRes.data || []
    );

    setTariffs(
      tariffsRes.data || []
    );

    setShipments(
      shipmentsRes.data || []
    );

    setStorage(
      storageRes.data || []
    );

    setRequests(
      requestsRes.data || []
    );

    if (!enumsRes.error) {
      setEnums(
        enumsRes.data || {}
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!session) return;

    loadData();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const channel =
      supabase
        .channel(
          "sortex-cooperation-requests"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cooperation_requests",
          },
          () => {
            loadData();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [session]);

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (authLoading) {
    return (
      <div
        className="login-screen"
        style={{
          color: "var(--text-muted)",
        }}
      >
        Загрузка SORTEX WMS...
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Login
          onLogin={() => {}}
        />

        <div className="toast-container">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast ${toast.type}`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </>
    );
  }

  const titles = {
    dashboard: [
      "Главная",
      "Обзор складской системы",
    ],
    clients: [
      "Клиенты",
      "Клиенты, тарифы и финансовые показатели",
    ],
    products: [
      "Товары",
      "Каталог товаров и параметры хранения",
    ],
    shipments: [
      "Отгрузка",
      "Операции и расчёт стоимости",
    ],
    requests: [
      "Заявки",
      "Обращения клиентов с сайта",
    ],
    reports: [
      "Отчет",
      "Финансовая статистика за период",
    ],
  };

  const currentTitle =
    titles[page] || titles.dashboard;

  return (
    <div className="app">
      <div className="shell">
        <Sidebar
          page={page}
          setPage={setPage}
          user={session.user}
          onLogout={logout}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="main">
          <header className="topbar">
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <button
                className="mobile-menu"
                onClick={() =>
                  setMobileOpen(
                    !mobileOpen
                  )
                }
              >
                ☰
              </button>

              <div>
                <div className="page-title">
                  {currentTitle[0]}
                </div>

                <div className="page-subtitle">
                  {currentTitle[1]}
                </div>
              </div>
            </div>

            <div className="topbar-right">
              <div
                className="badge success"
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background:
                      "var(--green)",
                  }}
                />
                Система активна
              </div>
            </div>
          </header>

          <div className="content">
            {page === "dashboard" && (
              <Dashboard
                clients={clients}
                products={products}
                shipments={shipments}
                storage={storage}
                requests={requests}
                loading={loading}
              />
            )}

            {page === "clients" && (
              <Clients
                clients={clients}
                products={products}
                tariffs={tariffs}
                shipments={shipments}
                storage={storage}
                refresh={loadData}
                notify={notify}
              />
            )}

            {page === "products" && (
              <Products
                products={products}
                clients={clients}
                refresh={loadData}
                notify={notify}
              />
            )}

            {page === "shipments" && (
              <Shipments
                shipments={shipments}
                clients={clients}
                products={products}
                tariffs={tariffs}
                enums={enums}
                refresh={loadData}
                notify={notify}
              />
            )}

            {page === "requests" && (
              <Requests
                requests={requests}
                clients={clients}
                refresh={loadData}
                notify={notify}
              />
            )}

            {page === "reports" && (
              <Reports
                clients={clients}
                shipments={shipments}
                storage={storage}
              />
            )}
          </div>
        </main>
      </div>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   START
   ========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
