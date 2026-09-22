import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CSS = `
:root{
  --bg:#171717;
  --bg2:#1d1c1a;
  --card:#22211f;
  --card2:#292724;
  --gold:#c8b58a;
  --gold2:#e8dec8;
  --text:#f5f1e8;
  --muted:#aaa49a;
  --line:rgba(200,181,138,.20);
  --green:#79977f;
  --red:#a87870;
  --shadow:0 18px 50px rgba(0,0,0,.25);
  --radius:18px;
}

*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;width:100%}
body{
  background:var(--bg);
  color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
}
button,input,select,textarea{font:inherit}
button{cursor:pointer}

.app{min-height:100vh;background:var(--bg)}
.layout{display:flex;min-height:100vh}

.sidebar{
  width:250px;
  flex:none;
  padding:22px 16px;
  background:#121212;
  border-right:1px solid rgba(255,255,255,.06);
  display:flex;
  flex-direction:column;
}
.logo{
  padding:8px 12px 26px;
  font-size:21px;
  font-weight:700;
  letter-spacing:.16em;
  color:var(--gold2);
}
.logo span{
  display:block;
  margin-top:5px;
  font-size:9px;
  letter-spacing:.22em;
  color:var(--muted);
  font-weight:500;
}
.nav{display:flex;flex-direction:column;gap:5px}
.nav button{
  border:1px solid transparent;
  background:transparent;
  color:#aaa69d;
  text-align:left;
  padding:12px 13px;
  border-radius:12px;
  transition:.18s;
}
.nav button:hover,
.nav button.active{
  color:var(--gold2);
  background:rgba(200,181,138,.08);
  border-color:rgba(200,181,138,.13);
  box-shadow:0 6px 22px rgba(200,181,138,.035);
}
.sidebarBottom{margin-top:auto}
.userSmall{
  padding:12px;
  color:var(--muted);
  font-size:12px;
  border-top:1px solid rgba(255,255,255,.06);
  margin-top:15px;
  word-break:break-word;
}

.main{flex:1;min-width:0}
.topbar{
  height:70px;
  border-bottom:1px solid rgba(255,255,255,.06);
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 30px;
  background:rgba(23,23,23,.92);
  position:sticky;
  top:0;
  z-index:10;
  backdrop-filter:blur(18px);
}
.pageTitle{font-size:20px;font-weight:650;letter-spacing:.01em}
.content{padding:28px;max-width:1500px;margin:auto}

.mobileNav{
  display:none;
}

.card{
  background:linear-gradient(145deg,#242320,#20201e);
  border:1px solid var(--line);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
}
.cardPad{padding:22px}

.grid{
  display:grid;
  gap:16px;
}
.grid2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid4{grid-template-columns:repeat(4,minmax(0,1fr))}

.stat{
  padding:20px;
  min-height:125px;
}
.statLabel{
  color:var(--muted);
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.08em;
}
.statValue{
  margin-top:14px;
  color:var(--gold2);
  font-size:28px;
  font-weight:650;
}
.statSub{margin-top:7px;color:#858078;font-size:12px}

.sectionTitle{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  margin-bottom:16px;
}
.sectionTitle h2{
  margin:0;
  font-size:18px;
  font-weight:650;
}
.sectionTitle p{
  margin:4px 0 0;
  color:var(--muted);
  font-size:12px;
}

.btn{
  border:1px solid var(--line);
  background:#2a2926;
  color:var(--text);
  border-radius:12px;
  padding:10px 15px;
  transition:.18s;
}
.btn:hover{
  border-color:rgba(200,181,138,.45);
  box-shadow:0 0 0 3px rgba(200,181,138,.07),0 8px 24px rgba(200,181,138,.05);
}
.btn:active{
  transform:translateY(1px);
  box-shadow:0 0 0 4px rgba(200,181,138,.09);
}
.btn.primary{
  background:linear-gradient(145deg,#cdbb91,#bca77a);
  color:#211f1b;
  border-color:transparent;
  font-weight:650;
}
.btn.danger{
  color:#e0b3ac;
}
.btn.ghost{
  background:transparent;
}
.btn.small{padding:7px 11px;font-size:12px}

.field{display:flex;flex-direction:column;gap:7px}
.field label{
  color:#aaa49a;
  font-size:12px;
}
.field input,
.field select,
.field textarea{
  width:100%;
  border:1px solid rgba(200,181,138,.18);
  background:#191918;
  color:var(--text);
  border-radius:11px;
  padding:11px 12px;
  outline:none;
  transition:.18s;
}
.field textarea{min-height:90px;resize:vertical}
.field input:focus,
.field select:focus,
.field textarea:focus{
  border-color:rgba(200,181,138,.55);
  box-shadow:0 0 0 3px rgba(200,181,138,.09),0 8px 24px rgba(200,181,138,.045);
}
.field input::placeholder,
.field textarea::placeholder{color:#69665f}

.formGrid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
}
.formGrid3{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
}
.full{grid-column:1/-1}

.actions{
  display:flex;
  justify-content:flex-end;
  gap:9px;
  margin-top:18px;
  flex-wrap:wrap;
}

.tableWrap{overflow:auto}
table{width:100%;border-collapse:collapse;min-width:700px}
th,td{
  padding:13px 12px;
  text-align:left;
  border-bottom:1px solid rgba(255,255,255,.065);
  font-size:13px;
}
th{
  color:#8f8b84;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.06em;
  font-weight:550;
}
td{color:#ddd8ce}
tr:hover td{background:rgba(200,181,138,.025)}

.searchRow{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:15px;
}
.searchRow .grow{flex:1;min-width:180px}

.badge{
  display:inline-flex;
  align-items:center;
  border:1px solid var(--line);
  border-radius:999px;
  padding:4px 8px;
  font-size:10px;
  color:var(--gold2);
}
.badge.green{color:#a8c4ad;border-color:rgba(121,151,127,.3)}
.badge.red{color:#d7aaa3;border-color:rgba(168,120,112,.3)}

.list{
  display:flex;
  flex-direction:column;
  gap:9px;
}
.listItem{
  padding:15px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:13px;
  background:rgba(255,255,255,.018);
}
.listItem.clickable{cursor:pointer}
.listItem.clickable:hover{
  border-color:rgba(200,181,138,.28);
  box-shadow:0 0 0 3px rgba(200,181,138,.045);
}
.rowBetween{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.muted{color:var(--muted)}
.smallText{font-size:12px}
.bigMoney{font-size:25px;color:var(--gold2);font-weight:650}
.divider{height:1px;background:rgba(255,255,255,.07);margin:18px 0}

.empty{
  padding:35px 15px;
  text-align:center;
  color:#77736b;
}
.loading{
  min-height:300px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--muted);
}
.error{
  color:#e0b3ac;
  background:rgba(168,120,112,.08);
  border:1px solid rgba(168,120,112,.22);
  border-radius:12px;
  padding:12px;
  margin-bottom:15px;
}
.success{
  color:#b6cfba;
  background:rgba(121,151,127,.08);
  border:1px solid rgba(121,151,127,.22);
  border-radius:12px;
  padding:12px;
  margin-bottom:15px;
}

.login{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:
    radial-gradient(circle at 50% 15%,rgba(200,181,138,.07),transparent 35%),
    #171717;
}
.loginCard{
  width:min(430px,100%);
  padding:30px;
}
.loginLogo{
  text-align:center;
  font-size:27px;
  font-weight:700;
  letter-spacing:.16em;
  color:var(--gold2);
  margin-bottom:7px;
}
.loginSub{
  text-align:center;
  color:var(--muted);
  font-size:12px;
  margin-bottom:28px;
}

.modalBack{
  position:fixed;
  inset:0;
  z-index:100;
  background:rgba(0,0,0,.67);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
}
.modal{
  width:min(760px,100%);
  max-height:92vh;
  overflow:auto;
  background:#22211f;
  border:1px solid var(--line);
  border-radius:20px;
  box-shadow:0 30px 100px rgba(0,0,0,.55);
}
.modalHead{
  padding:20px 22px;
  border-bottom:1px solid rgba(255,255,255,.07);
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
}
.modalHead h3{margin:0;font-size:18px}
.modalBody{padding:22px}

.close{
  width:34px;
  height:34px;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.08);
  background:#191918;
  color:#aaa49a;
}

.toggle{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:12px;
  background:#191918;
}
.toggle input{accent-color:#c8b58a}

.kpiGrid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
}
.kpi{
  padding:14px;
  border:1px solid rgba(255,255,255,.06);
  border-radius:13px;
  background:#191918;
}
.kpiLabel{font-size:11px;color:#817d75}
.kpiValue{font-size:20px;color:var(--gold2);font-weight:650;margin-top:6px}

@media(max-width:1000px){
  .sidebar{width:215px}
  .grid4{grid-template-columns:repeat(2,minmax(0,1fr))}
}

@media(max-width:760px){
  .layout{display:block}
  .sidebar{display:none}
  .topbar{
    height:62px;
    padding:0 16px;
  }
  .pageTitle{font-size:17px}
  .content{padding:16px 14px 88px}
  .mobileNav{
    position:fixed;
    display:flex;
    bottom:0;
    left:0;
    right:0;
    z-index:50;
    height:68px;
    background:rgba(18,18,18,.96);
    border-top:1px solid rgba(255,255,255,.08);
    backdrop-filter:blur(18px);
    padding:7px 5px;
    gap:3px;
  }
  .mobileNav button{
    flex:1;
    border:0;
    background:transparent;
    color:#77736b;
    font-size:10px;
    border-radius:10px;
  }
  .mobileNav button.active{
    color:var(--gold2);
    background:rgba(200,181,138,.08);
  }
  .grid2,.grid3,.grid4,.formGrid,.formGrid3{
    grid-template-columns:1fr;
  }
  .full{grid-column:auto}
  .kpiGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cardPad{padding:16px}
  .statValue{font-size:24px}
}

@media(min-width:761px){
  .hideDesktop{display:none}
}
`;

