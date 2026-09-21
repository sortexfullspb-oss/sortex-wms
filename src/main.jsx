import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const APP_CSS = `
:root{
  --graphite:#242321;
  --graphite-2:#302e2a;
  --champagne:#c8b58a;
  --champagne-light:#e8dec8;
  --milk:#f7f5f0;
  --card:#fffdf9;
  --border:#ded9cf;
  --text:#292825;
  --muted:#77736b;
  --green:#54735d;
  --red:#8a5c56;
  --shadow:0 16px 45px rgba(36,35,33,.08);
  --radius:18px;
}

*{box-sizing:border-box}

html,body,#root{
  margin:0;
  min-height:100%;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",
  "Segoe UI",Arial,sans-serif;
  color:var(--text);
  background:var(--milk);
}

button,input,select,textarea{
  font:inherit;
}

button{
  cursor:pointer;
}

.app{
  min-height:100vh;
  background:var(--milk);
}

.shell{
  display:flex;
  min-height:100vh;
}

.sidebar{
  width:250px;
  background:var(--graphite);
  color:#fff;
  padding:28px 18px;
  display:flex;
  flex-direction:column;
  position:fixed;
  inset:0 auto 0 0;
  z-index:20;
}

.brand{
  padding:4px 12px 30px;
}

.brand-name{
  font-size:26px;
  font-weight:700;
  letter-spacing:.16em;
}

.brand-sub{
  margin-top:7px;
  color:#a9a49b;
  font-size:11px;
  letter-spacing:.12em;
  text-transform:uppercase;
}

.nav{
  display:flex;
  flex-direction:column;
  gap:5px;
}

.nav button{
  border:0;
  background:transparent;
  color:#bdb8af;
  padding:13px 14px;
  border-radius:12px;
  text-align:left;
  font-size:14px;
  transition:.18s ease;
}

.nav button:hover{
  background:#302e2a;
  color:#fff;
}

.nav button.active{
  background:#3a3732;
  color:#fff;
}

.sidebar-bottom{
  margin-top:auto;
  padding:14px 12px 0;
  border-top:1px solid rgba(255,255,255,.08);
}

.user-mini{
  color:#ddd8cf;
  font-size:12px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  margin-bottom:12px;
}

.logout{
  width:100%;
  border:1px solid rgba(255,255,255,.12);
  color:#d8d3ca;
  background:transparent;
  padding:10px;
  border-radius:10px;
}

.main{
  margin-left:250px;
  width:calc(100% - 250px);
  min-width:0;
}

.topbar{
  height:74px;
  background:rgba(255,253,249,.9);
  border-bottom:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 34px;
  position:sticky;
  top:0;
  z-index:10;
  backdrop-filter:blur(12px);
}

.topbar-title{
  font-size:20px;
  font-weight:600;
}

.topbar-date{
  color:var(--muted);
  font-size:13px;
}

.content{
  padding:30px 34px 90px;
  max-width:1500px;
  margin:auto;
}

.page-head{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:20px;
  margin-bottom:25px;
}

.page-title{
  font-size:29px;
  font-weight:650;
  letter-spacing:-.025em;
}

.page-subtitle{
  color:var(--muted);
  margin-top:6px;
  font-size:14px;
}

.card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
}

.card-pad{
  padding:22px;
}

.grid{
  display:grid;
  gap:16px;
}

.grid-2{
  grid-template-columns:repeat(2,minmax(0,1fr));
}

.grid-3{
  grid-template-columns:repeat(3,minmax(0,1fr));
}

.grid-4{
  grid-template-columns:repeat(4,minmax(0,1fr));
}

.stat{
  padding:22px;
}

.stat-label{
  color:var(--muted);
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.stat-value{
  margin-top:10px;
  font-size:29px;
  font-weight:650;
}

.stat-note{
  color:var(--muted);
  margin-top:5px;
  font-size:12px;
}

.btn{
  border:0;
  border-radius:11px;
  padding:11px 16px;
  font-weight:600;
  font-size:13px;
  transition:.18s ease;
}

.btn-primary{
  background:var(--graphite);
  color:#fff;
}

.btn-primary:hover{
  background:var(--graphite-2);
}

.btn-secondary{
  background:var(--champagne-light);
  color:var(--graphite);
}

.btn-secondary:hover{
  background:#ded0b2;
}

.btn-ghost{
  background:transparent;
  border:1px solid var(--border);
  color:var(--text);
}

.btn-danger{
  background:#f1e3df;
  color:var(--red);
}

.btn:disabled{
  opacity:.5;
  cursor:not-allowed;
}

.actions{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
}

.input,
.select,
.textarea{
  width:100%;
  border:1px solid var(--border);
  background:#fff;
  border-radius:11px;
  padding:12px 13px;
  outline:none;
  color:var(--text);
  transition:.15s ease;
}

.input:focus,
.select:focus,
.textarea:focus{
  border-color:var(--champagne);
  box-shadow:0 0 0 3px rgba(200,181,138,.15);
}

.textarea{
  min-height:95px;
  resize:vertical;
}

.field{
  margin-bottom:16px;
}

.label{
  display:block;
  font-size:12px;
  color:var(--muted);
  margin-bottom:7px;
  font-weight:600;
}

.table-wrap{
  overflow:auto;
}

table{
  width:100%;
  border-collapse:collapse;
  min-width:650px;
}

th{
  color:var(--muted);
  font-size:11px;
  font-weight:600;
  text-align:left;
  text-transform:uppercase;
  letter-spacing:.06em;
  padding:13px 16px;
  border-bottom:1px solid var(--border);
}

td{
  padding:15px 16px;
  border-bottom:1px solid #eeeae2;
  font-size:13px;
}

tr:last-child td{
  border-bottom:0;
}

.clickable{
  cursor:pointer;
}

.clickable:hover{
  background:#faf7f1;
}

.badge{
  display:inline-flex;
  align-items:center;
  padding:5px 9px;
  border-radius:999px;
  font-size:11px;
  font-weight:650;
}

.badge-active{
  background:#e7efe9;
  color:var(--green);
}

.badge-cancelled{
  background:#f2e5e1;
  color:var(--red);
}

.badge-neutral{
  background:#eeeae2;
  color:#68635b;
}

.empty{
  text-align:center;
  padding:45px 20px;
  color:var(--muted);
}

.search{
  max-width:360px;
}

.form-card{
  max-width:820px;
}

.divider{
  height:1px;
  background:var(--border);
  margin:20px 0;
}

.tariff-box{
  border:1px solid var(--border);
  border-radius:14px;
  padding:17px;
  background:#fff;
}

.tariff-title{
  font-weight:650;
  margin-bottom:15px;
}

.price-big{
  font-size:22px;
  font-weight:650;
}

.switch-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  padding:13px 0;
}

.switch{
  width:46px;
  height:26px;
  border-radius:99px;
  background:#c9c5bd;
  padding:3px;
  border:0;
  position:relative;
}

.switch span{
  width:20px;
  height:20px;
  background:#fff;
  display:block;
  border-radius:50%;
  transition:.18s;
}

.switch.on{
  background:var(--graphite);
}

.switch.on span{
  transform:translateX(20px);
}

.notice{
  padding:13px 15px;
  background:#f1eee7;
  border-radius:12px;
  color:#69645c;
  font-size:13px;
  line-height:1.5;
}

.error{
  padding:12px 14px;
  background:#f4e4e0;
  color:#854f48;
  border-radius:11px;
  font-size:13px;
  margin-bottom:14px;
}

.success{
  padding:12px 14px;
  background:#e6eee8;
  color:#4e6956;
  border-radius:11px;
  font-size:13px;
  margin-bottom:14px;
}

.mobile-nav{
  display:none;
}

.login{
  min-height:100vh;
  background:
    radial-gradient(circle at 80% 20%,rgba(200,181,138,.09),transparent 30%),
    var(--graphite);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
}

.login-shell{
  width:min(440px,100%);
}

.login-brand{
  text-align:center;
  color:#fff;
  margin-bottom:25px;
}

.login-brand-name{
  font-size:38px;
  font-weight:700;
  letter-spacing:.18em;
}

.login-brand-sub{
  margin-top:9px;
  color:#a9a49b;
  font-size:11px;
  letter-spacing:.17em;
  text-transform:uppercase;
}

.login-card{
  background:#fffdf9;
  border-radius:24px;
  padding:31px;
  box-shadow:0 25px 80px rgba(0,0,0,.25);
  border:1px solid rgba(232,222,200,.35);
}

.login-title{
  font-size:24px;
  font-weight:650;
  margin-bottom:7px;
}

.login-sub{
  color:var(--muted);
  font-size:13px;
  margin-bottom:25px;
}

.login-accent{
  width:46px;
  height:2px;
  background:var(--champagne);
  margin-bottom:22px;
}

.login-btn{
  width:100%;
  padding:13px;
  margin-top:4px;
}

.login-footer{
  text-align:center;
  color:#8e8980;
  font-size:11px;
  margin-top:18px;
}

@media(max-width:900px){
  .sidebar{
    display:none;
  }

  .main{
    margin-left:0;
    width:100%;
    padding-bottom:72px;
  }

  .topbar{
    padding:0 18px;
  }

  .content{
    padding:22px 16px 80px;
  }

  .grid-4{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }

  .mobile-nav{
    display:flex;
    position:fixed;
    left:0;
    right:0;
    bottom:0;
    height:68px;
    background:rgba(36,35,33,.97);
    z-index:30;
    justify-content:space-around;
    align-items:center;
    padding-bottom:env(safe-area-inset-bottom);
  }

  .mobile-nav button{
    background:transparent;
    border:0;
    color:#aaa69e;
    font-size:10px;
    padding:8px;
  }

  .mobile-nav button.active{
    color:#fff;
  }
}

@media(max-width:650px){
  .topbar-date{
    display:none;
  }

  .page-head{
    align-items:flex-start;
    flex-direction:column;
  }

  .page-title{
    font-size:25px;
  }

  .grid-2,
  .grid-3,
  .grid-4{
    grid-template-columns:1fr;
  }

  .login-card{
    padding:24px;
  }

  .login-brand-name{
    font-size:32px;
  }
}
`;

