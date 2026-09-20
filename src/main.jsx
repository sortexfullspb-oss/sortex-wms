import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* =========================================================
   SORTEX WMS
   Graphite + Champagne
   Single-file responsive application
   ========================================================= */

const APP_CSS = `
:root {
  --graphite: #242321;
  --graphite-soft: #302E2A;
  --champagne: #C8B58A;
  --champagne-light: #E8DEC8;
  --milk: #F7F5F0;
  --card: #FFFDF9;
  --border: #DED9CF;
  --text: #292825;
  --muted: #77736B;
  --green: #71806B;
  --amber: #A48B59;
  --blue: #6C7C8E;
  --wine: #865D5D;
  --shadow: 0 8px 28px rgba(36,35,33,.07);
  --shadow-soft: 0 3px 14px rgba(36,35,33,.06);
  --radius: 16px;
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
  background: var(--milk);
}

body {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
  background: var(--milk);
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
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--champagne);
  outline-offset: 2px;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 85% 0%,
      rgba(200,181,138,.10),
      transparent 28%
    ),
    var(--milk);
}

.sidebar {
  position: fixed;
  z-index: 30;
  left: 0;
  top: 0;
  bottom: 0;
  width: 245px;
  background: var(--graphite);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 25px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 9px 30px;
}

.brand-mark {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  border: 1px solid rgba(232,222,200,.35);
  background: linear-gradient(145deg, #35322d, #242321);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--champagne-light);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -.5px;
  box-shadow: 0 0 20px rgba(200,181,138,.08);
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.brand-sub {
  color: rgba(232,222,200,.58);
  font-size: 10px;
  letter-spacing: 1.5px;
  margin-top: 2px;
  text-transform: uppercase;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-button {
  position: relative;
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,.64);
  text-align: left;
  padding: 12px 13px;
  border-radius: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 11px;
  transition: .18s ease;
}

.nav-button:hover {
  background: rgba(255,255,255,.045);
  color: #fff;
}

.nav-button.active {
  background: rgba(200,181,138,.11);
  color: var(--champagne-light);
}

.nav-button.active::before {
  content: "";
  position: absolute;
  left: -16px;
  top: 9px;
  bottom: 9px;
  width: 2px;
  border-radius: 2px;
  background: var(--champagne);
  box-shadow: 0 0 10px rgba(200,181,138,.30);
}

.nav-icon {
  width: 21px;
  text-align: center;
  opacity: .9;
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,.08);
}

.user-mini {
  padding: 10px 11px;
  color: rgba(255,255,255,.60);
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-button {
  width: 100%;
  margin-top: 8px;
  border: 1px solid rgba(232,222,200,.14);
  background: transparent;
  color: rgba(255,255,255,.68);
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.logout-button:hover {
  border-color: rgba(232,222,200,.30);
  color: var(--champagne-light);
}

.main {
  margin-left: 245px;
  min-height: 100vh;
}

.topbar {
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(222,217,207,.8);
  background: rgba(247,245,240,.90);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar-title {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -.3px;
}

.topbar-date {
  color: var(--muted);
  font-size: 13px;
}

.content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 30px 32px 50px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 29px;
  font-weight: 750;
  letter-spacing: -.7px;
  margin: 0;
}

.page-subtitle {
  color: var(--muted);
  margin-top: 7px;
  font-size: 14px;
}

.card {
  background: rgba(255,253,249,.96);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
}

.card-pad {
  padding: 21px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  min-height: 128px;
  padding: 19px;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  right: -48px;
  bottom: -58px;
  background: rgba(200,181,138,.10);
  filter: blur(2px);
}

.stat-label {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .7px;
}

.stat-value {
  margin-top: 12px;
  font-size: 27px;
  font-weight: 750;
  letter-spacing: -.7px;
}

.stat-value.accent {
  color: #9D8450;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search {
  flex: 1;
  min-width: 230px;
  position: relative;
}

.search input {
  width: 100%;
  height: 45px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--card);
  color: var(--text);
  padding: 0 14px 0 41px;
}

.search input::placeholder {
  color: #9A968E;
}

.search-symbol {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
}

.button {
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  border-radius: 11px;
  min-height: 45px;
  padding: 0 16px;
  cursor: pointer;
  transition: .18s ease;
}

.button:hover {
  border-color: #CBBE9F;
  box-shadow: 0 0 0 3px rgba(200,181,138,.08);
}

.button.primary {
  background: var(--graphite);
  border-color: var(--graphite);
  color: var(--champagne-light);
}

.button.primary:hover {
  background: var(--graphite-soft);
  box-shadow: 0 0 18px rgba(200,181,138,.12);
}

.button.danger {
  color: var(--wine);
}

.button.small {
  min-height: 36px;
  padding: 0 11px;
  font-size: 12px;
}

.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}

th {
  text-align: left;
  padding: 14px 17px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .65px;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  font-weight: 650;
  white-space: nowrap;
}

td {
  padding: 15px 17px;
  border-bottom: 1px solid #ECE8E0;
  font-size: 13px;
  vertical-align: middle;
}

tbody tr {
  transition: .15s ease;
}

tbody tr:hover {
  background: #FCFAF5;
}

.client-name {
  font-weight: 650;
}

.client-secondary {
  color: var(--muted);
  font-size: 12px;
  margin-top: 3px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.badge.active {
  color: var(--green);
  background: rgba(113,128,107,.10);
}

.badge.cancelled {
  color: var(--wine);
  background: rgba(134,93,93,.10);
}

.badge.planned {
  color: var(--amber);
  background: rgba(164,139,89,.11);
}

.badge.completed {
  color: var(--green);
  background: rgba(113,128,107,.10);
}

.empty {
  text-align: center;
  padding: 50px 20px;
  color: var(--muted);
}

.empty-icon {
  font-size: 30px;
  opacity: .55;
  margin-bottom: 10px;
}

.form-card {
  max-width: 820px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 12px;
  color: var(--muted);
  font-weight: 650;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: #fffefa;
  color: var(--text);
  border-radius: 10px;
  min-height: 44px;
  padding: 9px 12px;
}

.field textarea {
  min-height: 90px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 9px;
  justify-content: flex-end;
  margin-top: 19px;
  padding-top: 17px;
  border-top: 1px solid var(--border);
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 18px;
}

.back {
  width: 39px;
  height: 39px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 10px;
  cursor: pointer;
  color: var(--text);
}

.detail-title {
  font-size: 22px;
  font-weight: 720;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0,1.15fr) minmax(300px,.85fr);
  gap: 18px;
}

.info-list {
  display: grid;
  gap: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 0;
  border-bottom: 1px solid #ECE8E0;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-label {
  color: var(--muted);
  font-size: 13px;
}

.info-value {
  text-align: right;
  font-size: 13px;
  font-weight: 600;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 15px;
}

.period-box {
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
}

.period-box .field {
  flex: 1;
  min-width: 150px;
}

.amount {
  font-weight: 750;
  white-space: nowrap;
}

.amount.accent {
  color: #9D8450;
}

.notice {
  border: 1px solid #D8CBAE;
  background: rgba(232,222,200,.34);
  color: #66583C;
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.error {
  border: 1px solid #D7BDBD;
  background: #FAF1F1;
  color: var(--wine);
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 13px;
  margin-bottom: 15px;
}

.success {
  border: 1px solid #CBD5C6;
  background: #F2F6F0;
  color: #5E6D59;
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 13px;
  margin-bottom: 15px;
}

.loading {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  background:
    radial-gradient(circle at 50% 0%, rgba(200,181,138,.13), transparent 36%),
    var(--milk);
}

.login-card {
  width: min(430px,100%);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 31px;
  box-shadow: 0 18px 55px rgba(36,35,33,.10);
}

.login-brand {
  text-align: center;
  margin-bottom: 26px;
}

.login-brand .brand-mark {
  margin: 0 auto 12px;
  background: var(--graphite);
}

.login-brand h1 {
  margin: 0;
  font-size: 23px;
  letter-spacing: 1.8px;
}

.login-brand p {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 12px;
}

.login-actions {
  margin-top: 18px;
}

.login-actions .button {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 17px;
  color: var(--muted);
  font-size: 11px;
}

.mobile-header {
  display: none;
}

.bottom-nav {
  display: none;
}

.mobile-more {
  display: none;
}

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

.currency {
  white-space: nowrap;
}

@media (max-width: 1050px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0,1fr));
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .sidebar {
    display: none;
  }

  .main {
    margin-left: 0;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }

  .topbar {
    display: none;
  }

  .mobile-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 25;
    height: 62px;
    padding: 0 16px;
    align-items: center;
    justify-content: space-between;
    background: rgba(247,245,240,.94);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .mobile-logo .brand-mark {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    font-size: 14px;
  }

  .mobile-logo span {
    font-size: 14px;
    font-weight: 750;
    letter-spacing: 1px;
  }

  .mobile-page-title {
    color: var(--muted);
    font-size: 12px;
  }

  .content {
    padding: 22px 15px 30px;
  }

  .page-head {
    align-items: flex-start;
    margin-bottom: 18px;
  }

  .page-title {
    font-size: 24px;
  }

  .stats {
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 10px;
  }

  .stat-card {
    min-height: 105px;
    padding: 15px;
  }

  .stat-value {
    font-size: 22px;
    margin-top: 9px;
  }

  .stat-label {
    font-size: 10px;
  }

  .bottom-nav {
    position: fixed;
    display: grid;
    grid-template-columns: repeat(4,1fr);
    z-index: 50;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 7px 8px calc(7px + env(safe-area-inset-bottom));
    background: rgba(36,35,33,.97);
    border-top: 1px solid rgba(232,222,200,.12);
    box-shadow: 0 -8px 25px rgba(36,35,33,.12);
  }

  .bottom-nav button {
    min-width: 0;
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.54);
    padding: 7px 3px;
    cursor: pointer;
    border-radius: 10px;
  }

  .bottom-nav button.active {
    color: var(--champagne-light);
    background: rgba(200,181,138,.10);
  }

  .bottom-icon {
    display: block;
    font-size: 17px;
    line-height: 19px;
  }

  .bottom-label {
    display: block;
    margin-top: 3px;
    font-size: 9px;
  }

  .mobile-more {
    display: none;
    position: fixed;
    z-index: 60;
    left: 10px;
    right: 10px;
    bottom: calc(70px + env(safe-area-inset-bottom));
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 14px 40px rgba(36,35,33,.18);
    padding: 8px;
  }

  .mobile-more.open {
    display: block;
  }

  .mobile-more button {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    padding: 13px;
    border-radius: 9px;
    color: var(--text);
  }

  .mobile-more button:hover {
    background: var(--milk);
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions .button {
    flex: 1;
  }

  .toolbar {
    align-items: stretch;
  }

  .search {
    flex-basis: 100%;
    min-width: 100%;
  }

  .toolbar .button {
    flex: 1;
  }

  .card-pad {
    padding: 16px;
  }

  .detail-title {
    font-size: 19px;
  }
}

@media (max-width: 460px) {
  .stats {
    gap: 8px;
  }

  .stat-card {
    min-height: 96px;
    padding: 13px;
  }

  .stat-value {
    font-size: 19px;
  }

  .content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .login-page {
    padding: 15px;
  }

  .login-card {
    padding: 24px 18px;
    border-radius: 18px;
  }

  .period-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .period-box .button {
    grid-column: 1 / -1;
  }
}
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Обзор", icon: "⌂" },
  { id: "clients", label: "Клиенты", icon: "♙" },
  { id: "operations", label: "Операции", icon: "↗" },
  { id: "payable", label: "К оплате", icon: "₽" },
  { id: "history", label: "История", icon: "◷" }
];

function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number) + " ₽";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU").format(d);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function getTariffLabel(type) {
  const map = {
    small: "Малый",
    medium: "Средний",
    large: "Большой",
    storage: "Хранение"
  };
  return map[type] || type || "—";
}

function getStatusLabel(status) {
  const map = {
    active: "Активна",
    cancelled: "Отменена",
    planned: "Запланировано",
    completed: "Завершено"
  };
  return map[status] || status || "—";
}

function AppStyles() {
  return <style>{APP_CSS}</style>;
}

function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

    if (loginError) {
      setError(loginError.message);
    } else {
      onLoggedIn(data.session);
    }

    setLoading(false);
  }

  return (
    <>
      <AppStyles />
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-mark">S</div>
            <h1>SORTEX</h1>
            <p>Операционный кабинет</p>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={login}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                required
                autoComplete="email"
              />
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="login-actions">
              <button
                className="button primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Вход..." : "Войти"}
              </button>
            </div>
          </form>

          <div className="login-footer">
            SORTEX WMS · Central Operations
          </div>
        </div>
      </div>
    </>
  );
}

function Sidebar({ activePage, setPage, user, logout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">SORTEX</div>
          <div className="brand-sub">WMS Operations</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-mini">{user?.email}</div>
        <button className="logout-button" onClick={logout}>
          Выйти
        </button>
      </div>
    </aside>
  );
}

function MobileNavigation({ activePage, setPage }) {
  const main = [
    NAV_ITEMS[0],
    NAV_ITEMS[1],
    NAV_ITEMS[2]
  ];

  return (
    <>
      <div className="bottom-nav">
        {main.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => setPage(item.id)}
          >
            <span className="bottom-icon">{item.icon}</span>
            <span className="bottom-label">{item.label}</span>
          </button>
        ))}

        <button
          className={
            activePage === "payable" || activePage === "history"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage(
              activePage === "payable" || activePage === "history"
                ? "dashboard"
                : "payable"
            )
          }
        >
          <span className="bottom-icon">•••</span>
          <span className="bottom-label">Ещё</span>
        </button>
      </div>
    </>
  );
}

function MobileHeader({ pageTitle }) {
  return (
    <header className="mobile-header">
      <div className="mobile-logo">
        <div className="brand-mark">S</div>
        <span>SORTEX</span>
      </div>
      <div className="mobile-page-title">{pageTitle}</div>
    </header>
  );
}

function Dashboard({ clients, operations, storage }) {
  const activeOperations = operations.filter(
    (x) => x.status === "active"
  );

  const activeStorage = storage.filter(
    (x) => x.status !== "cancelled"
  );

  const operationsTotal = activeOperations.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const storageTotal = activeStorage.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  const total = operationsTotal + storageTotal;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Обзор</h1>
          <div className="page-subtitle">
            Текущее состояние операционных начислений
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="card stat-card">
          <div className="stat-label">Клиенты</div>
          <div className="stat-value">{clients.length}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Операции</div>
          <div className="stat-value">
            {activeOperations.length}
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Хранение</div>
          <div className="stat-value">
            {activeStorage.length}
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Начислено</div>
          <div className="stat-value accent">
            {formatMoney(total)}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="section-title">Финансовая сводка</h2>

        <div className="info-list">
          <div className="info-row">
            <span className="info-label">
              Операционные услуги
            </span>
            <span className="info-value amount">
              {formatMoney(operationsTotal)}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Хранение</span>
            <span className="info-value amount">
              {formatMoney(storageTotal)}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Всего начислено</span>
            <span className="info-value amount accent">
              {formatMoney(total)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function Clients({
  clients,
  search,
  setSearch,
  onAdd,
  onOpen
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        client.name,
        client.legal_name,
        client.inn,
        client.contact_name,
        client.phone,
        client.email
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, search]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Клиенты</h1>
          <div className="page-subtitle">
            Клиенты и связанные операционные начисления
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <span className="search-symbol">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск клиента..."
          />
        </div>

        <button className="button primary" onClick={onAdd}>
          + Добавить клиента
        </button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">♙</div>
            <div>Клиенты не найдены</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Контакт</th>
                  <th>Телефон</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="client-name">
                        {client.name}
                      </div>

                      {client.legal_name &&
                        client.legal_name !== client.name && (
                          <div className="client-secondary">
                            {client.legal_name}
                          </div>
                        )}
                    </td>

                    <td>{client.contact_name || "—"}</td>
                    <td>{client.phone || "—"}</td>

                    <td>
                      <span
                        className={`badge ${
                          client.is_active
                            ? "active"
                            : "cancelled"
                        }`}
                      >
                        {client.is_active
                          ? "Активен"
                          : "Неактивен"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="button small"
                        onClick={() => onOpen(client)}
                      >
                        Открыть
                      </button>
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

function ClientForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    legal_name: initial?.legal_name || "",
    inn: initial?.inn || "",
    contact_name: initial?.contact_name || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    notes: initial?.notes || ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      legal_name: form.legal_name.trim() || null,
      inn: form.inn.trim() || null,
      contact_name: form.contact_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null
    };

    if (!payload.name) {
      setError("Укажите название клиента.");
      setSaving(false);
      return;
    }

    let result;

    if (initial) {
      result = await supabase
        .from("clients")
        .update(payload)
        .eq("id", initial.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      onSaved(result.data);
    }

    setSaving(false);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {initial ? "Редактирование клиента" : "Новый клиент"}
          </h1>
          <div className="page-subtitle">
            Основная информация о клиенте
          </div>
        </div>
      </div>

      <div className="card card-pad form-card">
        {error && <div className="error">{error}</div>}

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="field">
              <label>Название *</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Название клиента"
                required
              />
            </div>

            <div className="field">
              <label>Юридическое название</label>
              <input
                value={form.legal_name}
                onChange={(e) =>
                  update("legal_name", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label>ИНН</label>
              <input
                value={form.inn}
                onChange={(e) => update("inn", e.target.value)}
              />
            </div>

            <div className="field">
              <label>Контактное лицо</label>
              <input
                value={form.contact_name}
                onChange={(e) =>
                  update("contact_name", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label>Телефон</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="field full">
              <label>Примечание</label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button"
              onClick={onCancel}
            >
              Отмена
            </button>

            <button
              type="submit"
              className="button primary"
              disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function ClientDetail({
  client,
  operations,
  storage,
  onBack,
  onEdit,
  reload
}) {
  const [showOperation, setShowOperation] = useState(false);

  const clientOperations = operations.filter(
    (x) => x.client_id === client.id
  );

  const clientStorage = storage.filter(
    (x) => x.client_id === client.id
  );

  const total =
    clientOperations
      .filter((x) => x.status === "active")
      .reduce((s, x) => s + Number(x.total_rub || 0), 0) +
    clientStorage
      .filter((x) => x.status !== "cancelled")
      .reduce((s, x) => s + Number(x.total_rub || 0), 0);

  if (showOperation) {
    return (
      <OperationForm
        clients={[client]}
        onCancel={() => setShowOperation(false)}
        onSaved={() => {
          setShowOperation(false);
          reload();
        }}
      />
    );
  }

  return (
    <>
      <div className="detail-head">
        <button className="back" onClick={onBack}>
          ←
        </button>

        <div>
          <div className="detail-title">{client.name}</div>
          <div className="page-subtitle">
            Карточка клиента
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card card-pad">
          <h2 className="section-title">
            Основная информация
          </h2>

          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Название</span>
              <span className="info-value">
                {client.name}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">
                Юридическое название
              </span>
              <span className="info-value">
                {client.legal_name || "—"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">ИНН</span>
              <span className="info-value">
                {client.inn || "—"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Контакт</span>
              <span className="info-value">
                {client.contact_name || "—"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Телефон</span>
              <span className="info-value">
                {client.phone || "—"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">
                {client.email || "—"}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button className="button" onClick={onEdit}>
              Редактировать
            </button>

            <button
              className="button primary"
              onClick={() => setShowOperation(true)}
            >
              + Начисление
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="section-title">
            Текущие начисления
          </h2>

          <div
            style={{
              fontSize: 29,
              fontWeight: 750,
              color: "#9D8450",
              marginBottom: 10
            }}
          >
            {formatMoney(total)}
          </div>

          <div className="page-subtitle">
            Активные операции и хранение
          </div>

          <div className="info-list" style={{ marginTop: 18 }}>
            <div className="info-row">
              <span className="info-label">Операций</span>
              <span className="info-value">
                {clientOperations.length}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Хранение</span>
              <span className="info-value">
                {clientStorage.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-pad">
          <h2 className="section-title">
            Последние операции
          </h2>

          {clientOperations.length === 0 ? (
            <div className="empty">
              Операций пока нет
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Тип</th>
                    <th>Количество</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                  </tr>
                </thead>

                <tbody>
                  {clientOperations.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.shipment_date)}</td>
                      <td>{getTariffLabel(item.tariff_type)}</td>
                      <td>{item.quantity}</td>
                      <td className="amount">
                        {formatMoney(item.total_rub)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "cancelled"
                              ? "cancelled"
                              : "active"
                          }`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OperationForm({ clients, onCancel, onSaved }) {
  const [form, setForm] = useState({
    client_id: clients[0]?.id || "",
    shipment_date: todayString(),
    quantity: "1",
    tariff_type: "small",
    unit_price_rub: "30",
    note: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pricePresets = {
    small: 30,
    medium: 40,
    large: 55
  };

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function changeTariff(value) {
    setForm((prev) => ({
      ...prev,
      tariff_type: value,
      unit_price_rub: String(pricePresets[value] || 0)
    }));
  }

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.client_id) {
      setError("Выберите клиента.");
      setLoading(false);
      return;
    }

    const quantity = Number(form.quantity);
    const price = Number(form.unit_price_rub);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Количество должно быть больше нуля.");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Укажите корректную цену.");
      setLoading(false);
      return;
    }

    const total = Math.round(quantity * price * 100) / 100;

    const { data: authData } =
      await supabase.auth.getUser();

    const payload = {
      client_id: form.client_id,
      shipment_date: form.shipment_date,
      quantity,
      tariff_type: form.tariff_type,
      unit_price_rub: price,
      total_rub: total,
      note: form.note.trim() || null,
      created_by: authData?.user?.id || null
    };

    const { data, error: insertError } = await supabase
      .from("shipments")
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      onSaved(data);
    }

    setLoading(false);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Новое начисление</h1>
          <div className="page-subtitle">
            Операционная услуга клиента
          </div>
        </div>
      </div>

      <div className="card card-pad form-card">
        <div className="notice">
          Начисление фиксируется как финансовая операция.
          Товарные остатки и приход в SORTEX не ведутся —
          фактический складской учёт остаётся в МойСклад.
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="field full">
              <label>Клиент *</label>
              <select
                value={form.client_id}
                onChange={(e) =>
                  update("client_id", e.target.value)
                }
              >
                <option value="">Выберите клиента</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Дата *</label>
              <input
                type="date"
                value={form.shipment_date}
                onChange={(e) =>
                  update("shipment_date", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label>Количество *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) =>
                  update("quantity", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label>Тариф *</label>
              <select
                value={form.tariff_type}
                onChange={(e) =>
                  changeTariff(e.target.value)
                }
              >
                <option value="small">Малый</option>
                <option value="medium">Средний</option>
                <option value="large">Большой</option>
              </select>
            </div>

            <div className="field">
              <label>Цена за единицу, ₽ *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_price_rub}
                onChange={(e) =>
                  update("unit_price_rub", e.target.value)
                }
              />
            </div>

            <div className="field full">
              <label>Примечание</label>
              <textarea
                value={form.note}
                onChange={(e) =>
                  update("note", e.target.value)
                }
                placeholder="Дополнительная информация"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button"
              onClick={onCancel}
            >
              Отмена
            </button>

            <button
              type="submit"
              className="button primary"
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Создать начисление"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Operations({
  operations,
  clients,
  onAdd,
  onCancelOperation,
  reload
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return operations;

    return operations.filter((item) =>
      [
        item.clients?.name,
        item.products?.name,
        item.products?.sku,
        item.tariff_type,
        item.note
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [operations, search]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Операции</h1>
          <div className="page-subtitle">
            Услуги и финансовые начисления
          </div>
        </div>
      </div>

      <div className="notice">
        SORTEX хранит здесь именно операционные и финансовые
        данные. Складские остатки, приходы и движения товара
        ведутся отдельно в МойСклад.
      </div>

      <div className="toolbar">
        <div className="search">
          <span className="search-symbol">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по операциям..."
          />
        </div>

        <button className="button primary" onClick={onAdd}>
          + Новое начисление
        </button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">↗</div>
            <div>Операций пока нет</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Услуга</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.shipment_date)}</td>

                    <td>
                      {item.clients?.name || "—"}
                    </td>

                    <td>
                      {getTariffLabel(item.tariff_type)}
                    </td>

                    <td>{item.quantity}</td>

                    <td>
                      {formatMoney(item.unit_price_rub)}
                    </td>

                    <td className="amount">
                      {formatMoney(item.total_rub)}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          item.status === "cancelled"
                            ? "cancelled"
                            : "active"
                        }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    <td>
                      {item.status !== "cancelled" && (
                        <button
                          className="button small danger"
                          onClick={async () => {
                            await onCancelOperation(item.id);
                            reload();
                          }}
                        >
                          Отменить
                        </button>
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
  );
}