const money = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU");
};

const daysInclusive = (from, to) => {
  if (!from || !to) return 0;
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  const d = Math.floor((b - a) / 86400000) + 1;
  return d > 0 ? d : 0;
};

const esc = (v) =>
  String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="loading">Загрузка…</div>
      </>
    );
  }

  if (!session) return <Login />;

  return (
    <>
      <style>{CSS}</style>
      <Dashboard session={session} />
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) setError(authError.message);
    setBusy(false);
  }

  return (
    <div className="login">
      <form className="card loginCard" onSubmit={submit}>
        <div className="loginLogo">SORTEX</div>
        <div className="loginSub">WAREHOUSE MANAGEMENT SYSTEM</div>

        {error && <div className="error">{error}</div>}

        <div className="grid" style={{ gap: 13 }}>
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите e-mail"
              required
            />
          </div>

          <div className="field">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>
        </div>

        <button
          className="btn primary"
          style={{ width: "100%", marginTop: 18 }}
          disabled={busy}
        >
          {busy ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ session }) {
  const [page, setPage] = useState("home");

  const nav = [
    ["home", "Главная"],
    ["clients", "Клиенты"],
    ["products", "Товары"],
    ["shipments", "Отгрузки"],
    ["storage", "Хранение"],
    ["accruals", "Начисления"],
    ["tariffs", "Тарифы"],
    ["requests", "Заявки"],
  ];

  const titles = Object.fromEntries(nav);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app">
      <div className="layout">
        <aside className="sidebar">
          <div className="logo">
            SORTEX
            <span>WAREHOUSE MANAGEMENT</span>
          </div>

          <nav className="nav">
            {nav.map(([id, label]) => (
              <button
                key={id}
                className={page === id ? "active" : ""}
                onClick={() => setPage(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="sidebarBottom">
            <button className="btn ghost" style={{ width: "100%" }} onClick={logout}>
              Выйти
            </button>
            <div className="userSmall">{session.user.email}</div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="pageTitle">{titles[page]}</div>
            <div className="smallText muted">SORTEX WMS</div>
          </header>

          <div className="content">
            {page === "home" && <Home />}
            {page === "clients" && <Clients />}
            {page === "products" && <Products />}
            {page === "shipments" && <Shipments session={session} />}
            {page === "storage" && <Storage session={session} />}
            {page === "accruals" && <Accruals />}
            {page === "tariffs" && <Tariffs session={session} />}
            {page === "requests" && <Requests session={session} />}
          </div>
        </main>
      </div>

      <nav className="mobileNav">
        {nav.slice(0, 5).map(([id, label]) => (
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
    shipments: 0,
    storage: 0,
    amount: 0,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [clients, products, shipments, storage] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase
        .from("shipments")
        .select("total_rub, status")
        .neq("status", "cancelled"),
      supabase
        .from("storage_records")
        .select("total_rub, status")
        .neq("status", "cancelled"),
    ]);

    const shipmentAmount =
      shipments.data?.reduce((s, x) => s + Number(x.total_rub || 0), 0) || 0;

    const storageAmount =
      storage.data?.reduce((s, x) => s + Number(x.total_rub || 0), 0) || 0;

    setStats({
      clients: clients.count || 0,
      products: products.count || 0,
      shipments: shipments.data?.length || 0,
      storage: storage.data?.length || 0,
      amount: shipmentAmount + storageAmount,
    });
  }

  return (
    <>
      <div className="grid grid4">
        <div className="card stat">
          <div className="statLabel">Клиенты</div>
          <div className="statValue">{stats.clients}</div>
          <div className="statSub">Активные записи</div>
        </div>

        <div className="card stat">
          <div className="statLabel">Товары</div>
          <div className="statValue">{stats.products}</div>
          <div className="statSub">SKU в системе</div>
        </div>

        <div className="card stat">
          <div className="statLabel">Операции</div>
          <div className="statValue">{stats.shipments}</div>
          <div className="statSub">Отгрузочные операции</div>
        </div>

        <div className="card stat">
          <div className="statLabel">Начисления</div>
          <div className="statValue" style={{ fontSize: 22 }}>
            {money(stats.amount)}
          </div>
          <div className="statSub">Без отменённых операций</div>
        </div>
      </div>

      <div className="grid grid2" style={{ marginTop: 16 }}>
        <div className="card cardPad">
          <div className="sectionTitle">
            <div>
              <h2>Финансовая модель</h2>
              <p>SORTEX учитывает услуги, а не складские остатки.</p>
            </div>
          </div>

          <div className="list">
            <div className="listItem">
              <div className="rowBetween">
                <b>Отгрузки</b>
                <span className="badge">услуга</span>
              </div>
              <div className="smallText muted" style={{ marginTop: 6 }}>
                Базовый тариф + превышение веса + приёмка.
              </div>
            </div>

            <div className="listItem">
              <div className="rowBetween">
                <b>Хранение</b>
                <span className="badge">услуга</span>
              </div>
              <div className="smallText muted" style={{ marginTop: 6 }}>
                м³/день + единицы/день.
              </div>
            </div>

            <div className="listItem">
              <div className="rowBetween">
                <b>Начисления</b>
                <span className="badge">финансы</span>
              </div>
              <div className="smallText muted" style={{ marginTop: 6 }}>
                Детализация по клиенту, товару и периоду.
              </div>
            </div>
          </div>
        </div>

        <div className="card cardPad">
          <div className="sectionTitle">
            <div>
              <h2>Иерархия тарифов</h2>
              <p>Используется при расчёте операции.</p>
            </div>
          </div>

          <div className="list">
            <div className="listItem">
              <b>1. Товар</b>
              <div className="smallText muted" style={{ marginTop: 5 }}>
                Индивидуальная цена конкретного SKU.
              </div>
            </div>
            <div className="listItem">
              <b>2. Клиент</b>
              <div className="smallText muted" style={{ marginTop: 5 }}>
                Индивидуальный тариф клиента.
              </div>
            </div>
            <div className="listItem">
              <b>3. Системный тариф</b>
              <div className="smallText muted" style={{ marginTop: 5 }}>
                Базовый тариф SORTEX.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Clients() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("name");

    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) =>
      [x.name, x.legal_name, x.contact_name, x.phone, x.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Клиенты</h2>
          <p>Контрагенты и финансовая история.</p>
        </div>
        <button
          className="btn primary"
          onClick={() => setModal({ mode: "create" })}
        >
          + Клиент
        </button>
      </div>

      <div className="card cardPad">
        <div className="searchRow">
          <div className="field grow">
            <input
              placeholder="Поиск клиента…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">Клиенты не найдены.</div>
        ) : (
          <div className="list">
            {filtered.map((client) => (
              <div
                className="listItem clickable"
                key={client.id}
                onClick={() => setSelected(client)}
              >
                <div className="rowBetween">
                  <div>
                    <b>{client.name}</b>
                    {client.legal_name && (
                      <div className="smallText muted">
                        {client.legal_name}
                      </div>
                    )}
                  </div>
                  <span className="badge">
                    {client.is_active ? "Активен" : "Неактивен"}
                  </span>
                </div>

                <div
                  className="smallText muted"
                  style={{ marginTop: 8 }}
                >
                  {[client.contact_name, client.phone, client.email]
                    .filter(Boolean)
                    .join(" · ") || "Контактные данные не указаны"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ClientForm
          client={modal.mode === "edit" ? modal.client : null}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}

      {selected && (
        <ClientDetails
          client={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setModal({ mode: "edit", client: selected });
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function ClientForm({ client, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: client?.name || "",
    legal_name: client?.legal_name || "",
    inn: client?.inn || "",
    contact_name: client?.contact_name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    notes: client?.notes || "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const payload = { ...form };

    const result = client
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase.from("clients").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title={client ? "Редактирование клиента" : "Новый клиент"} onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="formGrid">
          <Field
            label="Название"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Field
            label="Юридическое название"
            value={form.legal_name}
            onChange={(v) => setForm({ ...form, legal_name: v })}
          />
          <Field
            label="ИНН"
            value={form.inn}
            onChange={(v) => setForm({ ...form, inn: v })}
          />
          <Field
            label="Контактное лицо"
            value={form.contact_name}
            onChange={(v) => setForm({ ...form, contact_name: v })}
          />
          <Field
            label="Телефон"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Примечание"
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            textarea
            full
          />
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ClientDetails({ client, onClose, onEdit }) {
  const [stats, setStats] = useState({
    shipments: 0,
    storage: 0,
    total: 0,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [s, st] = await Promise.all([
      supabase
        .from("shipments")
        .select("total_rub,status")
        .eq("client_id", client.id)
        .neq("status", "cancelled"),
      supabase
        .from("storage_records")
        .select("total_rub,status")
        .eq("client_id", client.id)
        .neq("status", "cancelled"),
    ]);

    const a =
      s.data?.reduce((sum, x) => sum + Number(x.total_rub || 0), 0) || 0;
    const b =
      st.data?.reduce((sum, x) => sum + Number(x.total_rub || 0), 0) || 0;

    setStats({
      shipments: a,
      storage: b,
      total: a + b,
    });
  }

  return (
    <Modal title={client.name} onClose={onClose}>
      <div className="kpiGrid">
        <div className="kpi">
          <div className="kpiLabel">Отгрузки</div>
          <div className="kpiValue">{money(stats.shipments)}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Хранение</div>
          <div className="kpiValue">{money(stats.storage)}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Начисления</div>
          <div className="kpiValue">{money(stats.total)}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Статус</div>
          <div className="kpiValue" style={{ fontSize: 15 }}>
            {client.is_active ? "Активен" : "Неактивен"}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid grid2">
        <Info label="Контакт" value={client.contact_name} />
        <Info label="Телефон" value={client.phone} />
        <Info label="E-mail" value={client.email} />
        <Info label="ИНН" value={client.inn} />
        <Info label="Юр. название" value={client.legal_name} />
      </div>

      {client.notes && (
        <div style={{ marginTop: 16 }}>
          <div className="muted smallText">Примечание</div>
          <div style={{ marginTop: 5 }}>{client.notes}</div>
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={onClose}>
          Закрыть
        </button>
        <button className="btn primary" onClick={onEdit}>
          Редактировать
        </button>
      </div>
    </Modal>
  );
}

function Products() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([
      supabase
        .from("products")
        .select("*, clients(name)")
        .order("name"),
      supabase.from("clients").select("id,name").order("name"),
    ]);

    setItems(p.data || []);
    setClients(c.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((x) =>
    [x.name, x.sku, x.clients?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Товары</h2>
          <p>SKU и индивидуальная базовая цена. Остатки ведутся в МойСклад.</p>
        </div>
        <button className="btn primary" onClick={() => setModal(true)}>
          + Товар
        </button>
      </div>

      <div className="card cardPad">
        <div className="searchRow">
          <div className="field grow">
            <input
              placeholder="Поиск по SKU, названию или клиенту…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Товар</th>
                <th>Клиент</th>
                <th>Вес</th>
                <th>Цена</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>{x.sku}</td>
                  <td>{x.name}</td>
                  <td>{x.clients?.name || "—"}</td>
                  <td>{Number(x.weight_kg || 0)} кг</td>
                  <td>{money(x.price_rub)}</td>
                  <td>
                    <span className={`badge ${x.is_active ? "green" : "red"}`}>
                      {x.is_active ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <div className="empty">Товары не найдены.</div>}
        </div>
      </div>

      {modal && (
        <ProductForm
          clients={clients}
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            load();
          }}
        />
      )}
    </>
  );
}

function ProductForm({ clients, onClose, onSaved }) {
  const [form, setForm] = useState({
    client_id: clients[0]?.id || "",
    sku: "",
    name: "",
    price_rub: "0",
    weight_kg: "0",
    notes: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const sku =
      form.sku.trim() ||
      `SKU-${Date.now().toString().slice(-8)}`;

    const payload = {
      client_id: form.client_id,
      sku,
      name: form.name,
      price_rub: Number(form.price_rub || 0),
      weight_kg: Number(form.weight_kg || 0),
      size_type: "small",
      notes: form.notes || null,
      is_active: true,
    };

    const { error: insertError } = await supabase
      .from("products")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title="Новый товар" onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="formGrid">
          <div className="field">
            <label>Клиент</label>
            <select
              value={form.client_id}
              onChange={(e) =>
                setForm({ ...form, client_id: e.target.value })
              }
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

          <Field
            label="SKU"
            value={form.sku}
            onChange={(v) => setForm({ ...form, sku: v })}
            placeholder="Можно оставить пустым"
          />

          <Field
            label="Название"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />

          <Field
            label="Базовая цена, ₽"
            type="number"
            value={form.price_rub}
            onChange={(v) => setForm({ ...form, price_rub: v })}
            min="0"
            step="0.01"
            required
          />

          <Field
            label="Вес одной единицы, кг"
            type="number"
            value={form.weight_kg}
            onChange={(v) => setForm({ ...form, weight_kg: v })}
            min="0"
            step="0.001"
          />

          <Field
            label="Примечание"
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            textarea
            full
          />
        </div>

        <div className="smallText muted" style={{ marginTop: 12 }}>
          Размерный тариф в форме товара не выбирается. Цена задаётся непосредственно
          для товара, а специальные тарифы клиента/товара настраиваются отдельно.
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Shipments({ session }) {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const [s, c, p] = await Promise.all([
      supabase
        .from("shipments")
        .select("*, clients(name), products(name,sku)")
        .order("shipment_date", { ascending: false })
        .limit(300),
      supabase.from("clients").select("id,name").eq("is_active", true).order("name"),
      supabase
        .from("products")
        .select("id,client_id,name,sku,price_rub,weight_kg,size_type")
        .eq("is_active", true)
        .order("name"),
    ]);

    setItems(s.data || []);
    setClients(c.data || []);
    setProducts(p.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((x) =>
    [
      x.clients?.name,
      x.products?.name,
      x.products?.sku,
      x.note,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function cancel(id) {
    if (!confirm("Отменить эту операцию?")) return;

    const { error } = await supabase.rpc("cancel_shipment", {
      p_shipment_id: id,
    });

    if (error) {
      alert(error.message);
      return;
    }

    load();
  }

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Отгрузки</h2>
          <p>Начисление за отгрузку, вес и отдельную услугу приёмки.</p>
        </div>
        <button className="btn primary" onClick={() => setModal(true)}>
          + Отгрузка
        </button>
      </div>

      <div className="card cardPad">
        <div className="searchRow">
          <div className="field grow">
            <input
              placeholder="Поиск по клиенту, товару или SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Товар</th>
                <th>Кол-во</th>
                <th>Вес</th>
                <th>Приёмка</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>{formatDate(x.shipment_date)}</td>
                  <td>{x.clients?.name}</td>
                  <td>
                    {x.products?.name}
                    <div className="smallText muted">{x.products?.sku}</div>
                  </td>
                  <td>{x.quantity}</td>
                  <td>{Number(x.weight_kg || 0)} кг</td>
                  <td>{x.receiving_enabled ? "Да" : "Нет"}</td>
                  <td>{money(x.total_rub)}</td>
                  <td>
                    <span
                      className={`badge ${
                        x.status === "cancelled" ? "red" : "green"
                      }`}
                    >
                      {x.status === "cancelled" ? "Отменена" : "Активна"}
                    </span>
                  </td>
                  <td>
                    {x.status !== "cancelled" && (
                      <button
                        className="btn small danger"
                        onClick={() => cancel(x.id)}
                      >
                        Отменить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <div className="empty">Операций нет.</div>}
        </div>
      </div>

      {modal && (
        <ShipmentForm
          session={session}
          clients={clients}
          products={products}
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            load();
          }}
        />
      )}
    </>
  );
}

function ShipmentForm({ session, clients, products, onClose, onSaved }) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weight, setWeight] = useState("0");
  const [receiving, setReceiving] = useState(false);
  const [note, setNote] = useState("");
  const [tariff, setTariff] = useState({
    base: 0,
    included: 1,
    extra: 8,
    receiving: 5,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const availableProducts = products.filter((p) => p.client_id === clientId);
  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    if (!productId && availableProducts[0]) {
      setProductId(availableProducts[0].id);
    }
  }, [clientId, products]);

  useEffect(() => {
    if (!product) return;

    loadTariff();
  }, [productId, clientId]);

  async function loadTariff() {
    if (!product) return;

    let base = Number(product.price_rub || 0);
    let included = 1;
    let extra = 8;
    let receivingPrice = 5;

    const { data: custom } = await supabase
      .from("service_tariffs")
      .select("*")
      .eq("service_type", "shipment")
      .eq("enabled", true)
      .lte("effective_from", today())
      .or(`effective_to.is.null,effective_to.gte.${today()}`)
      .order("effective_from", { ascending: false });

    const rows = custom || [];

    const productRate = rows.find(
      (x) => x.product_id === product.id && x.client_id === clientId
    );

    const clientRate = rows.find(
      (x) => !x.product_id && x.client_id === clientId
    );

    const selected = productRate || clientRate;

    if (selected) {
      base = Number(selected.price_rub || base);
      included = Number(selected.included_weight_kg ?? 1);
      extra = Number(selected.extra_kg_price_rub ?? 8);
    } else {
      const { data: sys } = await supabase
        .from("system_tariffs")
        .select("*")
        .eq("tariff_type", "shipment")
        .eq("enabled", true)
        .order("effective_from", { ascending: false })
        .limit(1);

      if (sys?.[0]) {
        included = Number(sys[0].included_weight_kg ?? 1);
        extra = Number(sys[0].extra_kg_price_rub ?? 8);
      }
    }

    const { data: receive } = await supabase
      .from("service_tariffs")
      .select("*")
      .eq("service_type", "receiving")
      .eq("enabled", true)
      .lte("effective_from", today())
      .or(`effective_to.is.null,effective_to.gte.${today()}`)
      .order("effective_from", { ascending: false });

    const receiveRows = receive || [];

    const receiveProduct = receiveRows.find(
      (x) => x.product_id === product.id && x.client_id === clientId
    );

    const receiveClient = receiveRows.find(
      (x) => !x.product_id && x.client_id === clientId
    );

    const receiveSelected = receiveProduct || receiveClient;

    if (receiveSelected) {
      receivingPrice = Number(receiveSelected.price_rub || 5);
    }

    setTariff({
      base,
      included,
      extra,
      receiving: receivingPrice,
    });

    setWeight(
      product.weight_kg !== null && product.weight_kg !== undefined
        ? String(product.weight_kg)
        : "0"
    );
  }

  const qty = Math.max(Number(quantity || 0), 0);
  const kg = Math.max(Number(weight || 0), 0);
  const extraKg = Math.max(kg - tariff.included, 0);
  const extraPerUnit = extraKg * tariff.extra;
  const unitPrice = tariff.base + extraPerUnit;
  const shipmentTotal = qty * unitPrice;
  const receivingTotal = receiving ? qty * tariff.receiving : 0;
  const total = shipmentTotal + receivingTotal;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!clientId || !productId || qty <= 0) {
      setError("Выберите клиента, товар и укажите количество.");
      setBusy(false);
      return;
    }

    const payload = {
      client_id: clientId,
      product_id: productId,
      shipment_date: today(),
      quantity: qty,
      tariff_type: "shipment",
      unit_price_rub: Number(unitPrice.toFixed(2)),
      total_rub: Number(total.toFixed(2)),
      status: "active",
      note: note || null,
      created_by: session.user.id,

      weight_kg: kg,
      base_unit_price_rub: Number(tariff.base.toFixed(2)),
      included_weight_kg: Number(tariff.included.toFixed(3)),
      extra_kg_price_rub: Number(tariff.extra.toFixed(2)),
      extra_kg_rub: Number((extraKg * tariff.extra * qty).toFixed(2)),

      receiving_enabled: receiving,
      receiving_unit_price_rub: Number(tariff.receiving.toFixed(2)),
      receiving_total_rub: Number(receivingTotal.toFixed(2)),
    };

    const { error: insertError } = await supabase
      .from("shipments")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title="Новая отгрузка" onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="formGrid">
          <div className="field">
            <label>Клиент</label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProductId("");
              }}
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

          <div className="field">
            <label>Товар</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Выберите товар</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.sku}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Количество"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={setQuantity}
            required
          />

          <Field
            label="Вес одной единицы, кг"
            type="number"
            min="0"
            step="0.001"
            value={weight}
            onChange={setWeight}
          />

          <div className="toggle full">
            <input
              type="checkbox"
              checked={receiving}
              onChange={(e) => setReceiving(e.target.checked)}
              id="receiving"
            />
            <label htmlFor="receiving">
              Приёмка товара — {money(tariff.receiving)} / шт.
            </label>
          </div>

          <Field
            label="Примечание"
            value={note}
            onChange={setNote}
            textarea
            full
          />
        </div>

        <div className="divider" />

        <div className="kpiGrid">
          <div className="kpi">
            <div className="kpiLabel">База / шт.</div>
            <div className="kpiValue">{money(tariff.base)}</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Сверх включённого</div>
            <div className="kpiValue">
              {extraKg.toFixed(3)} кг
            </div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Доп. вес</div>
            <div className="kpiValue">{money(extraPerUnit)} / шт.</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Итого</div>
            <div className="kpiValue">{money(total)}</div>
          </div>
        </div>

        <div className="smallText muted" style={{ marginTop: 12 }}>
          До {tariff.included} кг включено в базовый тариф. Сверх него —
          {money(tariff.extra)} за каждый кг.
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Сохранение…" : "Начислить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Storage({ session }) {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [modal, setModal] = useState(false);

  async function load() {
    const [s, c] = await Promise.all([
      supabase
        .from("storage_records")
        .select("*, clients(name)")
        .order("start_date", { ascending: false })
        .limit(300),
      supabase.from("clients").select("id,name").eq("is_active", true).order("name"),
    ]);

    setItems(s.data || []);
    setClients(c.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id) {
    if (!confirm("Отменить запись хранения?")) return;

    const { error } = await supabase.rpc("cancel_storage", {
      p_storage_id: id,
    });

    if (error) alert(error.message);
    else load();
  }

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Хранение</h2>
          <p>80 ₽/м³/день + 0,20 ₽/единица/день.</p>
        </div>
        <button className="btn primary" onClick={() => setModal(true)}>
          + Хранение
        </button>
      </div>

      <div className="card cardPad">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Период</th>
                <th>Дней</th>
                <th>м³</th>
                <th>Единиц</th>
                <th>Итого</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x.id}>
                  <td>{x.clients?.name}</td>
                  <td>
                    {formatDate(x.start_date)} — {formatDate(x.end_date)}
                  </td>
                  <td>{daysInclusive(x.start_date, x.end_date)}</td>
                  <td>{Number(x.volume_m3 || 0).toFixed(3)}</td>
                  <td>{x.unit_count}</td>
                  <td>{money(x.total_rub)}</td>
                  <td>
                    <span
                      className={`badge ${
                        x.status === "cancelled" ? "red" : "green"
                      }`}
                    >
                      {x.status === "cancelled" ? "Отменено" : x.status}
                    </span>
                  </td>
                  <td>
                    {x.status !== "cancelled" && (
                      <button
                        className="btn small danger"
                        onClick={() => cancel(x.id)}
                      >
                        Отменить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && <div className="empty">Записей хранения нет.</div>}
        </div>
      </div>

      {modal && (
        <StorageForm
          session={session}
          clients={clients}
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            load();
          }}
        />
      )}
    </>
  );
}

function StorageForm({ session, clients, onClose, onSaved }) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [volume, setVolume] = useState("0");
  const [units, setUnits] = useState("0");
  const [m3Rate, setM3Rate] = useState("80");
  const [unitRate, setUnitRate] = useState("0.20");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const days = daysInclusive(from, to);
  const total = days * (
    Number(volume || 0) * Number(m3Rate || 0) +
    Number(units || 0) * Number(unitRate || 0)
  );

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!clientId || days <= 0) {
      setError("Проверьте клиента и период.");
      setBusy(false);
      return;
    }

    const payload = {
      client_id: clientId,
      volume_m3: Number(volume || 0),
      start_date: from,
      end_date: to,
      tariff_type: "storage",
      price_per_m3_day_rub: Number(m3Rate || 0),
      total_rub: Number(total.toFixed(2)),
      status: "active",
      note: note || null,
      created_by: session.user.id,
      unit_count: Number(units || 0),
      price_per_unit_day_rub: Number(unitRate || 0),
    };

    const { error: insertError } = await supabase
      .from("storage_records")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title="Новое хранение" onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="formGrid">
          <div className="field full">
            <label>Клиент</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
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

          <Field
            label="Начало"
            type="date"
            value={from}
            onChange={setFrom}
            required
          />

          <Field
            label="Окончание"
            type="date"
            value={to}
            onChange={setTo}
            required
          />

          <Field
            label="Объём, м³"
            type="number"
            min="0"
            step="0.001"
            value={volume}
            onChange={setVolume}
          />

          <Field
            label="Количество единиц"
            type="number"
            min="0"
            step="1"
            value={units}
            onChange={setUnits}
          />

          <Field
            label="₽ / м³ / день"
            type="number"
            min="0"
            step="0.01"
            value={m3Rate}
            onChange={setM3Rate}
          />

          <Field
            label="₽ / единицу / день"
            type="number"
            min="0"
            step="0.01"
            value={unitRate}
            onChange={setUnitRate}
          />

          <Field
            label="Примечание"
            value={note}
            onChange={setNote}
            textarea
            full
          />
        </div>

        <div className="divider" />

        <div className="rowBetween">
          <div>
            <div className="muted smallText">Дней</div>
            <div className="bigMoney">{days}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="muted smallText">Начисление</div>
            <div className="bigMoney">{money(total)}</div>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Сохранение…" : "Начислить"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Accruals() {
  const [shipments, setShipments] = useState([]);
  const [storage, setStorage] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [to, setTo] = useState(today());

  async function load() {
    let shipmentQuery = supabase
      .from("shipments")
      .select("*, clients(name), products(name,sku)")
      .gte("shipment_date", from)
      .lte("shipment_date", to)
      .order("shipment_date", { ascending: false });

    let storageQuery = supabase
      .from("storage_records")
      .select("*, clients(name)")
      .gte("start_date", from)
      .lte("start_date", to)
      .order("start_date", { ascending: false });

    if (clientId) {
      shipmentQuery = shipmentQuery.eq("client_id", clientId);
      storageQuery = storageQuery.eq("client_id", clientId);
    }

    const [s, st] = await Promise.all([shipmentQuery, storageQuery]);

    setShipments(s.data || []);
    setStorage(st.data || []);
  }

  useEffect(() => {
    supabase
      .from("clients")
      .select("id,name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setClients(data || []));
  }, []);

  useEffect(() => {
    load();
  }, [clientId, from, to]);

  const activeShipments = shipments.filter((x) => x.status !== "cancelled");
  const activeStorage = storage.filter((x) => x.status !== "cancelled");

  const total =
    activeShipments.reduce((s, x) => s + Number(x.total_rub || 0), 0) +
    activeStorage.reduce((s, x) => s + Number(x.total_rub || 0), 0);

  const units = activeShipments.reduce((s, x) => s + Number(x.quantity || 0), 0);

  const receiving = activeShipments.reduce(
    (s, x) => s + Number(x.receiving_total_rub || 0),
    0
  );

  const extraWeight = activeShipments.reduce(
    (s, x) => s + Number(x.extra_kg_rub || 0),
    0
  );

  function exportCSV() {
    const rows = [
      [
        "Тип",
        "Дата",
        "Клиент",
        "Товар",
        "Количество",
        "Приёмка",
        "Доп. вес",
        "Сумма",
        "Статус",
      ],
    ];

    activeShipments.forEach((x) => {
      rows.push([
        "Отгрузка",
        x.shipment_date,
        x.clients?.name || "",
        x.products?.name || "",
        x.quantity,
        x.receiving_total_rub,
        x.extra_kg_rub,
        x.total_rub,
        x.status,
      ]);
    });

    activeStorage.forEach((x) => {
      rows.push([
        "Хранение",
        x.start_date,
        x.clients?.name || "",
        "",
        x.unit_count,
        "",
        "",
        x.total_rub,
        x.status,
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sortex-accruals-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Начисления</h2>
          <p>Финансовая детализация за выбранный период.</p>
        </div>

        <button className="btn" onClick={exportCSV}>
          Экспорт CSV
        </button>
      </div>

      <div className="card cardPad">
        <div className="formGrid3">
          <Field label="С" type="date" value={from} onChange={setFrom} />
          <Field label="По" type="date" value={to} onChange={setTo} />

          <div className="field">
            <label>Клиент</label>
            <select
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

      <div className="kpiGrid" style={{ marginTop: 16 }}>
        <div className="kpi">
          <div className="kpiLabel">Всего</div>
          <div className="kpiValue">{money(total)}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Единиц</div>
          <div className="kpiValue">{units}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Приёмка</div>
          <div className="kpiValue">{money(receiving)}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Доп. вес</div>
          <div className="kpiValue">{money(extraWeight)}</div>
        </div>
      </div>

      <div className="card cardPad" style={{ marginTop: 16 }}>
        <div className="sectionTitle">
          <div>
            <h2>Отгрузки</h2>
            <p>{activeShipments.length} операций</p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Товар</th>
                <th>Кол-во</th>
                <th>Доп. вес</th>
                <th>Приёмка</th>
                <th>Итого</th>
              </tr>
            </thead>
            <tbody>
              {activeShipments.map((x) => (
                <tr key={x.id}>
                  <td>{formatDate(x.shipment_date)}</td>
                  <td>{x.clients?.name}</td>
                  <td>{x.products?.name}</td>
                  <td>{x.quantity}</td>
                  <td>{money(x.extra_kg_rub)}</td>
                  <td>{money(x.receiving_total_rub)}</td>
                  <td>{money(x.total_rub)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card cardPad" style={{ marginTop: 16 }}>
        <div className="sectionTitle">
          <div>
            <h2>Хранение</h2>
            <p>{activeStorage.length} записей</p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Период</th>
                <th>м³</th>
                <th>Единиц</th>
                <th>Итого</th>
              </tr>
            </thead>
            <tbody>
              {activeStorage.map((x) => (
                <tr key={x.id}>
                  <td>{x.clients?.name}</td>
                  <td>
                    {formatDate(x.start_date)} — {formatDate(x.end_date)}
                  </td>
                  <td>{x.volume_m3}</td>
                  <td>{x.unit_count}</td>
                  <td>{money(x.total_rub)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Tariffs({ session }) {
  const [system, setSystem] = useState([]);
  const [custom, setCustom] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);

  async function load() {
    const [s, c, p, cl] = await Promise.all([
      supabase.from("system_tariffs").select("*").order("tariff_type"),
      supabase
        .from("service_tariffs")
        .select("*, clients(name), products(name,sku)")
        .order("effective_from", { ascending: false }),
      supabase.from("clients").select("id,name").order("name"),
      supabase.from("products").select("id,name,sku,client_id").order("name"),
    ]);

    setSystem(s.data || []);
    setCustom(c.data || []);
    setClients(cl.data || []);
    setProducts(p.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Тарифы</h2>
          <p>Системные и индивидуальные тарифы клиентов.</p>
        </div>

        <button className="btn primary" onClick={() => setModal(true)}>
          + Спецтариф
        </button>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <div>
            <h2>Системные тарифы</h2>
            <p>Базовые значения SORTEX.</p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Тип</th>
                <th>Цена</th>
                <th>Включённый вес</th>
                <th>Доп. кг</th>
                <th>Единица/день</th>
                <th>Активен</th>
              </tr>
            </thead>
            <tbody>
              {system.map((x) => (
                <tr key={x.id}>
                  <td>{x.tariff_type}</td>
                  <td>{money(x.price_rub)}</td>
                  <td>{x.included_weight_kg ?? "—"}</td>
                  <td>{money(x.extra_kg_price_rub)}</td>
                  <td>
                    {x.price_per_unit_day_rub != null
                      ? money(x.price_per_unit_day_rub)
                      : "—"}
                  </td>
                  <td>{x.enabled ? "Да" : "Нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card cardPad" style={{ marginTop: 16 }}>
        <div className="sectionTitle">
          <div>
            <h2>Индивидуальные тарифы</h2>
            <p>Товар → клиент → системный тариф.</p>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Клиент</th>
                <th>Товар</th>
                <th>Цена</th>
                <th>Доп. кг</th>
                <th>Период</th>
                <th>Активен</th>
              </tr>
            </thead>
            <tbody>
              {custom.map((x) => (
                <tr key={x.id}>
                  <td>{x.service_type}</td>
                  <td>{x.clients?.name || "—"}</td>
                  <td>
                    {x.products
                      ? `${x.products.name} · ${x.products.sku}`
                      : "Все товары"}
                  </td>
                  <td>{money(x.price_rub)}</td>
                  <td>{money(x.extra_kg_price_rub)}</td>
                  <td>
                    {formatDate(x.effective_from)} —{" "}
                    {x.effective_to ? formatDate(x.effective_to) : "∞"}
                  </td>
                  <td>{x.enabled ? "Да" : "Нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {custom.length === 0 && (
            <div className="empty">Индивидуальных тарифов пока нет.</div>
          )}
        </div>
      </div>

      {modal && (
        <TariffForm
          session={session}
          clients={clients}
          products={products}
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            load();
          }}
        />
      )}
    </>
  );
}

function TariffForm({ session, clients, products, onClose, onSaved }) {
  const [service, setService] = useState("shipment");
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("30");
  const [included, setIncluded] = useState("1");
  const [extra, setExtra] = useState("8");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const availableProducts = products.filter(
    (p) => !clientId || p.client_id === clientId
  );

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!clientId) {
      setError("Выберите клиента.");
      setBusy(false);
      return;
    }

    const payload = {
      client_id: clientId,
      product_id: productId || null,
      service_type: service,
      price_rub: Number(price || 0),
      enabled: true,
      effective_from: from,
      effective_to: to || null,
      created_by: session.user.id,
      included_weight_kg:
        service === "shipment" ? Number(included || 1) : 0,
      extra_kg_price_rub:
        service === "shipment" ? Number(extra || 8) : 0,
    };

    const { error: insertError } = await supabase
      .from("service_tariffs")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title="Новый специальный тариф" onClose={onClose}>
      <form onSubmit={save}>
        {error && <div className="error">{error}</div>}

        <div className="formGrid">
          <div className="field">
            <label>Услуга</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="shipment">Отгрузка</option>
              <option value="receiving">Приёмка</option>
            </select>
          </div>

          <div className="field">
            <label>Клиент</label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProductId("");
              }}
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

          <div className="field full">
            <label>Товар</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Все товары клиента</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.sku}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Цена, ₽"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={setPrice}
            required
          />

          {service === "shipment" && (
            <>
              <Field
                label="Включённый вес, кг"
                type="number"
                min="0"
                step="0.001"
                value={included}
                onChange={setIncluded}
              />
              <Field
                label="Доп. кг, ₽"
                type="number"
                min="0"
                step="0.01"
                value={extra}
                onChange={setExtra}
              />
            </>
          )}

          <Field
            label="Действует с"
            type="date"
            value={from}
            onChange={setFrom}
            required
          />

          <Field
            label="Действует до"
            type="date"
            value={to}
            onChange={setTo}
          />
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Сохранение…" : "Сохранить тариф"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Requests({ session }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("cooperation_requests")
      .select("*, clients(name)")
      .order("created_at", { ascending: false });

    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("cooperation_requests")
      .update({
        status,
        processed_at: status === "closed" ? new Date().toISOString() : null,
        processed_by: session.user.id,
      })
      .eq("id", id);

    if (error) alert(error.message);
    else load();
  }

  return (
    <>
      <div className="sectionTitle">
        <div>
          <h2>Заявки</h2>
          <p>Запросы на сотрудничество с сайта SORTEX.</p>
        </div>
      </div>

      <div className="card cardPad">
        <div className="list">
          {items.map((x) => (
            <div
              className="listItem clickable"
              key={x.id}
              onClick={() => setSelected(x)}
            >
              <div className="rowBetween">
                <div>
                  <b>{x.name}</b>
                  <div className="smallText muted">
                    {x.email || x.phone || "Контакт не указан"}
                  </div>
                </div>

                <span className="badge">{requestStatus(x.status)}</span>
              </div>

              {x.message && (
                <div className="smallText muted" style={{ marginTop: 9 }}>
                  {x.message}
                </div>
              )}

              <div className="smallText muted" style={{ marginTop: 9 }}>
                {new Date(x.created_at).toLocaleString("ru-RU")}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="empty">Заявок пока нет.</div>
          )}
        </div>
      </div>

      {selected && (
        <RequestModal
          request={selected}
          onClose={() => setSelected(null)}
          onStatus={async (status) => {
            await updateStatus(selected.id, status);
            setSelected(null);
          }}
        />
      )}
    </>
  );
}

function RequestModal({ request, onClose, onStatus }) {
  return (
    <Modal title="Заявка на сотрудничество" onClose={onClose}>
      <div className="grid grid2">
        <Info label="Имя" value={request.name} />
        <Info label="E-mail" value={request.email} />
        <Info label="Телефон" value={request.phone} />
        <Info label="Статус" value={requestStatus(request.status)} />
      </div>

      {request.message && (
        <div style={{ marginTop: 18 }}>
          <div className="muted smallText">Сообщение</div>
          <div
            className="listItem"
            style={{ marginTop: 7, whiteSpace: "pre-wrap" }}
          >
            {request.message}
          </div>
        </div>
      )}

      {request.internal_note && (
        <div style={{ marginTop: 18 }}>
          <div className="muted smallText">Внутренняя заметка</div>
          <div
            className="listItem"
            style={{ marginTop: 7, whiteSpace: "pre-wrap" }}
          >
            {request.internal_note}
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={() => onStatus("in_progress")}>
          В работу
        </button>
        <button className="btn" onClick={() => onStatus("contacted")}>
          Связались
        </button>
        <button className="btn primary" onClick={() => onStatus("closed")}>
          Закрыть
        </button>
      </div>
    </Modal>
  );
}

function requestStatus(status) {
  const map = {
    new: "Новая",
    in_progress: "В работе",
    contacted: "Связались",
    closed: "Закрыта",
  };

  return map[status] || status || "—";
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  full = false,
  ...props
}) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>{label}</label>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="muted smallText">{label}</div>
      <div style={{ marginTop: 5 }}>{value || "—"}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modalBack" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <h3>{title}</h3>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