function money(value) {
  return `${Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;
}

function dateRu(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ru-RU");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <style>{APP_CSS}</style>
        <div className="login">
          <div className="login-brand">
            <div className="login-brand-name">SORTEX</div>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <style>{APP_CSS}</style>
        <Login />
      </>
    );
  }

  return (
    <>
      <style>{APP_CSS}</style>
      <Dashboard session={session} />
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Не удалось выполнить вход. Проверьте email и пароль.");
    }

    setLoading(false);
  }

  return (
    <div className="login">
      <div className="login-shell">
        <div className="login-brand">
          <div className="login-brand-name">SORTEX</div>
          <div className="login-brand-sub">
            warehouse management system
          </div>
        </div>

        <div className="login-card">
          <div className="login-accent" />

          <div className="login-title">Вход в систему</div>

          <div className="login-sub">
            Управление клиентами, товарами, тарифами и начислениями.
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={login}>
            <div className="field">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.ru"
                required
              />
            </div>

            <div className="field">
              <label className="label">Пароль</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>

            <button
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? "Выполняется вход…" : "Войти"}
            </button>
          </form>
        </div>

        <div className="login-footer">
          SORTEX WMS · secure workspace
        </div>
      </div>
    </div>
  );
}

function Dashboard({ session }) {
  const [page, setPage] = useState("dashboard");

  const menu = [
    ["dashboard", "Главная"],
    ["clients", "Клиенты"],
    ["products", "Товары"],
    ["tariffs", "Тарифы"],
    ["shipments", "Операции"],
    ["payable", "К оплате"],
    ["history", "История"],
  ];

  async function logout() {
    await supabase.auth.signOut();
  }

  const currentTitle =
    menu.find((x) => x[0] === page)?.[1] || "SORTEX";

  return (
    <div className="app">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-name">SORTEX</div>
            <div className="brand-sub">warehouse management</div>
          </div>

          <nav className="nav">
            {menu.map(([id, label]) => (
              <button
                key={id}
                className={page === id ? "active" : ""}
                onClick={() => setPage(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="user-mini">{session.user.email}</div>
            <button className="logout" onClick={logout}>
              Выйти
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="topbar-title">{currentTitle}</div>
            <div className="topbar-date">
              {new Date().toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </header>

          <div className="content">
            {page === "dashboard" && <Home />}
            {page === "clients" && <Clients />}
            {page === "products" && <Products />}
            {page === "tariffs" && <Tariffs />}
            {page === "shipments" && <Shipments />}
            {page === "payable" && <Payable />}
            {page === "history" && <History />}
          </div>
        </main>
      </div>

      <nav className="mobile-nav">
        {menu.slice(0, 5).map(([id, label]) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Home() {
  const [stats, setStats] = useState({
    clients: 0,
    products: 0,
    operations: 0,
    total: 0,
  });

  useEffect(() => {
    async function load() {
      const [
        { count: clients },
        { count: products },
        { count: operations },
        { data: shipments },
      ] = await Promise.all([
        supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),

        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),

        supabase
          .from("shipments")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),

        supabase
          .from("shipments")
          .select("total_rub")
          .eq("status", "active"),
      ]);

      setStats({
        clients: clients || 0,
        products: products || 0,
        operations: operations || 0,
        total: (shipments || []).reduce(
          (sum, x) => sum + Number(x.total_rub || 0),
          0
        ),
      });
    }

    load();
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Добро пожаловать в SORTEX</div>
          <div className="page-subtitle">
            Финансовый и операционный кабинет склада
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat">
          <div className="stat-label">Клиенты</div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-note">активных</div>
        </div>

        <div className="card stat">
          <div className="stat-label">Товары</div>
          <div className="stat-value">{stats.products}</div>
          <div className="stat-note">в справочнике</div>
        </div>

        <div className="card stat">
          <div className="stat-label">Операции</div>
          <div className="stat-value">{stats.operations}</div>
          <div className="stat-note">активных начислений</div>
        </div>

        <div className="card stat">
          <div className="stat-label">Начислено</div>
          <div className="stat-value">{money(stats.total)}</div>
          <div className="stat-note">активные операции</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }} className="card card-pad">
        <div style={{ fontWeight: 650, marginBottom: 10 }}>
          Тарифная логика
        </div>

        <div className="notice">
          Первый килограмм включён в базовый тариф товара. Каждый следующий
          килограмм рассчитывается отдельно. Тариф может быть задан на уровне
          конкретного товара или клиента.
        </div>
      </div>
    </>
  );
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("name");

    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter((c) =>
    `${c.name} ${c.legal_name || ""} ${c.inn || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (editing !== null) {
    return (
      <ClientForm
        initial={editing || null}
        onBack={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Клиенты</div>
          <div className="page-subtitle">
            Компании и индивидуальные тарифы
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setEditing({})}
        >
          + Добавить клиента
        </button>
      </div>

      <div className="card card-pad">
        <div style={{ marginBottom: 18 }}>
          <input
            className="input search"
            placeholder="Поиск клиента…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">Клиенты не найдены</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>ИНН</th>
                  <th>Контакт</th>
                  <th>Телефон</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <strong>{client.name}</strong>
                    </td>
                    <td>{client.inn || "—"}</td>
                    <td>{client.contact_name || "—"}</td>
                    <td>{client.phone || "—"}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setEditing(client)}
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

function ClientForm({ initial, onBack, onSaved }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    legal_name: initial?.legal_name || "",
    inn: initial?.inn || "",
    contact_name: initial?.contact_name || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    notes: initial?.notes || "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(key, value) {
    setForm((x) => ({ ...x, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      name: form.name.trim(),
    };

    let result;

    if (initial?.id) {
      result = await supabase
        .from("clients")
        .update(payload)
        .eq("id", initial.id);
    } else {
      result = await supabase.from("clients").insert(payload);
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
          <div className="page-title">
            {initial?.id ? "Карточка клиента" : "Новый клиент"}
          </div>
        </div>

        <button className="btn btn-ghost" onClick={onBack}>
          Назад
        </button>
      </div>

      <form className="card card-pad form-card" onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="grid grid-2">
          <div className="field">
            <label className="label">Название *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => change("name", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="label">Юридическое название</label>
            <input
              className="input"
              value={form.legal_name}
              onChange={(e) => change("legal_name", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">ИНН</label>
            <input
              className="input"
              value={form.inn}
              onChange={(e) => change("inn", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Контактное лицо</label>
            <input
              className="input"
              value={form.contact_name}
              onChange={(e) => change("contact_name", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Телефон</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => change("phone", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) => change("email", e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Примечание</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={(e) => change("notes", e.target.value)}
          />
        </div>

        <div className="actions">
          <button
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBack}
          >
            Отмена
          </button>
        </div>
      </form>
    </>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    const [{ data: productsData }, { data: clientsData }] =
      await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("name"),

        supabase
          .from("clients")
          .select("id,name")
          .order("name"),
      ]);

    setProducts(productsData || []);
    setClients(clientsData || []);
  }

  useEffect(() => {
    load();
  }, []);

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.name])),
    [clients]
  );

  const filtered = products.filter((p) =>
    `${p.name} ${p.sku || ""} ${clientMap[p.client_id] || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (editing) {
    return (
      <ProductForm
        initial={editing === "new" ? null : editing}
        clients={clients}
        onBack={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Товары</div>
          <div className="page-subtitle">
            Справочник товаров клиентов
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setEditing("new")}
        >
          + Добавить товар
        </button>
      </div>

      <div className="card card-pad">
        <div style={{ marginBottom: 18 }}>
          <input
            className="input search"
            placeholder="Поиск товара или клиента…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty">Товары не найдены</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Товар</th>
                  <th>Размер</th>
                  <th>Вес</th>
                  <th>SKU</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{clientMap[p.client_id] || "—"}</td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      {p.size_type === "small"
                        ? "Маленький"
                        : p.size_type === "medium"
                        ? "Средний"
                        : p.size_type === "large"
                        ? "Крупный"
                        : "—"}
                    </td>
                    <td>{p.weight_kg || 0} кг</td>
                    <td>{p.sku || "—"}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setEditing(p)}
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

function ProductForm({ initial, clients, onBack, onSaved }) {
  const [form, setForm] = useState({
    client_id: initial?.client_id || "",
    name: initial?.name || "",
    sku: initial?.sku || "",
    size_type: initial?.size_type || "small",
    length_cm: initial?.length_cm || "",
    width_cm: initial?.width_cm || "",
    height_cm: initial?.height_cm || "",
    weight_kg: initial?.weight_kg ?? 0,
    notes: initial?.notes || "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(key, value) {
    setForm((x) => ({ ...x, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    let sku = form.sku.trim();

    if (!sku) {
      sku =
        "AUTO-" +
        crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
    }

    const payload = {
      client_id: form.client_id,
      name: form.name.trim(),
      sku,
      size_type: form.size_type,
      length_cm: form.length_cm === "" ? null : Number(form.length_cm),
      width_cm: form.width_cm === "" ? null : Number(form.width_cm),
      height_cm: form.height_cm === "" ? null : Number(form.height_cm),
      weight_kg:
        form.weight_kg === "" ? 0 : Number(form.weight_kg),
      notes: form.notes,
    };

    let result;

    if (initial?.id) {
      result = await supabase
        .from("products")
        .update(payload)
        .eq("id", initial.id);
    } else {
      result = await supabase
        .from("products")
        .insert(payload);
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
          <div className="page-title">
            {initial ? "Карточка товара" : "Новый товар"}
          </div>
          <div className="page-subtitle">
            SKU можно не заполнять — SORTEX создаст технический код
            автоматически.
          </div>
        </div>

        <button className="btn btn-ghost" onClick={onBack}>
          Назад
        </button>
      </div>

      <form className="card card-pad form-card" onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="field">
          <label className="label">Клиент *</label>

          <select
            className="select"
            value={form.client_id}
            onChange={(e) => change("client_id", e.target.value)}
            required
          >
            <option value="">Выберите клиента</option>

            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label className="label">Название товара *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => change("name", e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="label">SKU</label>
            <input
              className="input"
              value={form.sku}
              onChange={(e) => change("sku", e.target.value)}
              placeholder="Необязательно"
            />
          </div>

          <div className="field">
            <label className="label">Размер тарифа *</label>

            <select
              className="select"
              value={form.size_type}
              onChange={(e) => change("size_type", e.target.value)}
            >
              <option value="small">Маленький — 30 ₽</option>
              <option value="medium">Средний — 40 ₽</option>
              <option value="large">Крупный — 55 ₽</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Вес одного товара, кг</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.001"
              value={form.weight_kg}
              onChange={(e) =>
                change("weight_kg", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label className="label">Длина, см</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={form.length_cm}
              onChange={(e) =>
                change("length_cm", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label className="label">Ширина, см</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={form.width_cm}
              onChange={(e) =>
                change("width_cm", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label className="label">Высота, см</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={form.height_cm}
              onChange={(e) =>
                change("height_cm", e.target.value)
              }
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Примечание</label>
          <textarea
            className="textarea"
            value={form.notes}
            onChange={(e) => change("notes", e.target.value)}
          />
        </div>

        <div className="actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить товар"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBack}
          >
            Отмена
          </button>
        </div>
      </form>
    </>
  );
}

function Tariffs() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadBase() {
    const [{ data: clientsData }, { data: productsData }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("id,name")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("products")
          .select("id,name,client_id,size_type,weight_kg")
          .eq("is_active", true)
          .order("name"),
      ]);

    setClients(clientsData || []);
    setProducts(productsData || []);
  }

  useEffect(() => {
    loadBase();
  }, []);

  useEffect(() => {
    loadTariffs();
  }, [selectedClient, selectedProduct]);

  async function loadTariffs() {
    setLoading(true);

    let query = supabase
      .from("service_tariffs")
      .select("*")
      .order("service_type")
      .order("effective_from", { ascending: false });

    if (selectedClient) {
      query = query.eq("client_id", selectedClient);
    }

    if (selectedProduct) {
      query = query.eq("product_id", selectedProduct);
    }

    const { data } = await query;

    setTariffs(data || []);
    setLoading(false);
  }

  const filteredProducts = selectedClient
    ? products.filter((p) => p.client_id === selectedClient)
    : products;

  async function saveTariff(type, values) {
    const payload = {
      client_id: selectedClient || null,
      product_id: selectedProduct || null,
      service_type: type,
      price_rub: Number(values.price_rub || 0),
      enabled: values.enabled,
      included_weight_kg: Number(
        values.included_weight_kg ?? (type === "shipment" ? 1 : 0)
      ),
      extra_kg_price_rub: Number(
        values.extra_kg_price_rub ?? (type === "shipment" ? 8 : 0)
      ),
      effective_from: today(),
    };

    const { error } = await supabase
      .from("service_tariffs")
      .insert(payload);

    if (error) {
      alert(error.message);
      return;
    }

    loadTariffs();
  }

  const shipmentTariffs = tariffs.filter(
    (x) => x.service_type === "shipment"
  );

  const receivingTariffs = tariffs.filter(
    (x) => x.service_type === "receiving"
  );

  const currentShipment = shipmentTariffs[0];
  const currentReceiving = receivingTariffs[0];

  const selectedProductObj = products.find(
    (p) => p.id === selectedProduct
  );

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Тарифы</div>
          <div className="page-subtitle">
            Индивидуальные цены клиентов и товаров
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="grid grid-2">
          <div className="field">
            <label className="label">Клиент</label>

            <select
              className="select"
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                setSelectedProduct("");
              }}
            >
              <option value="">
                Все клиенты / системный тариф
              </option>

              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Товар</label>

            <select
              className="select"
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
            >
              <option value="">
                Тариф клиента целиком
              </option>

              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="notice">
          {selectedProductObj
            ? `Настройка тарифа конкретного товара: ${selectedProductObj.name}`
            : selectedClient
            ? "Настройка общего тарифа выбранного клиента."
            : "Без выбранного клиента отображаются системные тарифы и общие настройки."}
        </div>
      </div>

      <div style={{ marginTop: 18 }} className="grid grid-2">
        <ShipmentTariffEditor
          existing={currentShipment}
          onSave={(values) => saveTariff("shipment", values)}
          loading={loading}
        />

        <ReceivingTariffEditor
          existing={currentReceiving}
          onSave={(values) => saveTariff("receiving", values)}
          loading={loading}
        />
      </div>

      {tariffs.length > 0 && (
        <div style={{ marginTop: 18 }} className="card card-pad">
          <div style={{ fontWeight: 650, marginBottom: 15 }}>
            История тарифов выбранного уровня
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Цена</th>
                  <th>Первый кг</th>
                  <th>Доп. кг</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>

              <tbody>
                {tariffs.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.service_type === "shipment"
                        ? "Обработка товара"
                        : "Приёмка товара"}
                    </td>

                    <td>{money(t.price_rub)}</td>

                    <td>
                      {t.service_type === "shipment"
                        ? `${t.included_weight_kg ?? 1} кг`
                        : "—"}
                    </td>

                    <td>
                      {t.service_type === "shipment"
                        ? `${money(t.extra_kg_price_rub)}/кг`
                        : "—"}
                    </td>

                    <td>
                      {t.enabled ? (
                        <span className="badge badge-active">
                          Включён
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          Выключен
                        </span>
                      )}
                    </td>

                    <td>{dateRu(t.effective_from)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function ShipmentTariffEditor({ existing, onSave, loading }) {
  const [price, setPrice] = useState(existing?.price_rub ?? 30);
  const [extra, setExtra] = useState(
    existing?.extra_kg_price_rub ?? 8
  );
  const [included, setIncluded] = useState(
    existing?.included_weight_kg ?? 1
  );

  useEffect(() => {
    setPrice(existing?.price_rub ?? 30);
    setExtra(existing?.extra_kg_price_rub ?? 8);
    setIncluded(existing?.included_weight_kg ?? 1);
  }, [existing]);

  return (
    <div className="card card-pad">
      <div className="tariff-title">
        Обработка товара
      </div>

      <div className="notice" style={{ marginBottom: 18 }}>
        Базовая стоимость зависит от размера товара. Для конкретного
        товара или клиента эту цену можно переопределить.
      </div>

      <div className="field">
        <label className="label">Базовый тариф, ₽/шт</label>

        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="label">
          Включённый вес, кг
        </label>

        <input
          className="input"
          type="number"
          min="0"
          step="0.001"
          value={included}
          onChange={(e) => setIncluded(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="label">
          Доп. кг, ₽/кг
        </label>

        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
        />
      </div>

      <div className="notice" style={{ marginBottom: 16 }}>
        Первый {included || 0} кг включён. Всё сверх него считается
        по {extra || 0} ₽/кг.
      </div>

      <button
        className="btn btn-primary"
        disabled={loading}
        onClick={() =>
          onSave({
            price_rub: price,
            included_weight_kg: included,
            extra_kg_price_rub: extra,
            enabled: true,
          })
        }
      >
        Сохранить тариф
      </button>
    </div>
  );
}

function ReceivingTariffEditor({ existing, onSave, loading }) {
  const [price, setPrice] = useState(existing?.price_rub ?? 5);
  const [enabled, setEnabled] = useState(
    existing?.enabled ?? true
  );

  useEffect(() => {
    setPrice(existing?.price_rub ?? 5);
    setEnabled(existing?.enabled ?? true);
  }, [existing]);

  return (
    <div className="card card-pad">
      <div className="tariff-title">
        Приёмка товара
      </div>

      <div className="switch-row">
        <div>
          <strong>Услуга включена</strong>
          <div className="page-subtitle">
            Можно полностью отключить приёмку для выбранного уровня.
          </div>
        </div>

        <button
          className={`switch ${enabled ? "on" : ""}`}
          onClick={() => setEnabled(!enabled)}
          type="button"
        >
          <span />
        </button>
      </div>

      <div className="field">
        <label className="label">Стоимость, ₽/шт</label>

        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="notice" style={{ marginBottom: 16 }}>
        Стандартная цена приёмки — 5 ₽/шт. Для клиента или товара её
        можно изменить.
      </div>

      <button
        className="btn btn-primary"
        disabled={loading}
        onClick={() =>
          onSave({
            price_rub: price,
            enabled,
            included_weight_kg: 0,
            extra_kg_price_rub: 0,
          })
        }
      >
        Сохранить приёмку
      </button>
    </div>
  );
}

function Shipments() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [receiving, setReceiving] = useState(false);
  const [unitPrice, setUnitPrice] = useState(0);
  const [extraKgPrice, setExtraKgPrice] = useState(8);
  const [includedKg, setIncludedKg] = useState(1);
  const [operationWeight, setOperationWeight] = useState(0);
  const [receivingPrice, setReceivingPrice] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase
          .from("clients")
          .select("id,name")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("products")
          .select(
            "id,name,client_id,size_type,weight_kg"
          )
          .eq("is_active", true)
          .order("name"),
      ]);

      setClients(c || []);
      setProducts(p || []);
    }

    load();
  }, []);

  const clientProducts = products.filter(
    (p) => p.client_id === clientId
  );

  useEffect(() => {
    if (!productId) {
      setUnitPrice(0);
      setOperationWeight(0);
      return;
    }

    const product = products.find((p) => p.id === productId);

    if (!product) return;

    setOperationWeight(
      Number(product.weight_kg || 0) *
        Number(quantity || 0)
    );

    loadTariff(product);
  }, [productId, clientId, quantity, products]);

  async function loadTariff(product) {
    if (!clientId || !product) return;

    const { data, error } = await supabase.rpc(
      "get_effective_shipment_tariff_v2",
      {
        p_client_id: clientId,
        p_product_id: product.id,
        p_tariff_type: product.size_type,
        p_date: today(),
      }
    );

    if (!error && data?.[0]) {
      setUnitPrice(Number(data[0].price_rub || 0));
      setExtraKgPrice(
        Number(data[0].extra_kg_price_rub ?? 8)
      );
      setIncludedKg(
        Number(data[0].included_weight_kg ?? 1)
      );
    }

    const receivingResult = await supabase.rpc(
      "get_effective_receiving_tariff",
      {
        p_client_id: clientId,
        p_product_id: product.id,
        p_date: today(),
      }
    );

    if (!receivingResult.error && receivingResult.data?.[0]) {
      setReceivingPrice(
        Number(receivingResult.data[0].price_rub || 5)
      );
    }
  }

  const extraKg = Math.max(
    Number(operationWeight || 0) -
      Number(includedKg || 0) * Number(quantity || 0),
    0
  );

  const shipmentTotal =
    Number(quantity || 0) * Number(unitPrice || 0) +
    extraKg * Number(extraKgPrice || 0);

  const receivingTotal = receiving
    ? Number(quantity || 0) * Number(receivingPrice || 0)
    : 0;

  const total = shipmentTotal + receivingTotal;

  async function save() {
    setMessage("");

    if (!clientId || !productId) {
      setMessage("Выберите клиента и товар.");
      return;
    }

    if (Number(quantity) <= 0) {
      setMessage("Количество должно быть больше нуля.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("shipments")
      .insert({
        client_id: clientId,
        product_id: productId,
        shipment_date: today(),
        quantity: Number(quantity),
        tariff_type:
          products.find((p) => p.id === productId)?.size_type ||
          "small",
        unit_price_rub: Number(unitPrice),
        total_rub: Number(total.toFixed(2)),
        status: "active",
        note: receiving
          ? `Приёмка включена: ${receivingPrice} ₽/шт`
          : null,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      `Операция создана. Начислено ${money(total)}.`
    );

    setLoading(false);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Новая операция</div>
          <div className="page-subtitle">
            Обработка товара и отдельная услуга приёмки
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          {message && (
            <div
              className={
                message.startsWith("Операция")
                  ? "success"
                  : "error"
              }
            >
              {message}
            </div>
          )}

          <div className="field">
            <label className="label">Клиент *</label>

            <select
              className="select"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProductId("");
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

          <div className="field">
            <label className="label">Товар *</label>

            <select
              className="select"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!clientId}
            >
              <option value="">
                {clientId
                  ? "Выберите товар"
                  : "Сначала выберите клиента"}
              </option>

              {clientProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label className="label">Количество, шт.</label>

              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />
            </div>

            <div className="field">
              <label className="label">
                Общий вес операции, кг
              </label>

              <input
                className="input"
                type="number"
                min="0"
                step="0.001"
                value={operationWeight}
                onChange={(e) =>
                  setOperationWeight(e.target.value)
                }
              />
            </div>
          </div>

          <div className="divider" />

          <div className="switch-row">
            <div>
              <strong>Приёмка товара</strong>
              <div className="page-subtitle">
                Отдельная услуга, начисляется за штуку.
              </div>
            </div>

            <button
              type="button"
              className={`switch ${receiving ? "on" : ""}`}
              onClick={() => setReceiving(!receiving)}
            >
              <span />
            </button>
          </div>

          <div className="actions" style={{ marginTop: 18 }}>
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={save}
            >
              {loading
                ? "Создание…"
                : "Создать операцию"}
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <div className="tariff-title">
            Расчёт операции
          </div>

          <div className="grid grid-2">
            <div className="tariff-box">
              <div className="label">Базовый тариф</div>
              <div className="price-big">
                {money(unitPrice)}
              </div>
              <div className="page-subtitle">
                × {quantity || 0} шт.
              </div>
            </div>

            <div className="tariff-box">
              <div className="label">Доп. кг</div>
              <div className="price-big">
                {Number(extraKg || 0).toFixed(3)} кг
              </div>
              <div className="page-subtitle">
                × {money(extraKgPrice)}/кг
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }} className="tariff-box">
            <div className="label">
              Приёмка
            </div>

            <div className="price-big">
              {receiving ? money(receivingTotal) : "0,00 ₽"}
            </div>

            <div className="page-subtitle">
              {receiving
                ? `${quantity || 0} шт. × ${money(
                    receivingPrice
                  )}`
                : "Услуга отключена"}
            </div>
          </div>

          <div className="divider" />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              Итого
            </span>

            <strong style={{ fontSize: 27 }}>
              {money(total)}
            </strong>
          </div>

          <div style={{ marginTop: 15 }} className="notice">
            Первый {includedKg} кг на каждый товар включён в
            базовый тариф. Дополнительный вес считается отдельно.
          </div>
        </div>
      </div>
    </>
  );
}

function Payable() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("shipments")
      .select(`
        *,
        clients(name),
        products(name)
      `)
      .eq("status", "active")
      .order("shipment_date", { ascending: false });

    setShipments(data || []);
  }

  const total = shipments.reduce(
    (sum, x) => sum + Number(x.total_rub || 0),
    0
  );

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">К оплате</div>
          <div className="page-subtitle">
            Активные начисления
          </div>
        </div>
      </div>

      <div className="card stat" style={{ marginBottom: 18 }}>
        <div className="stat-label">Общая сумма</div>
        <div className="stat-value">{money(total)}</div>
      </div>

      <div className="card card-pad">
        {shipments.length === 0 ? (
          <div className="empty">
            Активных начислений нет
          </div>
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
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id}>
                    <td>{dateRu(s.shipment_date)}</td>
                    <td>{s.clients?.name || "—"}</td>
                    <td>{s.products?.name || "—"}</td>
                    <td>{s.quantity}</td>
                    <td>
                      <strong>{money(s.total_rub)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-active">
                        Активна
                      </span>
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

function History() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("changed_at", {
          ascending: false,
        })
        .limit(200);

      setRows(data || []);
    }

    load();
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">История</div>
          <div className="page-subtitle">
            Аудит изменений системы
          </div>
        </div>
      </div>

      <div className="card card-pad">
        {rows.length === 0 ? (
          <div className="empty">
            История пока пуста
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
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{dateRu(row.changed_at)}</td>
                    <td>{row.entity_type}</td>
                    <td>{row.action}</td>
                    <td>{row.changed_by || "—"}</td>
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

createRoot(document.getElementById("root")).render(<App />);