function Payable({ clients, operations, storage }) {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(todayString());

  const data = useMemo(() => {
    const result = new Map();

    clients.forEach((client) => {
      result.set(client.id, {
        client_id: client.id,
        client_name: client.name,
        shipment: 0,
        storage: 0
      });
    });

    operations
      .filter((x) => x.status === "active")
      .filter(
        (x) =>
          x.shipment_date >= from &&
          x.shipment_date <= to
      )
      .forEach((x) => {
        const row = result.get(x.client_id);
        if (row) {
          row.shipment += Number(x.total_rub || 0);
        }
      });

    storage
      .filter((x) => x.status !== "cancelled")
      .filter((x) => {
        const start = x.start_date || "";
        const end = x.end_date || x.start_date || "";
        return end >= from && start <= to;
      })
      .forEach((x) => {
        const row = result.get(x.client_id);
        if (row) {
          row.storage += Number(x.total_rub || 0);
        }
      });

    return [...result.values()]
      .map((x) => ({
        ...x,
        total: x.shipment + x.storage
      }))
      .filter((x) => x.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [clients, operations, storage, from, to]);

  const grandTotal = data.reduce(
    (sum, x) => sum + x.total,
    0
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">К оплате</h1>
          <div className="page-subtitle">
            Начисления за выбранный период
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="period-box">
          <div className="field">
            <label>С</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="field">
            <label>По</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            className="button"
            onClick={() => {
              setFrom(firstDayOfMonth());
              setTo(todayString());
            }}
          >
            Этот месяц
          </button>
        </div>
      </div>

      <div className="notice">
        Сейчас раздел показывает активные начисления за период.
        Отдельные статусы счёта «выставлен / оплачен» пока не
        записываются в БД, поскольку для них требуется отдельная
        сущность биллинга.
      </div>

      <div className="stats">
        <div className="card stat-card">
          <div className="stat-label">Клиентов к оплате</div>
          <div className="stat-value">{data.length}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Всего начислено</div>
          <div className="stat-value accent">
            {formatMoney(grandTotal)}
          </div>
        </div>
      </div>

      <div className="card">
        {data.length === 0 ? (
          <div className="empty">
            За выбранный период начислений нет.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Услуги</th>
                  <th>Хранение</th>
                  <th>Всего</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row) => (
                  <tr key={row.client_id}>
                    <td className="client-name">
                      {row.client_name}
                    </td>

                    <td>{formatMoney(row.shipment)}</td>
                    <td>{formatMoney(row.storage)}</td>

                    <td className="amount accent">
                      {formatMoney(row.total)}
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

function History({ audit }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">История</h1>
          <div className="page-subtitle">
            Журнал изменений системы
          </div>
        </div>
      </div>

      <div className="card">
        {audit.length === 0 ? (
          <div className="empty">
            История пока пуста.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Объект</th>
                  <th>Действие</th>
                  <th>Пользователь</th>
                </tr>
              </thead>

              <tbody>
                {audit.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.changed_at)}</td>
                    <td>{item.entity_type || "—"}</td>
                    <td>{item.action || "—"}</td>
                    <td>
                      {item.changed_by || "Система"}
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

function App({ session }) {
  const [activePage, setActivePage] = useState("dashboard");

  const [clients, setClients] = useState([]);
  const [operations, setOperations] = useState([]);
  const [storage, setStorage] = useState([]);
  const [audit, setAudit] = useState([]);

  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [clientSearch, setClientSearch] = useState("");

  const [selectedClient, setSelectedClient] = useState(null);
  const [clientForm, setClientForm] = useState(null);

  async function loadData() {
    setLoading(true);
    setGlobalError("");

    const [
      clientsResult,
      operationsResult,
      storageResult,
      auditResult
    ] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("name"),

      supabase
        .from("shipments")
        .select("*, clients(name), products(name, sku)")
        .order("shipment_date", { ascending: false }),

      supabase
        .from("storage_records")
        .select("*, clients(name)")
        .order("start_date", { ascending: false }),

      supabase
        .from("audit_log")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(100)
    ]);

    const firstError =
      clientsResult.error ||
      operationsResult.error ||
      storageResult.error ||
      auditResult.error;

    if (firstError) {
      setGlobalError(firstError.message);
    }

    setClients(clientsResult.data || []);
    setOperations(operationsResult.data || []);
    setStorage(storageResult.data || []);
    setAudit(auditResult.data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  async function cancelOperation(id) {
    const confirmed = window.confirm(
      "Отменить эту финансовую операцию? Физически она удалена не будет."
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc(
      "cancel_shipment",
      {
        p_shipment_id: id
      }
    );

    if (error) {
      alert(error.message);
    }
  }

  function pageTitle() {
    const found = NAV_ITEMS.find(
      (x) => x.id === activePage
    );
    return found?.label || "SORTEX";
  }

  if (loading) {
    return (
      <>
        <AppStyles />
        <div className="loading">Загрузка SORTEX...</div>
      </>
    );
  }

  if (clientForm !== null) {
    return (
      <>
        <AppStyles />
        <div className="app">
          <Sidebar
            activePage="clients"
            setPage={(page) => {
              setClientForm(null);
              setActivePage(page);
            }}
            user={session.user}
            logout={logout}
          />

          <main className="main">
            <MobileHeader pageTitle="Клиенты" />

            <div className="content">
              <ClientForm
                initial={clientForm}
                onCancel={() => setClientForm(null)}
                onSaved={(saved) => {
                  setClientForm(null);
                  setSelectedClient(saved);
                  loadData();
                }}
              />
            </div>
          </main>
        </div>
      </>
    );
  }

  if (selectedClient) {
    const currentClient =
      clients.find((x) => x.id === selectedClient.id) ||
      selectedClient;

    return (
      <>
        <AppStyles />

        <div className="app">
          <Sidebar
            activePage="clients"
            setPage={(page) => {
              setSelectedClient(null);
              setActivePage(page);
            }}
            user={session.user}
            logout={logout}
          />

          <main className="main">
            <MobileHeader pageTitle={currentClient.name} />

            <div className="content">
              <ClientDetail
                client={currentClient}
                operations={operations}
                storage={storage}
                onBack={() => setSelectedClient(null)}
                onEdit={() => setClientForm(currentClient)}
                reload={loadData}
              />
            </div>
          </main>
        </div>
      </>
    );
  }

  let page;

  if (activePage === "dashboard") {
    page = (
      <Dashboard
        clients={clients}
        operations={operations}
        storage={storage}
      />
    );
  }

  if (activePage === "clients") {
    page = (
      <Clients
        clients={clients}
        search={clientSearch}
        setSearch={setClientSearch}
        onAdd={() => setClientForm({})}
        onOpen={(client) => setSelectedClient(client)}
      />
    );
  }

  if (activePage === "operations") {
    page = (
      <Operations
        operations={operations}
        clients={clients}
        onAdd={() => setActivePage("new-operation")}
        onCancelOperation={cancelOperation}
        reload={loadData}
      />
    );
  }

  if (activePage === "new-operation") {
    page = (
      <OperationForm
        clients={clients}
        onCancel={() => setActivePage("operations")}
        onSaved={() => {
          setActivePage("operations");
          loadData();
        }}
      />
    );
  }

  if (activePage === "payable") {
    page = (
      <Payable
        clients={clients}
        operations={operations}
        storage={storage}
      />
    );
  }

  if (activePage === "history") {
    page = <History audit={audit} />;
  }

  return (
    <>
      <AppStyles />

      <div className="app">
        <Sidebar
          activePage={activePage}
          setPage={setActivePage}
          user={session.user}
          logout={logout}
        />

        <main className="main">
          <MobileHeader pageTitle={pageTitle()} />

          <div className="topbar">
            <div className="topbar-title">
              {pageTitle()}
            </div>

            <div className="topbar-date">
              {new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric"
              }).format(new Date())}
            </div>
          </div>

          <div className="content">
            {globalError && (
              <div className="error">{globalError}</div>
            )}

            {page}
          </div>
        </main>

        <MobileNavigation
          activePage={activePage}
          setPage={setActivePage}
        />
      </div>
    </>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <AppStyles />
        <div className="loading">
          Загрузка SORTEX...
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <Login
        onLoggedIn={(newSession) =>
          setSession(newSession)
        }
      />
    );
  }

  return <App session={session} />;
}

createRoot(document.getElementById("root")).render(
  <Root />
);
