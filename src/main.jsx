import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* =========================================================
   DESIGN
========================================================= */

const APP_CSS = `
:root {
  --graphite: #242321;
  --graphite-soft: #302e2a;
  --champagne: #c8b58a;
  --champagne-light: #e8dec8;
  --milk: #f7f5f0;
  --card: #fffdf9;
  --border: #ded9cf;
  --text: #292825;
  --muted: #77736b;
  --green: #6f806f;
  --amber: #a88d5c;
  --blue: #667b8d;
  --wine: #8b6464;
  --shadow: 0 10px 30px rgba(36,35,33,.07);
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
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Display",
    "SF Pro Text",
    "Segoe UI",
    sans-serif;
  background: var(--milk);
  color: var(--text);
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
  background: var(--milk);
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  flex: 0 0 250px;
  background: var(--graphite);
  color: #fff;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  padding: 4px 12px 28px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: .08em;
}

.brand-subtitle {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255,255,255,.48);
  letter-spacing: .13em;
  text-transform: uppercase;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-button {
  border: 0;
  background: transparent;
  color: rgba(255,255,255,.68);
  border-radius: 12px;
  padding: 12px 14px;
  text-align: left;
  font-size: 14px;
  position: relative;
  transition: .2s ease;
}

.nav-button:hover {
  background: rgba(200,181,138,.08);
  color: #fff;
}

.nav-button.active {
  background: rgba(200,181,138,.12);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(200,181,138,.08);
}

.nav-button.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: var(--champagne);
  border-radius: 4px;
}

.sidebar-bottom {
  margin-top: auto;
}

.user-mini {
  border-top: 1px solid rgba(255,255,255,.08);
  padding: 16px 10px 0;
  margin-top: 12px;
}

.user-email {
  color: rgba(255,255,255,.5);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-button {
  margin-top: 12px;
  width: 100%;
  border: 1px solid rgba(255,255,255,.12);
  background: transparent;
  color: rgba(255,255,255,.7);
  border-radius: 10px;
  padding: 10px;
}

.logout-button:hover {
  background: rgba(255,255,255,.05);
  color: #fff;
}

.main {
  flex: 1;
  min-width: 0;
}

.mobile-header {
  display: none;
}

.content {
  max-width: 1450px;
  margin: 0 auto;
  padding: 32px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 26px;
}

.page-title {
  margin: 0;
  font-size: 30px;
  letter-spacing: -.03em;
}

.page-subtitle {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.card-padding {
  padding: 22px;
}

.grid {
  display: grid;
  gap: 18px;
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0,1fr));
}

.grid-3 {
  grid-template-columns: repeat(3, minmax(0,1fr));
}

.grid-4 {
  grid-template-columns: repeat(4, minmax(0,1fr));
}

.stat {
  padding: 21px;
}

.stat-label {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 27px;
  font-weight: 650;
  letter-spacing: -.025em;
}

.stat-accent {
  color: #8e7950;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search {
  flex: 1;
  min-width: 220px;
}

.input,
.select,
.textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  border-radius: 11px;
  padding: 12px 13px;
  outline: none;
  transition: .18s ease;
}

.input:focus,
.select:focus,
.textarea:focus {
  border-color: var(--champagne);
  box-shadow: 0 0 0 3px rgba(200,181,138,.13);
}

.textarea {
  resize: vertical;
  min-height: 90px;
}

.label {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 7px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 15px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 15px;
}

.field-full {
  grid-column: 1 / -1;
}

.primary-button,
.secondary-button,
.danger-button {
  border-radius: 11px;
  padding: 11px 15px;
  border: 1px solid transparent;
  transition: .18s ease;
}

.primary-button {
  background: var(--graphite);
  color: #fff;
  border-color: var(--graphite);
}

.primary-button:hover {
  box-shadow: 0 0 0 4px rgba(200,181,138,.12);
}

.secondary-button {
  background: #fff;
  color: var(--text);
  border-color: var(--border);
}

.secondary-button:hover {
  border-color: var(--champagne);
  box-shadow: 0 0 0 3px rgba(200,181,138,.09);
}

.danger-button {
  background: #fff;
  color: var(--wine);
  border-color: #d9caca;
}

.danger-button:hover {
  background: #fbf5f5;
}

.button-row {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

.list {
  display: flex;
  flex-direction: column;
}

.list-row {
  display: grid;
  grid-template-columns: minmax(0,1fr) auto;
  gap: 16px;
  padding: 17px 20px;
  border-bottom: 1px solid var(--border);
  align-items: center;
}

.list-row:last-child {
  border-bottom: 0;
}

.list-main {
  min-width: 0;
}

.list-title {
  font-weight: 600;
  font-size: 15px;
}

.list-meta {
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.list-right {
  text-align: right;
}

.money {
  font-weight: 650;
}

.muted {
  color: var(--muted);
}

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 600;
}

.badge-active {
  color: var(--green);
  background: rgba(111,128,111,.11);
}

.badge-cancelled {
  color: var(--wine);
  background: rgba(139,100,100,.11);
}

.badge-shipment {
  color: #85704a;
  background: rgba(200,181,138,.18);
}

.section-title {
  margin: 0 0 15px;
  font-size: 17px;
}

.client-card {
  padding: 20px;
  transition: .18s ease;
}

.client-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(36,35,33,.09);
}

.client-name {
  font-weight: 650;
  font-size: 17px;
}

.client-contact {
  margin-top: 7px;
  color: var(--muted);
  font-size: 13px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.back {
  color: var(--muted);
  border: 0;
  background: transparent;
  padding: 0;
  margin-bottom: 14px;
}

.back:hover {
  color: var(--text);
}

.total-box {
  padding: 20px;
  border-radius: 15px;
  background: #f5f0e6;
  border: 1px solid #e7dfce;
}

.total-label {
  font-size: 12px;
  color: var(--muted);
}

.total-value {
  margin-top: 6px;
  font-size: 28px;
  font-weight: 700;
  color: #806d49;
}

.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 0%, rgba(200,181,138,.10), transparent 38%),
    var(--graphite);
}

.login-card {
  width: min(420px, 100%);
  background: var(--card);
  border-radius: 22px;
  padding: 32px;
  box-shadow: 0 25px 70px rgba(0,0,0,.28);
}

.login-brand {
  font-size: 29px;
  font-weight: 750;
  letter-spacing: .08em;
}

.login-caption {
  margin: 7px 0 26px;
  color: var(--muted);
  font-size: 13px;
}

.error {
  padding: 11px 13px;
  border-radius: 10px;
  background: #faf2f2;
  color: var(--wine);
  font-size: 13px;
  border: 1px solid #ead8d8;
  margin-bottom: 14px;
}

.success {
  padding: 11px 13px;
  border-radius: 10px;
  background: #f2f6f2;
  color: var(--green);
  font-size: 13px;
  border: 1px solid #dce6dc;
  margin-bottom: 14px;
}

.loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: var(--muted);
}

.mobile-nav {
  display: none;
}

.weight-hint {
  margin-top: 7px;
  color: var(--muted);
  font-size: 11px;
}

.price-preview {
  padding: 17px;
  background: #f8f4eb;
  border: 1px solid #e9dfcb;
  border-radius: 13px;
}

.price-preview-label {
  color: var(--muted);
  font-size: 12px;
}

.price-preview-value {
  margin-top: 5px;
  color: #806d49;
  font-size: 25px;
  font-weight: 700;
}

.quick-card {
  padding: 20px;
}

.quick-card-title {
  font-weight: 650;
  margin-bottom: 6px;
}

.quick-card-text {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

@media (max-width: 1050px) {
  .grid-4 {
    grid-template-columns: repeat(2, minmax(0,1fr));
  }

  .sidebar {
    width: 220px;
    flex-basis: 220px;
  }
}

@media (max-width: 800px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    display: none;
  }

  .mobile-header {
    display: flex;
    height: 62px;
    align-items: center;
    justify-content: space-between;
    padding: 0 17px;
    background: var(--graphite);
    color: #fff;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .mobile-brand {
    font-weight: 700;
    letter-spacing: .08em;
  }

  .mobile-header-title {
    color: rgba(255,255,255,.55);
    font-size: 12px;
  }

  .content {
    padding: 21px 15px 95px;
  }

  .page-head {
    margin-bottom: 19px;
  }

  .page-title {
    font-size: 25px;
  }

  .grid-2,
  .grid-3,
  .grid-4,
  .form-grid,
  .form-grid-3 {
    grid-template-columns: 1fr;
  }

  .mobile-nav {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 10px;
    z-index: 30;
    background: rgba(36,35,33,.97);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 18px;
    padding: 6px;
    box-shadow: 0 12px 35px rgba(0,0,0,.25);
  }

  .mobile-nav button {
    min-width: 0;
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.52);
    padding: 9px 3px;
    border-radius: 12px;
    font-size: 10px;
  }

  .mobile-nav button.active {
    color: var(--champagne-light);
    background: rgba(200,181,138,.10);
  }

  .list-row {
    grid-template-columns: 1fr;
  }

  .list-right {
    text-align: left;
  }

  .toolbar {
    align-items: stretch;
  }

  .search {
    min-width: 100%;
  }

  .detail-head {
    flex-direction: column;
  }
}

@media (max-width: 430px) {
  .content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .card-padding,
  .stat,
  .client-card,
  .quick-card {
    padding: 16px;
  }

  .login-card {
    padding: 25px 20px;
  }
}
`;

