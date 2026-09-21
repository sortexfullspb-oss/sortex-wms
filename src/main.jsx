import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const APP_CSS = `
:root{
--bg:#11110f;--bg2:#171614;--panel:#1c1b18;--panel2:#23211d;
--champagne:#c9b27d;--champagne-light:#ead9b1;
--text:#f4f0e8;--text-soft:#d5cec1;--muted:#8e897f;--muted2:#666159;
--green:#8daa93;--red:#c18a81;--border:rgba(218,199,157,.14);
--border-strong:rgba(218,199,157,.27);--glow:rgba(201,178,125,.12);
--shadow:0 18px 55px rgba(0,0,0,.34);--radius:19px}
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Arial,sans-serif;color:var(--text);background:radial-gradient(circle at 78% 0%,rgba(201,178,125,.06),transparent 31%),radial-gradient(circle at 8% 95%,rgba(201,178,125,.025),transparent 28%),var(--bg);-webkit-font-smoothing:antialiased}
button,input,select,textarea{font:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}
.app{min-height:100vh;background:var(--bg)}.shell{display:flex;min-height:100vh}
.sidebar{width:258px;background:linear-gradient(180deg,#1d1c19,#10100f);color:var(--text);padding:28px 17px;display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:20;border-right:1px solid var(--border);box-shadow:18px 0 50px rgba(0,0,0,.18)}
.brand{padding:5px 13px 32px}.brand-name{font-size:27px;font-weight:700;letter-spacing:.18em;color:#f5f0e7;text-shadow:0 0 28px rgba(201,178,125,.12)}
.brand-sub{margin-top:8px;color:var(--muted);font-size:10px;letter-spacing:.16em;text-transform:uppercase}
.nav{display:flex;flex-direction:column;gap:6px}.nav button{position:relative;border:1px solid transparent;background:transparent;color:#969188;padding:13px 15px;border-radius:14px;text-align:left;font-size:14px;transition:.2s ease}
.nav button:hover{background:rgba(201,178,125,.045);color:#eee8dc;border-color:rgba(201,178,125,.08)}
.nav button.active{color:#f3ead9;background:linear-gradient(90deg,rgba(201,178,125,.13),rgba(201,178,125,.045));border-color:rgba(201,178,125,.18);box-shadow:inset 0 0 22px rgba(201,178,125,.035),0 0 20px rgba(201,178,125,.045)}
.nav button.active:before{content:"";position:absolute;left:-1px;top:50%;width:3px;height:22px;transform:translateY(-50%);border-radius:0 4px 4px 0;background:var(--champagne);box-shadow:0 0 12px rgba(201,178,125,.55)}
.sidebar-bottom{margin-top:auto;padding:16px 12px 0;border-top:1px solid rgba(255,255,255,.055)}.user-mini{color:#aaa49a;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:12px}
.logout{width:100%;border:1px solid rgba(255,255,255,.09);color:#aaa49a;background:rgba(255,255,255,.025);padding:10px;border-radius:12px;transition:.2s ease}.logout:hover{color:#eee8dc;border-color:rgba(201,178,125,.18);background:rgba(201,178,125,.045);box-shadow:0 0 20px rgba(201,178,125,.04)}
.main{margin-left:258px;width:calc(100% - 258px);min-width:0;background:radial-gradient(circle at 75% 0%,rgba(201,178,125,.035),transparent 28%)}
.topbar{height:76px;background:rgba(18,17,16,.82);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 34px;position:sticky;top:0;z-index:10;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.topbar-title{font-size:20px;font-weight:600;color:#eee9df}.topbar-date{color:var(--muted);font-size:13px}
.content{padding:32px 34px 100px;max-width:1500px;margin:auto}.page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:25px}.page-title{font-size:30px;font-weight:650;letter-spacing:-.035em;color:#f2eee6}.page-subtitle{color:var(--muted);margin-top:7px;font-size:14px}
.card{position:relative;background:linear-gradient(145deg,rgba(34,32,29,.94),rgba(25,24,22,.97));border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden}.card:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,178,125,.2),transparent)}
.card-pad{padding:22px}.grid{display:grid;gap:16px}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.stat{padding:23px;min-height:142px;transition:.2s ease}.stat:hover{transform:translateY(-2px);border-color:rgba(201,178,125,.2);box-shadow:0 20px 55px rgba(0,0,0,.3),0 0 28px rgba(201,178,125,.055)}
.stat-label{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.12em}.stat-value{margin-top:12px;font-size:29px;font-weight:650;color:#f3eee5;letter-spacing:-.025em}.stat-note{color:var(--muted2);margin-top:6px;font-size:12px}
.btn{position:relative;border-radius:12px;padding:11px 17px;font-weight:600;font-size:13px;transition:.2s ease;overflow:hidden}
.btn-primary{border:1px solid rgba(230,213,170,.32);background:linear-gradient(135deg,#d8c18d,#b49a64);color:#171512;box-shadow:0 7px 25px rgba(0,0,0,.28),0 0 22px rgba(201,178,125,.12)}.btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 30px rgba(201,178,125,.2)}
.btn-secondary{border:1px solid rgba(201,178,125,.22);background:rgba(201,178,125,.08);color:var(--champagne-light)}.btn-secondary:hover{background:rgba(201,178,125,.13);border-color:rgba(201,178,125,.35);box-shadow:0 0 25px rgba(201,178,125,.09)}
.btn-ghost{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.1);color:#cbc5b9}.btn-ghost:hover{color:#f0ebe2;border-color:rgba(201,178,125,.24);background:rgba(201,178,125,.045);box-shadow:0 0 20px rgba(201,178,125,.05)}
.btn-danger{background:rgba(180,123,115,.12);border:1px solid rgba(180,123,115,.22);color:#d29b92}.btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}.actions{display:flex;flex-wrap:wrap;gap:9px}
.input,.select,.textarea{width:100%;border:1px solid rgba(255,255,255,.095);background:rgba(8,8,7,.48);border-radius:12px;padding:12px 13px;outline:none;color:#eee9df;transition:.18s ease}.input::placeholder,.textarea::placeholder{color:#646159}.input:hover,.select:hover,.textarea:hover{border-color:rgba(201,178,125,.15)}.input:focus,.select:focus,.textarea:focus{border-color:rgba(201,178,125,.48);background:rgba(201,178,125,.035);box-shadow:0 0 0 3px rgba(201,178,125,.075),0 0 24px rgba(201,178,125,.055)}
.textarea{min-height:95px;resize:vertical}.field{margin-bottom:16px}.label{display:block;font-size:11px;color:#aaa49a;margin-bottom:7px;font-weight:600}
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:650px}th{color:#77736a;font-size:10px;font-weight:600;text-align:left;text-transform:uppercase;letter-spacing:.09em;padding:13px 16px;border-bottom:1px solid var(--border)}td{padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.045);font-size:13px;color:#d7d1c6}tr:last-child td{border-bottom:0}tbody tr{transition:.18s ease}tbody tr:hover{background:rgba(201,178,125,.035)}
.clickable{cursor:pointer}.clickable:hover{background:rgba(201,178,125,.04)}
.badge{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:650;letter-spacing:.025em;border:1px solid transparent}.badge-active{background:rgba(127,157,134,.11);border-color:rgba(127,157,134,.18);color:#9dbba3}.badge-cancelled{background:rgba(180,123,115,.11);border-color:rgba(180,123,115,.18);color:#d39a91}.badge-neutral{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.07);color:#aaa49a}
.empty{text-align:center;padding:45px 20px;color:var(--muted)}.search{max-width:360px}.form-card{max-width:820px}.divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:20px 0}.tariff-box{border:1px solid var(--border);border-radius:15px;padding:17px;background:rgba(255,255,255,.018)}.tariff-title{font-weight:650;margin-bottom:15px;color:#eee9df}.price-big{font-size:22px;font-weight:650;color:var(--champagne-light)}
.switch-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 0}.switch{width:46px;height:26px;border-radius:99px;background:#393733;padding:3px;border:1px solid rgba(255,255,255,.07);position:relative;transition:.2s ease}.switch span{width:20px;height:20px;background:#c7c1b6;display:block;border-radius:50%;transition:.2s ease;box-shadow:0 2px 5px rgba(0,0,0,.25)}.switch.on{background:linear-gradient(90deg,#a9905e,#d6bd87);border-color:rgba(230,213,170,.35);box-shadow:0 0 18px rgba(201,178,125,.16)}.switch.on span{transform:translateX(20px);background:#fffaf0}
.notice{padding:13px 15px;background:rgba(201,178,125,.045);border:1px solid rgba(201,178,125,.1);border-radius:12px;color:#aaa397;font-size:13px;line-height:1.5}.error{padding:12px 14px;background:rgba(180,123,115,.1);border:1px solid rgba(180,123,115,.18);color:#d39a91;border-radius:11px;font-size:13px;margin-bottom:14px}.success{padding:12px 14px;background:rgba(127,157,134,.1);border:1px solid rgba(127,157,134,.17);color:#9dbba3;border-radius:11px;font-size:13px;margin-bottom:14px}.mobile-nav{display:none}
.login{min-height:100vh;background:radial-gradient(circle at 50% 20%,rgba(201,178,125,.1),transparent 30%),radial-gradient(circle at 80% 90%,rgba(201,178,125,.055),transparent 30%),#0d0d0c;display:flex;align-items:center;justify-content:center;padding:24px}.login-shell{width:min(440px,100%)}.login-brand{text-align:center;color:#fff;margin-bottom:25px}.login-brand-name{font-size:38px;font-weight:700;letter-spacing:.2em;color:#f5f0e7;text-shadow:0 0 35px rgba(201,178,125,.16)}.login-brand-sub{margin-top:9px;color:#77736b;font-size:10px;letter-spacing:.18em;text-transform:uppercase}.login-card{background:linear-gradient(145deg,rgba(31,30,27,.97),rgba(19,19,17,.98));border-radius:24px;padding:31px;box-shadow:0 30px 100px rgba(0,0,0,.5),0 0 50px rgba(201,178,125,.045);border:1px solid rgba(201,178,125,.14)}.login-card:before{content:"";display:block;height:1px;margin:-31px -31px 29px;background:linear-gradient(90deg,transparent,rgba(201,178,125,.38),transparent)}.login-title{font-size:24px;font-weight:650;margin-bottom:7px;color:#f0ebe2}.login-sub{color:#858078;font-size:13px;margin-bottom:25px}.login-accent{width:46px;height:2px;background:linear-gradient(90deg,#a88e5a,#e1ca95);margin-bottom:22px;box-shadow:0 0 15px rgba(201,178,125,.25)}.login-btn{width:100%;padding:13px;margin-top:4px}.login-footer{text-align:center;color:#555149;font-size:10px;letter-spacing:.04em;margin-top:18px}
::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#11110f}::-webkit-scrollbar-thumb{background:#35322d;border-radius:10px}::-webkit-scrollbar-thumb:hover{background:#4a453c}
@media(max-width:900px){
.sidebar{display:none}.main{margin-left:0;width:100%;padding-bottom:78px}.topbar{height:68px;padding:0 18px}.content{padding:24px 16px 88px}.grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}
.mobile-nav{display:flex;position:fixed;left:10px;right:10px;bottom:10px;height:64px;background:rgba(24,23,21,.94);border:1px solid rgba(201,178,125,.13);border-radius:18px;z-index:30;justify-content:space-around;align-items:center;padding:5px 4px calc(5px + env(safe-area-inset-bottom)) 4px;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:0 15px 45px rgba(0,0,0,.45),0 0 30px rgba(201,178,125,.045)}
.mobile-nav button{position:relative;background:transparent;border:0;color:#77736b;font-size:10px;padding:9px 10px;border-radius:12px;transition:.2s ease}.mobile-nav button.active{color:#ead9b1;background:rgba(201,178,125,.075);text-shadow:0 0 12px rgba(201,178,125,.18)}.mobile-nav button.active:after{content:"";position:absolute;left:50%;bottom:3px;width:18px;height:2px;transform:translateX(-50%);border-radius:10px;background:var(--champagne);box-shadow:0 0 10px rgba(201,178,125,.45)}
}
@media(max-width:650px){
.topbar-date{display:none}.topbar-title{font-size:18px}.page-head{align-items:flex-start;flex-direction:column;gap:14px}.page-title{font-size:25px}.page-subtitle{font-size:13px}.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}.card-pad{padding:18px}.stat{min-height:125px;padding:19px}.stat-value{font-size:27px}.btn{min-height:43px}.actions{width:100%}.actions .btn{flex:1 1 auto}.login{padding:18px}.login-card{padding:24px}.login-card:before{margin:-24px -24px 23px}.login-brand-name{font-size:32px}.login-brand-sub{font-size:9px}.input,.select,.textarea{font-size:16px}table{min-width:700px}
}
@supports(padding:max(0px)){.content{padding-bottom:max(100px,env(safe-area-inset-bottom))}.mobile-nav{bottom:max(10px,env(safe-area-inset-bottom))}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

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