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
    ["payable", "Начисления"],
    ["reports", "Отчёты"],
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
            {page === "reports" && <Reports />}
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
          У каждого товара есть собственная цена за обработку. Дополнительные
          услуги, например приёмка товара, подключаются отдельно.
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

  const filtered = clients.filter((client) => {
    const q = search.toLowerCase().trim();

    if (!q) return true;

    return [
      client.name,
      client.legal_name,
      client.inn,
      client.contact_name,
      client.phone,
      client.email,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  if (editing) {
    return (
      <ClientEditor
        client={editing === "new" ? null : editing}
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
            Клиенты и их рабочие реквизиты
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setEditing("new")}
        >
          + Добавить клиента
        </button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <input
          className="input search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск клиента..."
        />
      </div>

      <div className="card">
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
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="clickable"
                    onClick={() => setEditing(client)}
                  >
                    <td>
                      <div style={{ fontWeight: 650 }}>
                        {client.name}
                      </div>

                      {client.legal_name &&
                        client.legal_name !== client.name && (
                          <div
                            style={{
                              color: "var(--muted)",
                              fontSize: 12,
                              marginTop: 3,
                            }}
                          >
                            {client.legal_name}
                          </div>
                        )}
                    </td>

                    <td>{client.inn || "—"}</td>

                    <td>{client.contact_name || "—"}</td>

                    <td>{client.phone || "—"}</td>

                    <td>
                      <span
                        className={
                          client.is_active
                            ? "badge badge-active"
                            : "badge badge-neutral"
                        }
                      >
                        {client.is_active ? "Активен" : "Неактивен"}
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

function ClientEditor({ client, onBack, onSaved }) {
  const [form, setForm] = useState({
    name: client?.name || "",
    legal_name: client?.legal_name || "",
    inn: client?.inn || "",
    contact_name: client?.contact_name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    notes: client?.notes || "",
    is_active: client?.is_active ?? true,
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function save(e) {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Укажите название клиента.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      legal_name: form.legal_name.trim() || null,
      inn: form.inn.trim() || null,
      contact_name: form.contact_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
    };

    const result = client
      ? await supabase
          .from("clients")
          .update(payload)
          .eq("id", client.id)
      : await supabase.from("clients").insert(payload);

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
            {client ? "Карточка клиента" : "Новый клиент"}
          </div>

          <div className="page-subtitle">
            Основная информация о клиенте
          </div>
        </div>

        <button className="btn btn-ghost" onClick={onBack}>
          ← Назад
        </button>
      </div>

      <div className="card card-pad form-card">
        {error && <div className="error">{error}</div>}

        <form onSubmit={save}>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">Название *</label>

              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="ООО Компания"
                required
              />
            </div>

            <div className="field">
              <label className="label">Юридическое название</label>

              <input
                className="input"
                value={form.legal_name}
                onChange={(e) =>
                  update("legal_name", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label className="label">ИНН</label>

              <input
                className="input"
                value={form.inn}
                onChange={(e) => update("inn", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Контактное лицо</label>

              <input
                className="input"
                value={form.contact_name}
                onChange={(e) =>
                  update("contact_name", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label className="label">Телефон</label>

              <input
                className="input"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Email</label>

              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Заметки</label>

            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          <div className="switch-row">
            <div>
              <div style={{ fontWeight: 650 }}>Активный клиент</div>

              <div
                style={{
                  color: "var(--muted)",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Неактивные клиенты сохраняются в истории.
              </div>
            </div>

            <button
              type="button"
              className={`switch ${form.is_active ? "on" : ""}`}
              onClick={() => update("is_active", !form.is_active)}
            >
              <span />
            </button>
          </div>

          <div className="divider" />

          <div className="actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={onBack}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const [{ data: productsData }, { data: clientsData }] =
      await Promise.all([
        supabase
          .from("products")
          .select("*, clients(name)")
          .order("name"),

        supabase
          .from("clients")
          .select("id,name")
          .eq("is_active", true)
          .order("name"),
      ]);

    setProducts(productsData || []);
    setClients(clientsData || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((product) => {
    const q = search.toLowerCase().trim();

    if (!q) return true;

    return [
      product.name,
      product.sku,
      product.clients?.name,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(q)
      );
  });

  if (editing) {
    return (
      <ProductEditor
        product={editing === "new" ? null : editing}
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
            У каждого товара своя цена обработки
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setEditing("new")}
        >
          + Добавить товар
        </button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <input
          className="input search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск товара, SKU или клиента..."
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">Товары не найдены</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>SKU</th>
                  <th>Клиент</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="clickable"
                    onClick={() => setEditing(product)}
                  >
                    <td>
                      <div style={{ fontWeight: 650 }}>
                        {product.name}
                      </div>
                    </td>

                    <td>{product.sku || "—"}</td>

                    <td>{product.clients?.name || "—"}</td>

                    <td>
                      <span className="price-big">
                        {product.current_price != null
                          ? money(product.current_price)
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          product.is_active
                            ? "badge badge-active"
                            : "badge badge-neutral"
                        }
                      >
                        {product.is_active ? "Активен" : "Неактивен"}
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

function ProductEditor({ product, clients, onBack, onSaved }) {
  const [form, setForm] = useState({
    client_id: product?.client_id || "",
    sku: product?.sku || "",
    name: product?.name || "",
    notes: product?.notes || "",
    is_active: product?.is_active ?? true,
    price: product?.current_price ?? "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function save(e) {
    e.preventDefault();

    setError("");

    if (!form.client_id) {
      setError("Выберите клиента.");
      return;
    }

    if (!form.name.trim()) {
      setError("Укажите наименование товара.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Укажите корректную цену товара.");
      return;
    }

    setSaving(true);

    let sku = form.sku.trim();

    if (!sku) {
      sku = `SKU-${Date.now()}`;
    }

    const payload = {
      client_id: form.client_id,
      sku,
      name: form.name.trim(),
      notes: form.notes.trim() || null,
      is_active: form.is_active,
    };

    const result = product
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    const productId = product?.id;

    let savedProductId = productId;

    if (!productId) {
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("client_id", form.client_id)
        .eq("sku", sku)
        .single();

      savedProductId = data?.id;
    }

    if (savedProductId) {
      const { data: existingTariff } = await supabase
        .from("service_tariffs")
        .select("id")
        .eq("product_id", savedProductId)
        .eq("service_type", "shipment")
        .is("client_id", null)
        .is("effective_to", null)
        .maybeSingle();

      const tariffPayload = {
        client_id: null,
        product_id: savedProductId,
        service_type: "shipment",
        price_rub: Number(form.price),
        enabled: true,
        effective_from: today(),
        effective_to: null,
      };

      if (existingTariff) {
        await supabase
          .from("service_tariffs")
          .update({
            price_rub: Number(form.price),
            enabled: true,
          })
          .eq("id", existingTariff.id);
      } else {
        await supabase
          .from("service_tariffs")
          .insert(tariffPayload);
      }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            {product ? "Карточка товара" : "Новый товар"}
          </div>

          <div className="page-subtitle">
            Наименование товара и его цена за единицу
          </div>
        </div>

        <button className="btn btn-ghost" onClick={onBack}>
          ← Назад
        </button>
      </div>

      <div className="card card-pad form-card">
        {error && <div className="error">{error}</div>}

        <form onSubmit={save}>
          <div className="field">
            <label className="label">Клиент *</label>

            <select
              className="select"
              value={form.client_id}
              onChange={(e) =>
                update("client_id", e.target.value)
              }
              required
            >
              <option value="">Выберите клиента</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label className="label">Наименование товара *</label>

              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Например: Футболка чёрная"
                required
              />
            </div>

            <div className="field">
              <label className="label">
                Цена обработки, ₽/шт. *
              </label>

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="30.00"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">
              SKU — необязательно
            </label>

            <input
              className="input"
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
              placeholder="Если оставить пустым, SKU создастся автоматически"
            />
          </div>

          <div className="field">
            <label className="label">Заметки</label>

            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          <div className="switch-row">
            <div>
              <div style={{ fontWeight: 650 }}>Активный товар</div>

              <div
                style={{
                  color: "var(--muted)",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Неактивный товар не предлагается для новых операций.
              </div>
            </div>

            <button
              type="button"
              className={`switch ${form.is_active ? "on" : ""}`}
              onClick={() =>
                update("is_active", !form.is_active)
              }
            >
              <span />
            </button>
          </div>

          <div className="divider" />

          <div className="actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Сохранение…" : "Сохранить товар"}
            </button>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={onBack}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Tariffs() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [receiving, setReceiving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);

    const [
      { data: productsData },
      { data: clientsData },
      { data: tariffsData },
      { data: receivingData },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,sku,client_id,clients(name)")
        .eq("is_active", true)
        .order("name"),

      supabase
        .from("clients")
        .select("id,name")
        .eq("is_active", true)
        .order("name"),

      supabase
        .from("service_tariffs")
        .select("*")
        .eq("service_type", "shipment")
        .eq("enabled", true)
        .is("effective_to", null),

      supabase
        .from("service_tariffs")
        .select("*")
        .eq("service_type", "receiving")
        .is("product_id", null)
        .is("effective_to", null)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    setProducts(productsData || []);
    setClients(clientsData || []);
    setTariffs(tariffsData || []);
    setReceiving(receivingData?.[0] || null);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const tariffMap = useMemo(() => {
    const map = {};

    for (const tariff of tariffs) {
      if (tariff.product_id) {
        map[tariff.product_id] = tariff;
      }
    }

    return map;
  }, [tariffs]);

  async function saveProductTariff(product, value) {
    const price = Number(value);

    if (!Number.isFinite(price) || price < 0) {
      return;
    }

    setSavingId(product.id);

    const existing = tariffMap[product.id];

    if (existing) {
      await supabase
        .from("service_tariffs")
        .update({
          price_rub: price,
          enabled: true,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("service_tariffs").insert({
        client_id: null,
        product_id: product.id,
        service_type: "shipment",
        price_rub: price,
        enabled: true,
        effective_from: today(),
        effective_to: null,
      });
    }

    await load();

    setSavingId(null);
  }

  async function saveReceiving(value, enabled) {
    const price = Number(value);

    if (!Number.isFinite(price) || price < 0) {
      return;
    }

    if (receiving) {
      await supabase
        .from("service_tariffs")
        .update({
          price_rub: price,
          enabled,
        })
        .eq("id", receiving.id);
    } else {
      await supabase.from("service_tariffs").insert({
        client_id: null,
        product_id: null,
        service_type: "receiving",
        price_rub: price,
        enabled,
        effective_from: today(),
        effective_to: null,
      });
    }

    await load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Тарифы</div>

          <div className="page-subtitle">
            Цена задаётся непосредственно для каждого товара
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 650, marginBottom: 7 }}>
          Как работает цена
        </div>

        <div className="notice">
          Для каждого товара задаётся собственная стоимость обработки
          за одну штуку. Эта цена автоматически используется при создании
          операции.
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="tariff-title">Приёмка товара</div>

        <div className="grid grid-2">
          <div className="field">
            <label className="label">Цена приёмки, ₽/шт.</label>

            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              defaultValue={receiving?.price_rub ?? 5}
              key={receiving?.id || "new-receiving"}
              id="receiving-price"
            />
          </div>

          <div className="switch-row">
            <div>
              <div style={{ fontWeight: 650 }}>Услуга включена</div>

              <div
                style={{
                  color: "var(--muted)",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Можно включать или отключать приёмку.
              </div>
            </div>

            <button
              type="button"
              className={`switch ${
                receiving?.enabled ?? true ? "on" : ""
              }`}
              onClick={async () => {
                const price =
                  document.getElementById("receiving-price")?.value ||
                  receiving?.price_rub ||
                  5;

                await saveReceiving(
                  price,
                  !(receiving?.enabled ?? true)
                );
              }}
            >
              <span />
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={async () => {
            const value =
              document.getElementById("receiving-price")?.value || 5;

            await saveReceiving(
              value,
              receiving?.enabled ?? true
            );
          }}
        >
          Сохранить приёмку
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : products.length === 0 ? (
          <div className="empty">
            Сначала добавьте товары.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Наименование товара</th>
                  <th>Клиент</th>
                  <th>Цена, ₽/шт.</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const tariff = tariffMap[product.id];

                  return (
                    <TariffRow
                      key={product.id}
                      product={product}
                      tariff={tariff}
                      saving={savingId === product.id}
                      onSave={saveProductTariff}
                    />
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

function TariffRow({ product, tariff, saving, onSave }) {
  const [value, setValue] = useState(
    tariff?.price_rub ?? ""
  );

  useEffect(() => {
    setValue(tariff?.price_rub ?? "");
  }, [tariff?.price_rub]);

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 650 }}>
          {product.name}
        </div>

        {product.sku && (
          <div
            style={{
              color: "var(--muted)",
              fontSize: 11,
              marginTop: 3,
            }}
          >
            {product.sku}
          </div>
        )}
      </td>

      <td>{product.clients?.name || "—"}</td>

      <td style={{ width: 180 }}>
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Цена"
        />
      </td>

      <td style={{ width: 130 }}>
        <button
          className="btn btn-primary"
          disabled={saving || value === ""}
          onClick={() => onSave(product, value)}
        >
          {saving ? "…" : "Сохранить"}
        </button>
      </td>
    </tr>
  );
}

function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const [
      { data: shipmentsData },
      { data: clientsData },
      { data: productsData },
    ] = await Promise.all([
      supabase
        .from("shipments")
        .select(
          "*, clients(name), products(name,sku)"
        )
        .order("shipment_date", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("clients")
        .select("id,name")
        .eq("is_active", true)
        .order("name"),

      supabase
        .from("products")
        .select("id,name,sku,client_id")
        .eq("is_active", true)
        .order("name"),
    ]);

    setShipments(shipmentsData || []);
    setClients(clientsData || []);
    setProducts(productsData || []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (editing) {
    return (
      <ShipmentEditor
        clients={clients}
        products={products}
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
          <div className="page-title">Операции</div>

          <div className="page-subtitle">
            Отправления и начисления по товарам
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setEditing("new")}
        >
          + Новая операция
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : shipments.length === 0 ? (
          <div className="empty">
            Операций пока нет.
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
                  <th>Цена</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{dateRu(shipment.shipment_date)}</td>

                    <td>{shipment.clients?.name || "—"}</td>

                    <td>
                      {shipment.products?.name || "—"}
                    </td>

                    <td>{shipment.quantity}</td>

                    <td>
                      {money(shipment.unit_price_rub)}
                    </td>

                    <td>
                      <strong>
                        {money(shipment.total_rub)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={
                          shipment.status === "active"
                            ? "badge badge-active"
                            : "badge badge-cancelled"
                        }
                      >
                        {shipment.status === "active"
                          ? "Активно"
                          : "Отменено"}
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

function ShipmentEditor({ clients, products, onBack, onSaved }) {
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [date, setDate] = useState(today());
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState("");
  const [receivingEnabled, setReceivingEnabled] = useState(false);
  const [note, setNote] = useState("");
  const [price, setPrice] = useState(null);
  const [receivingPrice, setReceivingPrice] = useState(5);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const clientProducts = products.filter(
    (product) => product.client_id === clientId
  );

  useEffect(() => {
    async function loadTariff() {
      setPrice(null);

      if (!productId) return;

      const { data } = await supabase
        .from("service_tariffs")
        .select("price_rub")
        .eq("product_id", productId)
        .eq("service_type", "shipment")
        .eq("enabled", true)
        .is("effective_to", null)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPrice(Number(data.price_rub));
      } else {
        setPrice(0);
      }
    }

    loadTariff();
  }, [productId]);

  useEffect(() => {
    async function loadReceiving() {
      const { data } = await supabase
        .from("service_tariffs")
        .select("price_rub,enabled")
        .eq("service_type", "receiving")
        .is("product_id", null)
        .is("client_id", null)
        .is("effective_to", null)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setReceivingPrice(Number(data.price_rub || 5));
      }
    }

    loadReceiving();
  }, []);

  const baseTotal =
    Number(price || 0) * Number(quantity || 0);

  const receivingTotal = receivingEnabled
    ? receivingPrice * Number(quantity || 0)
    : 0;

  const total = baseTotal + receivingTotal;

  async function save(e) {
    e.preventDefault();

    setError("");

    if (!clientId) {
      setError("Выберите клиента.");
      return;
    }

    if (!productId) {
      setError("Выберите товар.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Количество должно быть больше нуля.");
      return;
    }

    if (price == null) {
      setError("Не удалось определить цену товара.");
      return;
    }

    if (Number(price) <= 0) {
      setError(
        "Для выбранного товара сначала задайте цену в разделе «Тарифы»."
      );
      return;
    }

    setSaving(true);

    const selectedProduct = products.find(
      (item) => item.id === productId
    );

    const details = [
      `Цена товара: ${money(price)}/шт.`,
      `Сумма товара: ${money(baseTotal)}`,
      receivingEnabled
        ? `Приёмка: ${money(receivingPrice)}/шт., всего ${money(
            receivingTotal
          )}`
        : "Приёмка: нет",
      weight
        ? `Вес: ${Number(weight).toLocaleString("ru-RU")} кг`
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const result = await supabase.from("shipments").insert({
      client_id: clientId,
      product_id: productId,
      shipment_date: date,
      quantity: Number(quantity),
      tariff_type: "shipment",
      unit_price_rub: Number(price),
      total_rub: Number(total.toFixed(2)),
      status: "active",
      note: [details, note.trim()]
        .filter(Boolean)
        .join("\n"),
    });

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
          <div className="page-title">Новая операция</div>

          <div className="page-subtitle">
            Стоимость рассчитывается автоматически по цене товара
          </div>
        </div>

        <button className="btn btn-ghost" onClick={onBack}>
          ← Назад
        </button>
      </div>

      <div className="card card-pad form-card">
        {error && <div className="error">{error}</div>}

        <form onSubmit={save}>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">Клиент *</label>

              <select
                className="select"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProductId("");
                  setPrice(null);
                }}
                required
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
              <label className="label">Товар *</label>

              <select
                className="select"
                value={productId}
                onChange={(e) =>
                  setProductId(e.target.value)
                }
                disabled={!clientId}
                required
              >
                <option value="">
                  {clientId
                    ? "Выберите товар"
                    : "Сначала выберите клиента"}
                </option>

                {clientProducts.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Дата *</label>

              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label">Количество, шт. *</label>

              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">
              Вес, кг — необязательно
            </label>

            <input
              className="input"
              type="number"
              min="0"
              step="0.001"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Например 12.5"
            />
          </div>

          <div className="tariff-box">
            <div className="tariff-title">
              Расчёт
            </div>

            <div className="grid grid-3">
              <div>
                <div className="stat-label">
                  Цена товара
                </div>

                <div className="price-big">
                  {price == null
                    ? "—"
                    : `${money(price)}/шт.`}
                </div>
              </div>

              <div>
                <div className="stat-label">
                  Количество
                </div>

                <div className="price-big">
                  {quantity || 0} шт.
                </div>
              </div>

              <div>
                <div className="stat-label">
                  Сумма товара
                </div>

                <div className="price-big">
                  {money(baseTotal)}
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="switch-row">
              <div>
                <div style={{ fontWeight: 650 }}>
                  Добавить приёмку
                </div>

                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  {money(receivingPrice)}/шт.
                </div>
              </div>

              <button
                type="button"
                className={`switch ${
                  receivingEnabled ? "on" : ""
                }`}
                onClick={() =>
                  setReceivingEnabled(!receivingEnabled)
                }
              >
                <span />
              </button>
            </div>

            <div className="divider" />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "var(--muted)",
                  fontSize: 13,
                }}
              >
                Итого
              </span>

              <strong
                style={{
                  fontSize: 25,
                }}
              >
                {money(total)}
              </strong>
            </div>
          </div>

          <div
            className="field"
            style={{ marginTop: 16 }}
          >
            <label className="label">Комментарий</label>

            <textarea
              className="textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Необязательно"
            />
          </div>

          <div className="divider" />

          <div className="actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Сохранение…" : "Создать операцию"}
            </button>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={onBack}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Payable() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("shipments")
      .select("*, clients(name), products(name)")
      .eq("status", "active")
      .order("shipment_date", { ascending: false });

    setShipments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const total = shipments.reduce(
    (sum, item) => sum + Number(item.total_rub || 0),
    0
  );

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Начисления</div>

          <div className="page-subtitle">
            Активные суммы по операциям
          </div>
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 650,
          }}
        >
          {money(total)}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : shipments.length === 0 ? (
          <div className="empty">
            Активных начислений нет.
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
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{dateRu(shipment.shipment_date)}</td>

                    <td>{shipment.clients?.name || "—"}</td>

                    <td>{shipment.products?.name || "—"}</td>

                    <td>{shipment.quantity}</td>

                    <td>
                      <strong>
                        {money(shipment.total_rub)}
                      </strong>
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

function Reports() {
  const [clients, setClients] = useState([]);
  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [to, setTo] = useState(today());
  const [clientId, setClientId] = useState("");
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    supabase
      .from("clients")
      .select("id,name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setClients(data || []);
      });
  }, []);

  async function generate() {
    setLoading(true);
    setSearched(true);
    setSelectedClient(null);
    setDetails([]);

    let query = supabase
      .from("shipments")
      .select(
        "id,client_id,product_id,shipment_date,quantity,unit_price_rub,total_rub,status,note,clients(name),products(name,sku)"
      )
      .gte("shipment_date", from)
      .lte("shipment_date", to)
      .eq("status", "active")
      .order("shipment_date", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setRows([]);
      setLoading(false);
      return;
    }

    const grouped = {};

    for (const item of data || []) {
      if (!grouped[item.client_id]) {
        grouped[item.client_id] = {
          client_id: item.client_id,
          client_name: item.clients?.name || "Без названия",
          operations: 0,
          quantity: 0,
          total: 0,
        };
      }

      grouped[item.client_id].operations += 1;
      grouped[item.client_id].quantity += Number(
        item.quantity || 0
      );
      grouped[item.client_id].total += Number(
        item.total_rub || 0
      );
    }

    setRows(
      Object.values(grouped).sort(
        (a, b) => b.total - a.total
      )
    );

    setDetails(data || []);
    setLoading(false);
  }

  const totalOperations = rows.reduce(
    (sum, row) => sum + row.operations,
    0
  );

  const totalQuantity = rows.reduce(
    (sum, row) => sum + row.quantity,
    0
  );

  const totalAmount = rows.reduce(
    (sum, row) => sum + row.total,
    0
  );

  function openClient(row) {
    setSelectedClient(row);
  }

  const clientDetails = selectedClient
    ? details.filter(
        (item) =>
          item.client_id === selectedClient.client_id
      )
    : [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Отчёты</div>

          <div className="page-subtitle">
            Итоги по отправлениям за выбранный период
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="grid grid-3">
          <div className="field">
            <label className="label">Период с</label>

            <input
              className="input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Период по</label>

            <input
              className="input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Клиент</label>

            <select
              className="select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Все клиенты</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Формирование…" : "Сформировать отчёт"}
        </button>
      </div>

      {searched && (
        <>
          <div className="grid grid-3" style={{ marginBottom: 18 }}>
            <div className="card stat">
              <div className="stat-label">
                Операции
              </div>

              <div className="stat-value">
                {totalOperations}
              </div>

              <div className="stat-note">
                за выбранный период
              </div>
            </div>

            <div className="card stat">
              <div className="stat-label">
                Количество
              </div>

              <div className="stat-value">
                {totalQuantity}
              </div>

              <div className="stat-note">
                штук
              </div>
            </div>

            <div className="card stat">
              <div className="stat-label">
                Итого
              </div>

              <div className="stat-value">
                {money(totalAmount)}
              </div>

              <div className="stat-note">
                активные начисления
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            {rows.length === 0 ? (
              <div className="empty">
                За выбранный период операций нет.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Операции</th>
                      <th>Количество</th>
                      <th>Итого</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.client_id}
                        className="clickable"
                        onClick={() => openClient(row)}
                      >
                        <td>
                          <div style={{ fontWeight: 650 }}>
                            {row.client_name}
                          </div>
                        </td>

                        <td>{row.operations}</td>

                        <td>{row.quantity}</td>

                        <td>
                          <strong>
                            {money(row.total)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedClient && (
            <div className="card">
              <div className="card-pad">
                <div className="page-head" style={{ marginBottom: 0 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 650,
                      }}
                    >
                      {selectedClient.client_name}
                    </div>

                    <div
                      className="page-subtitle"
                      style={{ marginTop: 4 }}
                    >
                      Детализация за {dateRu(from)} — {dateRu(to)}
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost"
                    onClick={() => setSelectedClient(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Товар</th>
                      <th>Количество</th>
                      <th>Цена</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientDetails.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {dateRu(item.shipment_date)}
                        </td>

                        <td>
                          <div style={{ fontWeight: 650 }}>
                            {item.products?.name || "—"}
                          </div>

                          {item.products?.sku && (
                            <div
                              style={{
                                color: "var(--muted)",
                                fontSize: 11,
                                marginTop: 3,
                              }}
                            >
                              {item.products.sku}
                            </div>
                          )}
                        </td>

                        <td>{item.quantity}</td>

                        <td>
                          {money(item.unit_price_rub)}
                        </td>

                        <td>
                          <strong>
                            {money(item.total_rub)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(300);

    setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function actionLabel(action) {
    const map = {
      INSERT: "Создание",
      UPDATE: "Изменение",
      DELETE: "Удаление",
    };

    return map[action] || action || "—";
  }

  function entityLabel(type) {
    const map = {
      clients: "Клиент",
      products: "Товар",
      tariffs: "Тариф",
      shipments: "Операция",
      storage_records: "Хранение",
    };

    return map[type] || type || "—";
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">История</div>

          <div className="page-subtitle">
            Журнал изменений системы
          </div>
        </div>

        <button className="btn btn-ghost" onClick={load}>
          Обновить
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : logs.length === 0 ? (
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
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {log.changed_at
                        ? new Date(
                            log.changed_at
                          ).toLocaleString("ru-RU")
                        : "—"}
                    </td>

                    <td>
                      {entityLabel(log.entity_type)}
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {actionLabel(log.action)}
                      </span>
                    </td>

                    <td>
                      {log.changed_by || "—"}
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

createRoot(document.getElementById("root")).render(<App />);