/* =========================================================
   HELPERS
========================================================= */

const money = (value) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const dateRu = (value) => {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU");
};

const today = () => new Date().toISOString().slice(0, 10);

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">SORTEX</div>
        <div className="login-caption">
          WMS · операции · расчёты
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 15 }}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="label">Пароль</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

const NAV = [
  ["dashboard", "Обзор"],
  ["clients", "Клиенты"],
  ["products", "Товары"],
  ["operations", "Операции"],
  ["shipment", "Отгрузка"],
  ["payable", "К оплате"],
  ["history", "История"],
];

function Sidebar({ page, setPage, email, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-name">SORTEX</div>
        <div className="brand-subtitle">
          financial operations
        </div>
      </div>

      <nav className="nav">
        {NAV.map(([id, title]) => (
          <button
            key={id}
            className={`nav-button ${page === id ? "active" : ""}`}
            onClick={() => setPage(id)}
          >
            {title}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-mini">
          <div className="user-email">{email}</div>
          <button className="logout-button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ page }) {
  const title =
    NAV.find(([id]) => id === page)?.[1] || "SORTEX";

  return (
    <header className="mobile-header">
      <div className="mobile-brand">SORTEX</div>
      <div className="mobile-header-title">{title}</div>
    </header>
  );
}

function MobileNavigation({ page, setPage }) {
  const mobileItems = [
    ["dashboard", "Обзор"],
    ["clients", "Клиенты"],
    ["shipment", "Отгрузка"],
    ["payable", "К оплате"],
    ["operations", "Ещё"],
  ];

  return (
    <nav className="mobile-nav">
      {mobileItems.map(([id, title]) => (
        <button
          key={id}
          className={page === id ? "active" : ""}
          onClick={() => setPage(id)}
        >
          {title}
        </button>
      ))}
    </nav>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ setPage }) {
  const [clientsCount, setClientsCount] = useState(0);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [{ count }, { data }] = await Promise.all([
      supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),

      supabase
        .from("shipments")
        .select("*, clients(name), products(name, sku)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    setClientsCount(count || 0);
    setOperations(data || []);
    setLoading(false);
  }

  const activeTotal = operations
    .filter((x) => x.status === "active")
    .reduce((sum, x) => sum + Number(x.total_rub || 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Обзор</h1>
          <p className="page-subtitle">
            Контроль клиентов и финансовых операций SORTEX
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setPage("shipment")}
        >
          + Новая отгрузка
        </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card stat">
          <div className="stat-label">Активные клиенты</div>
          <div className="stat-value">{clientsCount}</div>
        </div>

        <div className="card stat">
          <div className="stat-label">Последние операции</div>
          <div className="stat-value">{operations.length}</div>
        </div>

        <div className="card stat">
          <div className="stat-label">Сумма активных</div>
          <div className="stat-value stat-accent">
            {loading ? "..." : `${money(activeTotal)} ₽`}
          </div>
        </div>

        <div className="card stat">
          <div className="stat-label">Базовый тариф отгрузки</div>
          <div className="stat-value stat-accent">8 ₽/кг</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-padding">
            <h2 className="section-title">Последние операции</h2>

            {operations.length === 0 ? (
              <div className="empty">
                Операций пока нет
              </div>
            ) : (
              <div className="list">
                {operations.map((item) => (
                  <div className="list-row" key={item.id}>
                    <div className="list-main">
                      <div className="list-title">
                        {item.clients?.name || "Клиент"}
                      </div>

                      <div className="list-meta">
                        {item.tariff_type === "shipment"
                          ? `Отгрузка · ${item.quantity} кг`
                          : `Операция · ${item.quantity} ед.`}
                        {" · "}
                        {dateRu(item.shipment_date)}
                      </div>
                    </div>

                    <div className="list-right">
                      <div className="money">
                        {money(item.total_rub)} ₽
                      </div>

                      <div style={{ marginTop: 5 }}>
                        <span
                          className={
                            item.status === "cancelled"
                              ? "badge badge-cancelled"
                              : "badge badge-active"
                          }
                        >
                          {item.status === "cancelled"
                            ? "Отменена"
                            : "Активна"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid">
          <div className="card quick-card">
            <div className="quick-card-title">
              Клиенты
            </div>
            <div className="quick-card-text">
              Управляйте клиентами и их контактными данными.
            </div>
            <button
              className="secondary-button"
              style={{ marginTop: 15 }}
              onClick={() => setPage("clients")}
            >
              Открыть клиентов
            </button>
          </div>

          <div className="card quick-card">
            <div className="quick-card-title">
              Товары
            </div>
            <div className="quick-card-text">
              Справочник товаров клиента. Без учёта складских остатков.
            </div>
            <button
              className="secondary-button"
              style={{ marginTop: 15 }}
              onClick={() => setPage("products")}
            >
              Открыть товары
            </button>
          </div>

          <div className="card quick-card">
            <div className="quick-card-title">
              Отгрузка по весу
            </div>
            <div className="quick-card-text">
              Стандартный тариф — 8 ₽/кг. Перед сохранением его можно
              заменить для конкретной операции.
            </div>
            <button
              className="primary-button"
              style={{ marginTop: 15 }}
              onClick={() => setPage("shipment")}
            >
              Добавить отгрузку
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   CLIENTS
========================================================= */

function Clients({ onOpenClient, onAddClient }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadClients() {
    setLoading(true);

    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("is_active", true)
      .order("name");

    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        client.name,
        client.legal_name,
        client.contact_name,
        client.phone,
        client.email,
        client.inn,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(q)
        )
    );
  }, [clients, search]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Клиенты</h1>
          <p className="page-subtitle">
            Клиенты и контактная информация
          </p>
        </div>

        <button className="primary-button" onClick={onAddClient}>
          + Добавить клиента
        </button>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-padding">
          <input
            className="input"
            placeholder="Поиск клиента..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card empty">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty">
          Клиенты не найдены
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((client) => (
            <button
              key={client.id}
              className="card client-card"
              onClick={() => onOpenClient(client)}
              style={{
                border: "1px solid var(--border)",
                textAlign: "left",
                color: "inherit",
              }}
            >
              <div className="client-name">
                {client.name}
              </div>

              {client.contact_name && (
                <div className="client-contact">
                  {client.contact_name}
                </div>
              )}

              {client.phone && (
                <div className="client-contact">
                  {client.phone}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* =========================================================
   CLIENT FORM
========================================================= */

function ClientForm({ initial, onBack, onSaved }) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState({
    name: initial?.name || "",
    legal_name: initial?.legal_name || "",
    inn: initial?.inn || "",
    contact_name: initial?.contact_name || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    notes: initial?.notes || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function change(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Укажи название клиента.");
      return;
    }

    setSaving(true);

    let result;

    if (isEdit) {
      result = await supabase
        .from("clients")
        .update(form)
        .eq("id", initial.id);
    } else {
      result = await supabase
        .from("clients")
        .insert(form);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <button className="back" onClick={onBack}>
            ← Назад
          </button>

          <h1 className="page-title">
            {isEdit ? "Редактирование клиента" : "Новый клиент"}
          </h1>

          <p className="page-subtitle">
            Основные данные клиента
          </p>
        </div>
      </div>

      <form className="card card-padding" onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="form-grid">
          <div>
            <label className="label">Название *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => change("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Юридическое название</label>
            <input
              className="input"
              value={form.legal_name}
              onChange={(e) =>
                change("legal_name", e.target.value)
              }
            />
          </div>

          <div>
            <label className="label">ИНН</label>
            <input
              className="input"
              value={form.inn}
              onChange={(e) => change("inn", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Контактное лицо</label>
            <input
              className="input"
              value={form.contact_name}
              onChange={(e) =>
                change("contact_name", e.target.value)
              }
            />
          </div>

          <div>
            <label className="label">Телефон</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => change("phone", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) =>
                change("email", e.target.value)
              }
            />
          </div>

          <div className="field-full">
            <label className="label">Примечание</label>
            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) => change("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 20 }}>
          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={onBack}
          >
            Отмена
          </button>
        </div>
      </form>
    </>
  );
}

/* =========================================================
   CLIENT DETAIL
========================================================= */

function ClientDetail({ client, onBack, onEdit }) {
  const [operations, setOperations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [client.id]);

  async function load() {
    setLoading(true);

    const [{ data: ops }, { data: productsData }] =
      await Promise.all([
        supabase
          .from("shipments")
          .select("*, products(name, sku)")
          .eq("client_id", client.id)
          .order("shipment_date", { ascending: false }),

        supabase
          .from("products")
          .select("*")
          .eq("client_id", client.id)
          .eq("is_active", true)
          .order("name"),
      ]);

    setOperations(ops || []);
    setProducts(productsData || []);
    setLoading(false);
  }

  const total = operations
    .filter((item) => item.status === "active")
    .reduce((sum, item) => sum + Number(item.total_rub || 0), 0);

  return (
    <>
      <div className="detail-head">
        <div>
          <button className="back" onClick={onBack}>
            ← Назад к клиентам
          </button>

          <h1 className="page-title">{client.name}</h1>

          <p className="page-subtitle">
            {client.contact_name || "Контактное лицо не указано"}
            {client.phone ? ` · ${client.phone}` : ""}
          </p>
        </div>

        <div className="button-row">
          <button className="secondary-button" onClick={onEdit}>
            Редактировать
          </button>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card stat">
          <div className="stat-label">Активные начисления</div>
          <div className="stat-value stat-accent">
            {money(total)} ₽
          </div>
        </div>

        <div className="card stat">
          <div className="stat-label">Товары клиента</div>
          <div className="stat-value">
            {products.length}
          </div>
        </div>

        <div className="card stat">
          <div className="stat-label">Операции</div>
          <div className="stat-value">
            {operations.length}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-padding">
            <h2 className="section-title">Данные клиента</h2>

            <div className="list-meta">
              Юридическое название
            </div>
            <div style={{ marginTop: 4 }}>
              {client.legal_name || "—"}
            </div>

            <div className="divider" />

            <div className="list-meta">ИНН</div>
            <div style={{ marginTop: 4 }}>
              {client.inn || "—"}
            </div>

            <div className="divider" />

            <div className="list-meta">Email</div>
            <div style={{ marginTop: 4 }}>
              {client.email || "—"}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-padding">
            <h2 className="section-title">
              Товары клиента
            </h2>

            {products.length === 0 ? (
              <div className="empty">
                Товаров пока нет.
              </div>
            ) : (
              <div className="list">
                {products.map((product) => (
                  <div className="list-row" key={product.id}>
                    <div>
                      <div className="list-title">
                        {product.name}
                      </div>
                      <div className="list-meta">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-padding">
          <h2 className="section-title">
            История операций
          </h2>

          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : operations.length === 0 ? (
            <div className="empty">
              Операций пока нет.
            </div>
          ) : (
            <div className="list">
              {operations.map((item) => (
                <div className="list-row" key={item.id}>
                  <div>
                    <div className="list-title">
                      {item.tariff_type === "shipment"
                        ? "Отгрузка по весу"
                        : "Операция"}
                    </div>

                    <div className="list-meta">
                      {item.products?.name || "Товар"}
                      {" · "}
                      {item.quantity}{" "}
                      {item.tariff_type === "shipment"
                        ? "кг"
                        : "ед."}
                      {" · "}
                      {dateRu(item.shipment_date)}
                    </div>
                  </div>

                  <div className="list-right">
                    <div className="money">
                      {money(item.total_rub)} ₽
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <span
                        className={
                          item.status === "cancelled"
                            ? "badge badge-cancelled"
                            : "badge badge-active"
                        }
                      >
                        {item.status === "cancelled"
                          ? "Отменена"
                          : "Активна"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   PRODUCTS
========================================================= */

function Products() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState("");
  const [form, setForm] = useState({
    sku: "",
    name: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);

    const [{ data: clientsData }, { data: productsData }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("products")
          .select("*, clients(name)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

    setClients(clientsData || []);
    setProducts(productsData || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProduct(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!clientId) {
      setError("Сначала выбери клиента.");
      return;
    }

    if (!form.sku.trim() || !form.name.trim()) {
      setError("Заполни SKU и название товара.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      client_id: clientId,
      sku: form.sku.trim(),
      name: form.name.trim(),
      notes: form.notes.trim() || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setForm({
        sku: "",
        name: "",
        notes: "",
      });
      setSuccess("Товар добавлен.");
      await load();
    }

    setSaving(false);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Товары</h1>
          <p className="page-subtitle">
            Справочник товаров клиентов. Остатки здесь не ведутся.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <form className="card card-padding" onSubmit={saveProduct}>
          <h2 className="section-title">
            Добавить товар
          </h2>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div style={{ marginBottom: 14 }}>
            <label className="label">Клиент *</label>
            <select
              className="select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Выбери клиента</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="label">SKU *</label>
            <input
              className="input"
              value={form.sku}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sku: e.target.value,
                }))
              }
              placeholder="Например: SKU-001"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="label">Название *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Примечание</label>
            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  notes: e.target.value,
                }))
              }
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Добавить товар"}
          </button>
        </form>

        <div className="card">
          <div className="card-padding">
            <h2 className="section-title">
              Справочник товаров
            </h2>

            {loading ? (
              <div className="empty">Загрузка...</div>
            ) : products.length === 0 ? (
              <div className="empty">
                Товаров пока нет.
              </div>
            ) : (
              <div className="list">
                {products.map((product) => (
                  <div className="list-row" key={product.id}>
                    <div>
                      <div className="list-title">
                        {product.name}
                      </div>
                      <div className="list-meta">
                        {product.clients?.name || "Клиент"}
                        {" · "}
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SHIPMENT
========================================================= */

function ShipmentForm({ onSaved }) {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [shipmentDate, setShipmentDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("8");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);

    const [{ data: clientsData }, { data: tariffData }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("system_tariffs")
          .select("price_rub")
          .eq("tariff_type", "shipment")
          .order("effective_from", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),
      ]);

    setClients(clientsData || []);

    if (tariffData?.price_rub !== undefined) {
      setPrice(String(tariffData.price_rub));
    } else {
      setPrice("8");
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!clientId) {
      setProducts([]);
      setProductId("");
      return;
    }

    loadProducts(clientId);
  }, [clientId]);

  async function loadProducts(selectedClientId) {
    const { data } = await supabase
      .from("products")
      .select("id, name, sku")
      .eq("client_id", selectedClientId)
      .eq("is_active", true)
      .order("name");

    setProducts(data || []);
    setProductId("");
  }

  const total =
    Number(weight || 0) * Number(price || 0);

  async function save(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!clientId) {
      setError("Выбери клиента.");
      return;
    }

    if (!productId) {
      setError("Выбери товар.");
      return;
    }

    if (!weight || Number(weight) <= 0) {
      setError("Укажи вес в кг.");
      return;
    }

    if (!Number.isInteger(Number(weight))) {
      setError(
        "Сейчас база принимает вес только целым числом килограммов."
      );
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Укажи корректный тариф.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("shipments")
      .insert({
        client_id: clientId,
        product_id: productId,
        shipment_date: shipmentDate,
        quantity: Number(weight),
        tariff_type: "shipment",
        unit_price_rub: Number(price),
        total_rub: Number(total.toFixed(2)),
        status: "active",
        note: note.trim() || null,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess(
      `Отгрузка сохранена. Начислено ${money(total)} ₽.`
    );

    setWeight("");
    setNote("");

    setSaving(false);

    if (onSaved) {
      onSaved();
    }
  }

  return (
    <form className="card card-padding" onSubmit={save}>
      <h2 className="section-title">
        Новая отгрузка
      </h2>

      <p className="page-subtitle" style={{ marginBottom: 20 }}>
        Отгрузка рассчитывается по весу. Базовый тариф — 8 ₽/кг.
        Его можно заменить перед сохранением.
      </p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {loading ? (
        <div className="empty">Загрузка...</div>
      ) : (
        <>
          <div className="form-grid">
            <div>
              <label className="label">
                Клиент *
              </label>

              <select
                className="select"
                value={clientId}
                onChange={(e) =>
                  setClientId(e.target.value)
                }
              >
                <option value="">
                  Выбери клиента
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
            </div>

            <div>
              <label className="label">
                Товар *
              </label>

              <select
                className="select"
                value={productId}
                onChange={(e) =>
                  setProductId(e.target.value)
                }
                disabled={!clientId}
              >
                <option value="">
                  {!clientId
                    ? "Сначала выбери клиента"
                    : products.length === 0
                    ? "У клиента нет товаров"
                    : "Выбери товар"}
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} · {product.sku}
                  </option>
                ))}
              </select>

              {clientId && products.length === 0 && (
                <div className="weight-hint">
                  Сначала добавь товар в разделе «Товары».
                </div>
              )}
            </div>

            <div>
              <label className="label">
                Дата отгрузки *
              </label>

              <input
                className="input"
                type="date"
                value={shipmentDate}
                onChange={(e) =>
                  setShipmentDate(e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">
                Вес, кг *
              </label>

              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
                placeholder="Например, 250"
              />

              <div className="weight-hint">
                Сейчас используется целое количество килограммов.
              </div>
            </div>

            <div>
              <label className="label">
                Тариф, ₽/кг *
              </label>

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />

              <div className="weight-hint">
                Стандартный тариф из базы: 8 ₽/кг.
              </div>
            </div>

            <div>
              <label className="label">
                Сумма
              </label>

              <div className="price-preview">
                <div className="price-preview-label">
                  Вес × тариф
                </div>

                <div className="price-preview-value">
                  {money(total)} ₽
                </div>
              </div>
            </div>

            <div className="field-full">
              <label className="label">
                Примечание
              </label>

              <textarea
                className="textarea"
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="При необходимости..."
              />
            </div>
          </div>

          <div className="button-row" style={{ marginTop: 20 }}>
            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Сохранение..."
                : "Сохранить отгрузку"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

function ShipmentPage({ setPage }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Отгрузка</h1>
          <p className="page-subtitle">
            Начисление услуги по весу
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <ShipmentForm
          onSaved={() => {
            // После сохранения остаёмся на странице,
            // чтобы можно было быстро добавить следующую.
          }}
        />

        <div className="grid">
          <div className="card quick-card">
            <div className="quick-card-title">
              Тариф
            </div>

            <div className="quick-card-text">
              Базовое значение из системных тарифов:
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#806d49",
                marginTop: 12,
              }}
            >
              8 ₽/кг
            </div>

            <div className="quick-card-text" style={{ marginTop: 8 }}>
              При создании конкретной операции тариф можно
              изменить.
            </div>
          </div>

          <div className="card quick-card">
            <div className="quick-card-title">
              Важно
            </div>

            <div className="quick-card-text">
              SORTEX не ведёт остатки склада. Товар здесь
              используется как справочник и привязка финансовой
              операции к клиенту.
            </div>
          </div>

          <div className="card quick-card">
            <div className="quick-card-title">
              Нет товара?
            </div>

            <div className="quick-card-text">
              Добавь его в справочник товаров, затем вернись
              сюда и создай отгрузку.
            </div>

            <button
              className="secondary-button"
              style={{ marginTop: 15 }}
              onClick={() => setPage("products")}
            >
              Открыть товары
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   OPERATIONS
========================================================= */

function Operations() {
  const [operations, setOperations] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    const [{ data, error: opsError }, { data: clientsData }] =
      await Promise.all([
        supabase
          .from("shipments")
          .select("*, clients(name), products(name, sku)")
          .order("shipment_date", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("clients")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
      ]);

    if (opsError) {
      setError(opsError.message);
    }

    setOperations(data || []);
    setClients(clientsData || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id) {
    if (
      !window.confirm(
        "Отменить эту операцию? Она останется в истории."
      )
    ) {
      return;
    }

    setError("");

    const { error } = await supabase.rpc(
      "cancel_shipment",
      {
        p_shipment_id: id,
      }
    );

    if (error) {
      setError(error.message);
      return;
    }

    await load();
  }

  const filtered = operations.filter((item) => {
    if (
      filterClient &&
      item.client_id !== filterClient
    ) {
      return false;
    }

    if (
      filterStatus !== "all" &&
      item.status !== filterStatus
    ) {
      return false;
    }

    return true;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Операции</h1>
          <p className="page-subtitle">
            Все начисления и операции клиентов
          </p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-padding">
          <div className="toolbar">
            <select
              className="select"
              style={{ maxWidth: 280 }}
              value={filterClient}
              onChange={(e) =>
                setFilterClient(e.target.value)
              }
            >
              <option value="">Все клиенты</option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.name}
                </option>
              ))}
            </select>

            <select
              className="select"
              style={{ maxWidth: 220 }}
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="cancelled">
                Отменённые
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            Операций не найдено.
          </div>
        ) : (
          <div className="list">
            {filtered.map((item) => (
              <div className="list-row" key={item.id}>
                <div className="list-main">
                  <div className="list-title">
                    {item.clients?.name || "Клиент"}
                  </div>

                  <div className="list-meta">
                    {item.tariff_type === "shipment" ? (
                      <>
                        <span className="badge badge-shipment">
                          Отгрузка
                        </span>
                        {" · "}
                        {item.quantity} кг
                        {" · "}
                        {money(item.unit_price_rub)} ₽/кг
                      </>
                    ) : (
                      <>
                        Операция
                        {" · "}
                        {item.quantity} ед.
                      </>
                    )}

                    {" · "}
                    {item.products?.name || "Товар"}
                    {" · "}
                    {dateRu(item.shipment_date)}
                  </div>
                </div>

                <div className="list-right">
                  <div className="money">
                    {money(item.total_rub)} ₽
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <span
                      className={
                        item.status === "cancelled"
                          ? "badge badge-cancelled"
                          : "badge badge-active"
                      }
                    >
                      {item.status === "cancelled"
                        ? "Отменена"
                        : "Активна"}
                    </span>
                  </div>

                  {item.status !== "cancelled" && (
                    <button
                      className="danger-button"
                      style={{
                        marginTop: 8,
                        padding: "7px 10px",
                        fontSize: 11,
                      }}
                      onClick={() => cancel(item.id)}
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   PAYABLE
========================================================= */

function Payable() {
  const [operations, setOperations] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [to, setTo] = useState(today());
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    let query = supabase
      .from("shipments")
      .select("*, clients(name), products(name, sku)")
      .eq("status", "active")
      .gte("shipment_date", from)
      .lte("shipment_date", to)
      .order("shipment_date", {
        ascending: false,
      });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const [{ data }, { data: clientsData }] =
      await Promise.all([
        query,
        supabase
          .from("clients")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
      ]);

    setOperations(data || []);
    setClients(clientsData || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [from, to, clientId]);

  const total = operations.reduce(
    (sum, item) => sum + Number(item.total_rub || 0),
    0
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">К оплате</h1>
          <p className="page-subtitle">
            Активные начисления за выбранный период
          </p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card stat">
          <div className="stat-label">Период с</div>
          <input
            className="input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="card stat">
          <div className="stat-label">Период по</div>
          <input
            className="input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="card stat">
          <div className="stat-label">Клиент</div>
          <select
            className="select"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Все</option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="card stat">
          <div className="stat-label">Всего начислено</div>
          <div className="stat-value stat-accent">
            {loading ? "..." : `${money(total)} ₽`}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка...</div>
        ) : operations.length === 0 ? (
          <div className="empty">
            Активных начислений за этот период нет.
          </div>
        ) : (
          <div className="list">
            {operations.map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <div className="list-title">
                    {item.clients?.name || "Клиент"}
                  </div>

                  <div className="list-meta">
                    {item.tariff_type === "shipment"
                      ? `Отгрузка · ${item.quantity} кг · ${money(
                          item.unit_price_rub
                        )} ₽/кг`
                      : `Операция · ${item.quantity} ед.`}

                    {" · "}
                    {item.products?.name || "Товар"}
                    {" · "}
                    {dateRu(item.shipment_date)}
                  </div>
                </div>

                <div className="list-right">
                  <div className="money">
                    {money(item.total_rub)} ₽
                  </div>

                  <div style={{ marginTop: 5 }}>
                    <span className="badge badge-active">
                      Активна
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .order("changed_at", {
        ascending: false,
      })
      .limit(100);

    setLogs(data || []);
    setLoading(false);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">История</h1>
          <p className="page-subtitle">
            Журнал изменений системы
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка...</div>
        ) : logs.length === 0 ? (
          <div className="empty">
            Записей пока нет.
          </div>
        ) : (
          <div className="list">
            {logs.map((log) => (
              <div className="list-row" key={log.id}>
                <div>
                  <div className="list-title">
                    {log.action}
                  </div>

                  <div className="list-meta">
                    {log.entity_type}
                    {" · "}
                    {new Date(
                      log.changed_at
                    ).toLocaleString("ru-RU")}
                  </div>
                </div>

                <div className="list-right">
                  <span className="badge badge-active">
                    Журнал
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   APP
========================================================= */

function App({ session }) {
  const [page, setPage] = useState("dashboard");
  const [clientForm, setClientForm] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  async function logout() {
    await supabase.auth.signOut();
  }

  function openClient(client) {
    setSelectedClient(client);
    setClientForm(null);
  }

  function addClient() {
    setSelectedClient(null);
    setClientForm({});
  }

  function editClient(client) {
    setSelectedClient(null);
    setClientForm(client);
  }

  function closeClientForm() {
    setClientForm(null);
  }

  function clientSaved() {
    setClientForm(null);
    setSelectedClient(null);
    setPage("clients");
  }

  let content = null;

  if (clientForm !== null) {
    content = (
      <ClientForm
        initial={clientForm}
        onBack={closeClientForm}
        onSaved={clientSaved}
      />
    );
  } else if (selectedClient) {
    content = (
      <ClientDetail
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onEdit={() => editClient(selectedClient)}
      />
    );
  } else {
    switch (page) {
      case "dashboard":
        content = <Dashboard setPage={setPage} />;
        break;

      case "clients":
        content = (
          <Clients
            onOpenClient={openClient}
            onAddClient={addClient}
          />
        );
        break;

      case "products":
        content = <Products />;
        break;

      case "operations":
        content = <Operations />;
        break;

      case "shipment":
        content = <ShipmentPage setPage={setPage} />;
        break;

      case "payable":
        content = <Payable />;
        break;

      case "history":
        content = <History />;
        break;

      default:
        content = <Dashboard setPage={setPage} />;
    }
  }

  return (
    <div className="app">
      <style>{APP_CSS}</style>

      <div className="app-shell">
        <Sidebar
          page={page}
          setPage={(next) => {
            setSelectedClient(null);
            setClientForm(null);
            setPage(next);
          }}
          email={session.user.email}
          onLogout={logout}
        />

        <main className="main">
          <MobileHeader page={page} />

          <div className="content">
            {content}
          </div>
        </main>
      </div>

      <MobileNavigation
        page={page}
        setPage={(next) => {
          setSelectedClient(null);
          setClientForm(null);
          setPage(next);
        }}
      />
    </div>
  );
}

/* =========================================================
   ROOT
========================================================= */

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <>
        <style>{APP_CSS}</style>
        <div className="loading">
          SORTEX загружается...
        </div>
      </>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <App session={session} />;
}

createRoot(document.getElementById("root")).render(
  <Root />
);
