import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CHAMPAGNE = "#C8B58A";
const CHAMPAGNE_LIGHT = "#E8DEC8";
const GRAPHITE = "#242321";
const GRAPHITE_2 = "#302E2A";
const CREAM = "#F7F5F0";
const WHITE = "#FFFDF9";
const BORDER = "#DED9CF";
const TEXT = "#292825";
const MUTED = "#77736B";

const tariffLabels = {
  small: "Малый",
  medium: "Средний",
  large: "Большой",
  storage: "Хранение",
};

const operationLabels = {
  small: "Малый",
  medium: "Средний",
  large: "Большой",
};

function money(value) {
  return `${Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU");
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setLoading(false);
  }

  if (loading) {
    return <div style={styles.loadingScreen}>SORTEX</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <Dashboard session={session} />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event) {
    event.preventDefault();
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
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.logoMark}>S</div>

        <div style={styles.brandLarge}>SORTEX</div>
        <div style={styles.brandSubtitle}>WAREHOUSE ACCOUNTING</div>

        <div style={{ height: 32 }} />

        <h1 style={styles.loginTitle}>Вход в систему</h1>
        <p style={styles.loginText}>
          Учет услуг, тарифов и начислений
        </p>

        <form onSubmit={login}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите email"
            required
          />

          <label style={styles.label}>Пароль</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.primaryButton} disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ session }) {
  const [page, setPage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
  }

  const menu = [
    { id: "dashboard", label: "Главная", icon: "⌂" },
    { id: "clients", label: "Клиенты", icon: "♙" },
    { id: "products", label: "Номенклатура", icon: "▦" },
    { id: "tariffs", label: "Тарифы", icon: "₽" },
    { id: "operations", label: "Операции", icon: "≡" },
    { id: "payable", label: "К оплате", icon: "◇" },
    { id: "history", label: "История", icon: "◷" },
  ];

  function navigate(id) {
    setPage(id);
    setMobileMenu(false);
  }

  return (
    <div style={styles.shell}>
      <aside
        style={{
          ...styles.sidebar,
          ...(mobileMenu ? styles.sidebarMobileOpen : {}),
        }}
      >
        <div style={styles.sidebarBrand}>
          <div style={styles.sidebarLogo}>S</div>
          <div>
            <div style={styles.sidebarTitle}>SORTEX</div>
            <div style={styles.sidebarSub}>WMS</div>
          </div>
        </div>

        <div style={styles.menuCaption}>РАБОЧАЯ ОБЛАСТЬ</div>

        <nav>
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                ...styles.menuItem,
                ...(page === item.id ? styles.menuItemActive : {}),
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.accountBox}>
            <div style={styles.accountDot} />
            <div style={{ minWidth: 0 }}>
              <div style={styles.accountLabel}>Система активна</div>
              <div style={styles.accountEmail}>
                {session.user.email}
              </div>
            </div>
          </div>

          <button style={styles.logoutSidebar} onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>

      <main style={styles.content}>
        <header style={styles.topbar}>
          <button
            style={styles.mobileMenuButton}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            ☰
          </button>

          <div>
            <div style={styles.topbarTitle}>
              {menu.find((x) => x.id === page)?.label}
            </div>
            <div style={styles.topbarSub}>
              SORTEX WMS · финансовый учет услуг
            </div>
          </div>

          <div style={styles.topbarRight}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Онлайн
            </div>
          </div>
        </header>

        <div style={styles.pageArea}>
          {page === "dashboard" && <Home onNavigate={navigate} />}
          {page === "clients" && <Clients />}
          {page === "products" && <Products />}
          {page === "tariffs" && <Tariffs />}
          {page === "operations" && <Operations />}
          {page === "payable" && <Payable />}
          {page === "history" && <History />}
        </div>
      </main>
    </div>
  );
}

function Home({ onNavigate }) {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [from, to]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_client_totals", {
      p_from: from,
      p_to: to,
    });

    if (!error) {
      setData(data || []);
    }

    setLoading(false);
  }

  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => {
        acc.quantity += Number(row.shipment_quantity || 0);
        acc.shipments += Number(row.shipment_total_rub || 0);
        acc.storage += Number(row.storage_total_rub || 0);
        acc.total += Number(row.total_rub || 0);
        return acc;
      },
      { quantity: 0, shipments: 0, storage: 0, total: 0 }
    );
  }, [data]);

  return (
    <div>
      <div style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>ФИНАНСОВЫЙ КОНТРОЛЬ</div>
          <h1 style={styles.pageTitle}>Добро пожаловать в SORTEX</h1>
          <p style={styles.pageDescription}>
            Все начисления по клиентам — в одном месте.
          </p>
        </div>

        <div style={styles.periodBox}>
          <div style={styles.periodLabel}>ПЕРИОД</div>

          <div style={styles.periodInputs}>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={styles.dateInput}
            />
            <span>—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          title="Начислено"
          value={money(totals.total)}
          caption="за выбранный период"
          accent
        />

        <StatCard
          title="Услуги"
          value={money(totals.shipments)}
          caption={`${totals.quantity} единиц`}
        />

        <StatCard
          title="Хранение"
          value={money(totals.storage)}
          caption="услуги хранения"
        />

        <StatCard
          title="Клиенты"
          value={data.length}
          caption="активных клиентов"
        />
      </div>

      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Клиенты</h2>
          <p style={styles.sectionSubtitle}>
            Начисления за выбранный период
          </p>
        </div>

        <button
          style={styles.secondaryButton}
          onClick={() => onNavigate("operations")}
        >
          + Добавить операцию
        </button>
      </div>

      <div style={styles.panel}>
        {loading ? (
          <Loading />
        ) : data.length === 0 ? (
          <Empty
            title="Пока нет начислений"
            text="Когда появятся операции, здесь будет финансовая сводка."
          />
        ) : (
          <div style={styles.clientSummaryGrid}>
            {data.map((row) => (
              <div key={row.client_id} style={styles.summaryCard}>
                <div style={styles.summaryTop}>
                  <div style={styles.clientAvatar}>
                    {(row.client_name || "?").slice(0, 1).toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={styles.summaryName}>
                      {row.client_name}
                    </div>
                    <div style={styles.summaryMeta}>
                      {Number(row.shipment_quantity || 0)} ед. · услуги
                    </div>
                  </div>
                </div>

                <div style={styles.summaryAmount}>
                  {money(row.total_rub)}
                </div>

                <div style={styles.summaryDetails}>
                  <span>Услуги</span>
                  <b>{money(row.shipment_total_rub)}</b>
                </div>

                <div style={styles.summaryDetails}>
                  <span>Хранение</span>
                  <b>{money(row.storage_total_rub)}</b>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, caption, accent }) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(accent ? styles.statCardAccent : {}),
      }}
    >
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statCaption}>{caption}</div>
    </div>
  );
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [inn, setInn] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("name");

    setClients(data || []);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setName("");
    setLegalName("");
    setInn("");
    setContact("");
    setPhone("");
    setEmail("");
    setNotes("");
    setError("");
    setFormOpen(true);
  }

  function openEdit(client) {
    setEditing(client);
    setName(client.name || "");
    setLegalName(client.legal_name || "");
    setInn(client.inn || "");
    setContact(client.contact_name || "");
    setPhone(client.phone || "");
    setEmail(client.email || "");
    setNotes(client.notes || "");
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setError("");
  }

  async function save(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Введите название клиента.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      legal_name: legalName.trim() || null,
      inn: inn.trim() || null,
      contact_name: contact.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
    };

    const result = editing
      ? await supabase
          .from("clients")
          .update(payload)
          .eq("id", editing.id)
      : await supabase.from("clients").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    closeForm();
  }

  const filtered = clients.filter((client) => {
    const text = [
      client.name,
      client.legal_name,
      client.inn,
      client.contact_name,
      client.phone,
      client.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  if (formOpen) {
    return (
      <PageForm
        title={editing ? "Карточка клиента" : "Новый клиент"}
        subtitle={
          editing
            ? "Изменение данных клиента"
            : "Добавление нового клиента"
        }
        onBack={closeForm}
      >
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <Field
              label="Название *"
              value={name}
              onChange={setName}
              placeholder="Название компании"
            />

            <Field
              label="Юридическое название"
              value={legalName}
              onChange={setLegalName}
              placeholder="Юридическое лицо"
            />

            <Field
              label="ИНН"
              value={inn}
              onChange={setInn}
              placeholder="ИНН"
            />

            <Field
              label="Контактное лицо"
              value={contact}
              onChange={setContact}
              placeholder="Имя и фамилия"
            />

            <Field
              label="Телефон"
              value={phone}
              onChange={setPhone}
              placeholder="+..."
            />

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
            />
          </div>

          <Field
            label="Заметка"
            value={notes}
            onChange={setNotes}
            placeholder="Дополнительная информация"
            textarea
          />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={closeForm}
            >
              Отмена
            </button>

            <button
              type="submit"
              style={styles.primaryButtonSmall}
              disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </PageForm>
    );
  }

  return (
    <div>
      <PageHeader
        title="Клиенты"
        subtitle="Компании и контактные данные"
        button="+ Добавить клиента"
        onClick={openNew}
      />

      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск клиента..."
        />
      </div>

      <div style={styles.panel}>
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty
            title="Клиенты не найдены"
            text="Добавьте первого клиента или измените поиск."
          />
        ) : (
          <div style={styles.list}>
            {filtered.map((client) => (
              <div key={client.id} style={styles.listRow}>
                <div style={styles.clientIdentity}>
                  <div style={styles.clientAvatar}>
                    {(client.name || "?").slice(0, 1).toUpperCase()}
                  </div>

                  <div>
                    <div style={styles.rowTitle}>{client.name}</div>
                    <div style={styles.rowSubtitle}>
                      {client.contact_name || "Контактное лицо не указано"}
                    </div>
                  </div>
                </div>

                <div style={styles.rowInfo}>
                  <span>{client.phone || "—"}</span>
                  <span>{client.email || "—"}</span>
                </div>

                <button
                  style={styles.ghostButton}
                  onClick={() => openEdit(client)}
                >
                  Открыть
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [sizeType, setSizeType] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [productsResult, clientsResult] = await Promise.all([
      supabase
        .from("products")
        .select("*, clients(name)")
        .order("name"),
      supabase.from("clients").select("id,name").eq("is_active", true).order("name"),
    ]);

    setProducts(productsResult.data || []);
    setClients(clientsResult.data || []);
    setLoading(false);
  }

  function reset() {
    setEditing(null);
    setClientId("");
    setSku("");
    setName("");
    setSizeType("");
    setLength("");
    setWidth("");
    setHeight("");
    setWeight("");
    setNotes("");
    setError("");
  }

  function openNew() {
    reset();
    setFormOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setClientId(product.client_id || "");
    setSku(product.sku || "");
    setName(product.name || "");
    setSizeType(product.size_type || "");
    setLength(product.length_cm ?? "");
    setWidth(product.width_cm ?? "");
    setHeight(product.height_cm ?? "");
    setWeight(product.weight_kg ?? "");
    setNotes(product.notes || "");
    setError("");
    setFormOpen(true);
  }

  async function save(event) {
    event.preventDefault();

    if (!clientId || !sku.trim() || !name.trim()) {
      setError("Заполните клиента, SKU и название.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      client_id: clientId,
      sku: sku.trim(),
      name: name.trim(),
      size_type: sizeType || null,
      length_cm: length === "" ? null : Number(length),
      width_cm: width === "" ? null : Number(width),
      height_cm: height === "" ? null : Number(height),
      weight_kg: weight === "" ? null : Number(weight),
      notes: notes.trim() || null,
    };

    const result = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      setError(
        result.error.code === "23505"
          ? "Такой SKU уже существует у этого клиента."
          : result.error.message
      );
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    setFormOpen(false);
    reset();
  }

  const filtered = products.filter((p) => {
    const text = `${p.sku} ${p.name} ${p.clients?.name || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (formOpen) {
    return (
      <PageForm
        title={editing ? "Карточка SKU" : "Новая номенклатура"}
        subtitle="Справочник товаров без учета складских остатков"
        onBack={() => {
          setFormOpen(false);
          reset();
        }}
      >
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <SelectField
              label="Клиент *"
              value={clientId}
              onChange={setClientId}
              options={clients.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />

            <Field
              label="SKU *"
              value={sku}
              onChange={setSku}
              placeholder="Артикул"
            />

            <Field
              label="Название *"
              value={name}
              onChange={setName}
              placeholder="Название товара"
            />

            <SelectField
              label="Размерная категория"
              value={sizeType}
              onChange={setSizeType}
              options={[
                { value: "small", label: "Малый" },
                { value: "medium", label: "Средний" },
                { value: "large", label: "Большой" },
              ]}
            />

            <Field
              label="Длина, см"
              value={length}
              onChange={setLength}
              type="number"
            />

            <Field
              label="Ширина, см"
              value={width}
              onChange={setWidth}
              type="number"
            />

            <Field
              label="Высота, см"
              value={height}
              onChange={setHeight}
              type="number"
            />

            <Field
              label="Вес, кг"
              value={weight}
              onChange={setWeight}
              type="number"
            />
          </div>

          <Field
            label="Заметка"
            value={notes}
            onChange={setNotes}
            textarea
          />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                setFormOpen(false);
                reset();
              }}
            >
              Отмена
            </button>

            <button
              type="submit"
              style={styles.primaryButtonSmall}
              disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </PageForm>
    );
  }

  return (
    <div>
      <PageHeader
        title="Номенклатура"
        subtitle="SKU клиентов для привязки операций"
        button="+ Добавить SKU"
        onClick={openNew}
      />

      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по SKU, товару или клиенту..."
        />
      </div>

      <div style={styles.panel}>
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty
            title="Номенклатура пуста"
            text="Добавьте SKU клиента."
          />
        ) : (
          <div style={styles.list}>
            {filtered.map((product) => (
              <div key={product.id} style={styles.listRow}>
                <div style={styles.clientIdentity}>
                  <div style={styles.productIcon}>▦</div>
                  <div>
                    <div style={styles.rowTitle}>{product.name}</div>
                    <div style={styles.rowSubtitle}>
                      {product.sku} · {product.clients?.name || "—"}
                    </div>
                  </div>
                </div>

                <div style={styles.rowInfo}>
                  <span>
                    {product.size_type
                      ? tariffLabels[product.size_type]
                      : "Категория не задана"}
                  </span>
                </div>

                <button
                  style={styles.ghostButton}
                  onClick={() => openEdit(product)}
                >
                  Открыть
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [systemTariffs, setSystemTariffs] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);

  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("small");
  const [price, setPrice] = useState("");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [tariffResult, systemResult, clientResult, productResult] =
      await Promise.all([
        supabase
          .from("tariffs")
          .select("*, clients(name), products(name,sku)")
          .order("effective_from", { ascending: false }),
        supabase
          .from("system_tariffs")
          .select("*")
          .order("tariff_type"),
        supabase.from("clients").select("id,name").eq("is_active", true).order("name"),
        supabase.from("products").select("id,name,sku,client_id").eq("is_active", true).order("name"),
      ]);

    setTariffs(tariffResult.data || []);
    setSystemTariffs(systemResult.data || []);
    setClients(clientResult.data || []);
    setProducts(productResult.data || []);
  }

  async function save(event) {
    event.preventDefault();

    if (!clientId || !type || price === "" || !from) {
      setError("Заполните обязательные поля.");
      return;
    }

    if (type === "storage" && productId) {
      setError("Для хранения товар указывать нельзя.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      client_id: clientId,
      product_id: type === "storage" ? null : productId || null,
      tariff_type: type,
      price_rub: Number(price),
      effective_from: from,
      effective_to: to || null,
      notes: notes.trim() || null,
    };

    const { error } = await supabase.from("tariffs").insert(payload);

    if (error) {
      setError(
        error.code === "23P01"
          ? "Для этого тарифа уже существует пересекающийся период."
          : error.message
      );
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    setFormOpen(false);
    reset();
  }

  function reset() {
    setClientId("");
    setProductId("");
    setType("small");
    setPrice("");
    setFrom(today());
    setTo("");
    setNotes("");
    setError("");
  }

  function clientProducts() {
    return products.filter((p) => p.client_id === clientId);
  }

  return (
    <div>
      <PageHeader
        title="Тарифы"
        subtitle="Индивидуальные тарифы клиентов и системные значения"
        button="+ Новый тариф"
        onClick={() => {
          reset();
          setFormOpen(true);
        }}
      />

      {formOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Новый тариф</h2>
                <p style={styles.sectionSubtitle}>
                  Тариф будет применяться начиная с указанной даты.
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setFormOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={save}>
              <SelectField
                label="Клиент *"
                value={clientId}
                onChange={(value) => {
                  setClientId(value);
                  setProductId("");
                }}
                options={clients.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />

              <SelectField
                label="Тип тарифа *"
                value={type}
                onChange={setType}
                options={[
                  { value: "small", label: "Малый" },
                  { value: "medium", label: "Средний" },
                  { value: "large", label: "Большой" },
                  { value: "storage", label: "Хранение" },
                ]}
              />

              {type !== "storage" && (
                <SelectField
                  label="Товар — необязательно"
                  value={productId}
                  onChange={setProductId}
                  options={[
                    { value: "", label: "Тариф всего клиента" },
                    ...clientProducts().map((p) => ({
                      value: p.id,
                      label: `${p.sku} · ${p.name}`,
                    })),
                  ]}
                />
              )}

              <Field
                label="Цена, ₽ *"
                value={price}
                onChange={setPrice}
                type="number"
                placeholder="0.00"
              />

              <div style={styles.formGrid}>
                <Field
                  label="Действует с *"
                  value={from}
                  onChange={setFrom}
                  type="date"
                />

                <Field
                  label="Действует до"
                  value={to}
                  onChange={setTo}
                  type="date"
                />
              </div>

              <Field
                label="Заметка"
                value={notes}
                onChange={setNotes}
                textarea
              />

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setFormOpen(false)}
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  style={styles.primaryButtonSmall}
                  disabled={saving}
                >
                  {saving ? "Сохранение..." : "Создать тариф"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tariffGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Системные тарифы</h3>
              <p style={styles.sectionSubtitle}>
                Используются, если у клиента нет индивидуального тарифа.
              </p>
            </div>
          </div>

          <div style={styles.systemTariffGrid}>
            {systemTariffs.map((tariff) => (
              <div key={tariff.id} style={styles.systemTariff}>
                <div style={styles.systemTariffName}>
                  {tariffLabels[tariff.tariff_type]}
                </div>
                <div style={styles.systemTariffPrice}>
                  {money(tariff.price_rub)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Правило применения</h3>
              <p style={styles.sectionSubtitle}>
                Тариф товара имеет приоритет над тарифом клиента.
              </p>
            </div>
          </div>

          <div style={styles.ruleBox}>
            <div>01</div>
            <span>Тариф конкретного SKU</span>
          </div>

          <div style={styles.ruleBox}>
            <div>02</div>
            <span>Тариф клиента</span>
          </div>

          <div style={styles.ruleBox}>
            <div>03</div>
            <span>Системный тариф</span>
          </div>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h3 style={styles.panelTitle}>Тарифы клиентов</h3>
            <p style={styles.sectionSubtitle}>
              История тарифов сохраняется.
            </p>
          </div>
        </div>

        {tariffs.length === 0 ? (
          <Empty title="Тарифов пока нет" text="Создайте первый тариф." />
        ) : (
          <div style={styles.list}>
            {tariffs.map((tariff) => (
              <div key={tariff.id} style={styles.listRow}>
                <div>
                  <div style={styles.rowTitle}>
                    {tariff.clients?.name || "—"}
                  </div>
                  <div style={styles.rowSubtitle}>
                    {tariff.products
                      ? `${tariff.products.sku} · ${tariff.products.name}`
                      : "Весь клиент"}
                  </div>
                </div>

                <div style={styles.tariffTypeBadge}>
                  {tariffLabels[tariff.tariff_type]}
                </div>

                <div style={styles.tariffPrice}>
                  {money(tariff.price_rub)}
                </div>

                <div style={styles.rowDate}>
                  {formatDate(tariff.effective_from)}
                  {tariff.effective_to
                    ? ` — ${formatDate(tariff.effective_to)}`
                    : " — далее"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Operations() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [operations, setOperations] = useState([]);
  const [storage, setStorage] = useState([]);
  const [mode, setMode] = useState("operation");

  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [date, setDate] = useState(today());
  const [type, setType] = useState("small");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const [volume, setVolume] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());

  const [price, setPrice] = useState(null);
  const [storagePrice, setStoragePrice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (mode === "operation" && clientId && productId && date) {
      loadPrice();
    }
  }, [clientId, productId, type, date, mode]);

  useEffect(() => {
    if (mode === "storage" && clientId && startDate) {
      loadStoragePrice();
    }
  }, [clientId, startDate, mode]);

  async function load() {
    setLoading(true);

    const [clientsResult, productsResult, operationsResult, storageResult] =
      await Promise.all([
        supabase
          .from("clients")
          .select("id,name")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("products")
          .select("id,name,sku,client_id,size_type")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("shipments")
          .select("*, clients(name), products(name,sku)")
          .order("shipment_date", { ascending: false })
          .limit(10),
        supabase
          .from("storage_records")
          .select("*, clients(name)")
          .order("start_date", { ascending: false })
          .limit(10),
      ]);

    setClients(clientsResult.data || []);
    setProducts(productsResult.data || []);
    setOperations(operationsResult.data || []);
    setStorage(storageResult.data || []);
    setLoading(false);
  }

  async function loadPrice() {
    const { data } = await supabase.rpc("get_effective_shipment_tariff", {
      p_client_id: clientId,
      p_product_id: productId,
      p_tariff_type: type,
      p_date: date,
    });

    setPrice(data);
  }

  async function loadStoragePrice() {
    const { data } = await supabase.rpc("get_effective_storage_tariff", {
      p_client_id: clientId,
      p_date: startDate,
    });

    setStoragePrice(data);
  }

  const clientProducts = products.filter(
    (product) => product.client_id === clientId
  );

  const operationTotal =
    Number(quantity || 0) * Number(price || 0);

  const storageDays =
    startDate && endDate
      ? Math.max(
          0,
          Math.floor(
            (new Date(`${endDate}T00:00:00`) -
              new Date(`${startDate}T00:00:00`)) /
              86400000
          ) + 1
        )
      : 0;

  const storageTotal =
    Number(volume || 0) *
    storageDays *
    Number(storagePrice || 0);

  async function saveOperation(event) {
    event.preventDefault();

    if (!clientId || !productId || !date || !quantity || !price) {
      setError("Заполните клиента, SKU, дату и количество.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("shipments").insert({
      client_id: clientId,
      product_id: productId,
      shipment_date: date,
      quantity: Number(quantity),
      tariff_type: type,
      unit_price_rub: Number(price),
      total_rub: Number(operationTotal.toFixed(2)),
      note: note.trim() || null,
      created_by: (await supabase.auth.getUser()).data.user?.id || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess("Операция успешно добавлена.");
    setQuantity(1);
    setNote("");
    await load();
    setSaving(false);
  }

  async function saveStorage(event) {
    event.preventDefault();

    if (
      !clientId ||
      !volume ||
      !startDate ||
      !endDate ||
      !storagePrice ||
      storageDays <= 0
    ) {
      setError("Заполните клиента, объем и период хранения.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("storage_records").insert({
      client_id: clientId,
      volume_m3: Number(volume),
      start_date: startDate,
      end_date: endDate,
      tariff_type: "storage",
      price_per_m3_day_rub: Number(storagePrice),
      total_rub: Number(storageTotal.toFixed(2)),
      status: "planned",
      note: note.trim() || null,
      created_by: (await supabase.auth.getUser()).data.user?.id || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess("Хранение успешно добавлено.");
    setVolume("");
    setNote("");
    await load();
    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title="Операции"
        subtitle="Фиксация выполненных услуг и хранения"
      />

      <div style={styles.operationSwitch}>
        <button
          style={{
            ...styles.switchButton,
            ...(mode === "operation" ? styles.switchActive : {}),
          }}
          onClick={() => {
            setMode("operation");
            setError("");
            setSuccess("");
          }}
        >
          Услуга
        </button>

        <button
          style={{
            ...styles.switchButton,
            ...(mode === "storage" ? styles.switchActive : {}),
          }}
          onClick={() => {
            setMode("storage");
            setError("");
            setSuccess("");
          }}
        >
          Хранение
        </button>
      </div>

      <div style={styles.operationLayout}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                {mode === "operation"
                  ? "Новая операция"
                  : "Новое хранение"}
              </h3>
              <p style={styles.sectionSubtitle}>
                Тариф фиксируется непосредственно в операции.
              </p>
            </div>
          </div>

          {mode === "operation" ? (
            <form onSubmit={saveOperation}>
              <SelectField
                label="Клиент *"
                value={clientId}
                onChange={(value) => {
                  setClientId(value);
                  setProductId("");
                  setPrice(null);
                }}
                options={clients.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />

              <SelectField
                label="SKU *"
                value={productId}
                onChange={setProductId}
                options={clientProducts.map((p) => ({
                  value: p.id,
                  label: `${p.sku} · ${p.name}`,
                }))}
              />

              <div style={styles.formGrid}>
                <Field
                  label="Дата *"
                  value={date}
                  onChange={setDate}
                  type="date"
                />

                <SelectField
                  label="Размер *"
                  value={type}
                  onChange={setType}
                  options={[
                    { value: "small", label: "Малый" },
                    { value: "medium", label: "Средний" },
                    { value: "large", label: "Большой" },
                  ]}
                />

                <Field
                  label="Количество *"
                  value={quantity}
                  onChange={setQuantity}
                  type="number"
                  min="1"
                />
              </div>

              <div style={styles.pricePreview}>
                <div>
                  <span style={styles.priceLabel}>Тариф</span>
                  <strong>
                    {price !== null ? money(price) : "—"}
                  </strong>
                </div>

                <div>
                  <span style={styles.priceLabel}>Итого</span>
                  <strong style={styles.totalPrice}>
                    {money(operationTotal)}
                  </strong>
                </div>
              </div>

              <Field
                label="Комментарий"
                value={note}
                onChange={setNote}
                textarea
                placeholder="Комментарий к операции"
              />

              {error && <div style={styles.error}>{error}</div>}
              {success && <div style={styles.success}>{success}</div>}

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Сохранение..." : "Добавить операцию"}
              </button>
            </form>
          ) : (
            <form onSubmit={saveStorage}>
              <SelectField
                label="Клиент *"
                value={clientId}
                onChange={setClientId}
                options={clients.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />

              <Field
                label="Объем, м³ *"
                value={volume}
                onChange={setVolume}
                type="number"
                placeholder="0.0000"
              />

              <div style={styles.formGrid}>
                <Field
                  label="Дата начала *"
                  value={startDate}
                  onChange={setStartDate}
                  type="date"
                />

                <Field
                  label="Дата окончания *"
                  value={endDate}
                  onChange={setEndDate}
                  type="date"
                />
              </div>

              <div style={styles.pricePreview}>
                <div>
                  <span style={styles.priceLabel}>Тариф</span>
                  <strong>
                    {storagePrice !== null
                      ? `${money(storagePrice)} / м³ / день`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span style={styles.priceLabel}>Дней</span>
                  <strong>{storageDays}</strong>
                </div>

                <div>
                  <span style={styles.priceLabel}>Итого</span>
                  <strong style={styles.totalPrice}>
                    {money(storageTotal)}
                  </strong>
                </div>
              </div>

              <Field
                label="Комментарий"
                value={note}
                onChange={setNote}
                textarea
              />

              {error && <div style={styles.error}>{error}</div>}
              {success && <div style={styles.success}>{success}</div>}

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Сохранение..." : "Добавить хранение"}
              </button>
            </form>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Последние операции</h3>
              <p style={styles.sectionSubtitle}>
                Новые записи появляются автоматически.
              </p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : operations.length === 0 && storage.length === 0 ? (
            <Empty
              title="Операций пока нет"
              text="Первая операция появится здесь."
            />
          ) : (
            <div style={styles.list}>
              {operations.map((operation) => (
                <div key={operation.id} style={styles.compactRow}>
                  <div style={styles.operationIcon}>₽</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.rowTitle}>
                      {operation.clients?.name}
                    </div>

                    <div style={styles.rowSubtitle}>
                      {operation.products?.sku} ·{" "}
                      {tariffLabels[operation.tariff_type]} ·{" "}
                      {formatDate(operation.shipment_date)}
                    </div>
                  </div>

                  <strong>{money(operation.total_rub)}</strong>
                </div>
              ))}

              {storage.map((record) => (
                <div key={record.id} style={styles.compactRow}>
                  <div style={styles.storageIcon}>◇</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.rowTitle}>
                      {record.clients?.name}
                    </div>

                    <div style={styles.rowSubtitle}>
                      Хранение · {record.volume_m3} м³ ·{" "}
                      {formatDate(record.start_date)}
                    </div>
                  </div>

                  <strong>{money(record.total_rub)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Payable() {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const [shipments, setShipments] = useState([]);
  const [storage, setStorage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [from, to]);

  async function load() {
    setLoading(true);

    const [shipmentsResult, storageResult] = await Promise.all([
      supabase
        .from("shipments")
        .select("*, clients(name), products(name,sku)")
        .eq("status", "active")
        .gte("shipment_date", from)
        .lte("shipment_date", to)
        .order("shipment_date", { ascending: false }),

      supabase
        .from("storage_records")
        .select("*, clients(name)")
        .neq("status", "cancelled")
        .lte("start_date", to)
        .gte("end_date", from)
        .order("start_date", { ascending: false }),
    ]);

    setShipments(shipmentsResult.data || []);
    setStorage(storageResult.data || []);
    setLoading(false);
  }

  const total =
    shipments.reduce((sum, item) => sum + Number(item.total_rub || 0), 0) +
    storage.reduce((sum, item) => {
      const start = new Date(
        `${item.start_date}T00:00:00`
      );
      const end = new Date(`${item.end_date}T00:00:00`);
      const rangeStart = new Date(`${from}T00:00:00`);
      const rangeEnd = new Date(`${to}T00:00:00`);

      const actualStart = start > rangeStart ? start : rangeStart;
      const actualEnd = end < rangeEnd ? end : rangeEnd;

      const days = Math.max(
        0,
        Math.floor((actualEnd - actualStart) / 86400000) + 1
      );

      return (
        sum +
        Number(item.volume_m3 || 0) *
          days *
          Number(item.price_per_m3_day_rub || 0)
      );
    }, 0);

  return (
    <div>
      <PageHeader
        title="К оплате"
        subtitle="Активные начисления за выбранный период"
      />

      <div style={styles.periodToolbar}>
        <div>
          <div style={styles.periodLabel}>ПЕРИОД</div>
          <div style={styles.periodInputs}>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={styles.dateInput}
            />
            <span>—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </div>

        <div style={styles.payableTotal}>
          <span>К оплате</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      <div style={styles.panel}>
        {loading ? (
          <Loading />
        ) : shipments.length === 0 && storage.length === 0 ? (
          <Empty
            title="Начислений нет"
            text="За выбранный период активных начислений нет."
          />
        ) : (
          <div style={styles.list}>
            {shipments.map((item) => (
              <div key={item.id} style={styles.listRow}>
                <div style={styles.operationIcon}>₽</div>

                <div style={{ flex: 1 }}>
                  <div style={styles.rowTitle}>
                    {item.clients?.name}
                  </div>

                  <div style={styles.rowSubtitle}>
                    {item.products?.sku} ·{" "}
                    {tariffLabels[item.tariff_type]} ·{" "}
                    {item.quantity} ед. ·{" "}
                    {formatDate(item.shipment_date)}
                  </div>
                </div>

                <div style={styles.payableItemAmount}>
                  {money(item.total_rub)}
                </div>

                <div style={styles.statusBadgeWarm}>
                  Не выставлено
                </div>
              </div>
            ))}

            {storage.map((item) => (
              <div key={item.id} style={styles.listRow}>
                <div style={styles.storageIcon}>◇</div>

                <div style={{ flex: 1 }}>
                  <div style={styles.rowTitle}>
                    {item.clients?.name}
                  </div>

                  <div style={styles.rowSubtitle}>
                    Хранение · {item.volume_m3} м³ ·{" "}
                    {formatDate(item.start_date)} —{" "}
                    {formatDate(item.end_date)}
                  </div>
                </div>

                <div style={styles.payableItemAmount}>
                  {money(item.total_rub)}
                </div>

                <div style={styles.statusBadgeWarm}>
                  Не выставлено
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function History() {
  const [shipments, setShipments] = useState([]);
  const [storage, setStorage] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [shipmentsResult, storageResult] = await Promise.all([
      supabase
        .from("shipments")
        .select("*, clients(name), products(name,sku)")
        .order("created_at", { ascending: false })
        .limit(100),

      supabase
        .from("storage_records")
        .select("*, clients(name)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    setShipments(shipmentsResult.data || []);
    setStorage(storageResult.data || []);
    setLoading(false);
  }

  async function cancelShipment(id) {
    if (!window.confirm("Отменить эту операцию?")) return;

    const { error } = await supabase.rpc("cancel_shipment", {
      p_id: id,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Операция отменена.");
    await load();
  }

  async function cancelStorage(id) {
    if (!window.confirm("Отменить запись хранения?")) return;

    const { error } = await supabase.rpc("cancel_storage", {
      p_id: id,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Хранение отменено.");
    await load();
  }

  const rows = [
    ...(filter !== "storage"
      ? shipments.map((x) => ({
          ...x,
          recordType: "shipment",
          date: x.shipment_date,
          title: x.clients?.name,
          subtitle: `${x.products?.sku || "—"} · ${
            tariffLabels[x.tariff_type]
          } · ${x.quantity} ед.`,
          amount: x.total_rub,
          status: x.status,
        }))
      : []),

    ...(filter !== "operations"
      ? storage.map((x) => ({
          ...x,
          recordType: "storage",
          date: x.start_date,
          title: x.clients?.name,
          subtitle: `Хранение · ${x.volume_m3} м³ · ${formatDate(
            x.start_date
          )} — ${formatDate(x.end_date)}`,
          amount: x.total_rub,
          status: x.status,
        }))
      : []),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <div>
      <PageHeader
        title="История"
        subtitle="Все операции сохраняются в базе и не удаляются физически"
      />

      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <button
            style={{
              ...styles.filterButton,
              ...(filter === "all" ? styles.filterActive : {}),
            }}
            onClick={() => setFilter("all")}
          >
            Все
          </button>

          <button
            style={{
              ...styles.filterButton,
              ...(filter === "operations" ? styles.filterActive : {}),
            }}
            onClick={() => setFilter("operations")}
          >
            Услуги
          </button>

          <button
            style={{
              ...styles.filterButton,
              ...(filter === "storage" ? styles.filterActive : {}),
            }}
            onClick={() => setFilter("storage")}
          >
            Хранение
          </button>
        </div>
      </div>

      {message && <div style={styles.success}>{message}</div>}

      <div style={styles.panel}>
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty
            title="История пуста"
            text="После первой операции она появится здесь."
          />
        ) : (
          <div style={styles.list}>
            {rows.map((row) => (
              <div key={row.id} style={styles.listRow}>
                <div
                  style={
                    row.recordType === "storage"
                      ? styles.storageIcon
                      : styles.operationIcon
                  }
                >
                  {row.recordType === "storage" ? "◇" : "₽"}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.rowTitle}>{row.title}</div>
                  <div style={styles.rowSubtitle}>
                    {row.subtitle}
                  </div>
                </div>

                <div>
                  <div style={styles.payableItemAmount}>
                    {money(row.amount)}
                  </div>
                  <div style={styles.rowDate}>
                    {formatDate(row.date)}
                  </div>
                </div>

                <Status status={row.status} />

                {row.status !== "cancelled" && (
                  <button
                    style={styles.cancelButton}
                    onClick={() =>
                      row.recordType === "storage"
                        ? cancelStorage(row.id)
                        : cancelShipment(row.id)
                    }
                  >
                    Отменить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Status({ status }) {
  if (status === "cancelled") {
    return <div style={styles.statusCancelled}>Отменено</div>;
  }

  if (status === "planned") {
    return <div style={styles.statusPlanned}>Запланировано</div>;
  }

  return <div style={styles.statusActive}>Активно</div>;
}

function PageHeader({ title, subtitle, button, onClick }) {
  return (
    <div style={styles.pageHeader}>
      <div>
        <h1 style={styles.pageTitle}>{title}</h1>
        <p style={styles.pageDescription}>{subtitle}</p>
      </div>

      {button && (
        <button style={styles.primaryButtonSmall} onClick={onClick}>
          {button}
        </button>
      )}
    </div>
  );
}

function PageForm({ title, subtitle, onBack, children }) {
  return (
    <div>
      <button style={styles.backButton} onClick={onBack}>
        ← Назад
      </button>

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>{title}</h1>
          <p style={styles.pageDescription}>{subtitle}</p>
        </div>
      </div>

      <div style={styles.panelForm}>{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  min,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>

      {textarea ? (
        <textarea
          style={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          style={styles.input}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
        />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>

      <select
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Выберите...</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Loading() {
  return <div style={styles.loadingBox}>Загрузка...</div>;
}

function Empty({ title, text }) {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>S</div>
      <div style={styles.emptyTitle}>{title}</div>
      <div style={styles.emptyText}>{text}</div>
    </div>
  );
}

const styles = {
  loadingScreen: {
    minHeight: "100vh",
    background: GRAPHITE,
    color: CHAMPAGNE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: 28,
    letterSpacing: 6,
  },

  loginPage: {
    minHeight: "100vh",
    background: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },

  loginCard: {
    width: "100%",
    maxWidth: 430,
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: 24,
    padding: 38,
    boxSizing: "border-box",
    boxShadow: "0 20px 60px rgba(36,35,33,0.10)",
    textAlign: "center",
  },

  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: GRAPHITE,
    color: CHAMPAGNE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
    fontSize: 28,
    fontWeight: 700,
    boxShadow: `0 8px 24px rgba(200,181,138,0.22)`,
  },

  brandLarge: {
    fontSize: 29,
    fontWeight: 800,
    letterSpacing: 5,
    color: GRAPHITE,
  },

  brandSubtitle: {
    fontSize: 9,
    letterSpacing: 3,
    color: MUTED,
    marginTop: 5,
  },

  loginTitle: {
    margin: 0,
    color: TEXT,
    fontSize: 24,
  },

  loginText: {
    color: MUTED,
    marginTop: 8,
    marginBottom: 28,
  },

  shell: {
    minHeight: "100vh",
    background: CREAM,
    display: "flex",
    fontFamily: "Arial, sans-serif",
    color: TEXT,
  },

  sidebar: {
    width: 250,
    flexShrink: 0,
    background: GRAPHITE,
    color: "#fff",
    minHeight: "100vh",
    padding: "26px 16px 18px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    zIndex: 20,
  },

  sidebarMobileOpen: {
    transform: "translateX(0)",
  },

  sidebarBrand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "4px 10px 28px",
  },

  sidebarLogo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: CHAMPAGNE,
    color: GRAPHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 21,
    fontWeight: 800,
  },

  sidebarTitle: {
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: 3,
  },

  sidebarSub: {
    color: CHAMPAGNE,
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 2,
  },

  menuCaption: {
    fontSize: 9,
    letterSpacing: 1.8,
    color: "#9D9A94",
    padding: "0 12px 10px",
  },

  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "12px 13px",
    border: "none",
    borderRadius: 11,
    background: "transparent",
    color: "#C9C6BF",
    textAlign: "left",
    fontSize: 14,
    cursor: "pointer",
    marginBottom: 3,
  },

  menuItemActive: {
    background: "rgba(200,181,138,0.13)",
    color: "#FFFDF9",
    boxShadow: `inset 3px 0 0 ${CHAMPAGNE}`,
  },

  menuIcon: {
    width: 20,
    color: CHAMPAGNE,
    fontSize: 18,
    textAlign: "center",
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  accountBox: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    marginBottom: 10,
  },

  accountDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#9C9",
    boxShadow: "0 0 8px rgba(150,200,150,0.5)",
  },

  accountLabel: {
    fontSize: 11,
    color: "#E4E0D7",
  },

  accountEmail: {
    fontSize: 9,
    color: "#88857F",
    marginTop: 3,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  logoutSidebar: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#A7A39C",
    borderRadius: 10,
    padding: 10,
    cursor: "pointer",
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  topbar: {
    minHeight: 76,
    background: "rgba(255,253,249,0.96)",
    borderBottom: `1px solid ${BORDER}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  topbarTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: GRAPHITE,
  },

  topbarSub: {
    fontSize: 11,
    color: MUTED,
    marginTop: 3,
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
  },

  statusBadge: {
    background: "#F0F1EB",
    color: "#62665B",
    borderRadius: 20,
    padding: "7px 11px",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    gap: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#7E9975",
  },

  mobileMenuButton: {
    display: "none",
    border: "none",
    background: "transparent",
    fontSize: 24,
    color: GRAPHITE,
  },

  pageArea: {
    maxWidth: 1450,
    margin: "0 auto",
    padding: "34px",
    boxSizing: "border-box",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 20,
    marginBottom: 28,
    flexWrap: "wrap",
  },

  pageTitle: {
    margin: 0,
    fontSize: 30,
    color: GRAPHITE,
    letterSpacing: -0.5,
  },

  pageDescription: {
    margin: "7px 0 0",
    color: MUTED,
    fontSize: 14,
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.2,
    color: CHAMPAGNE,
    fontWeight: 800,
    marginBottom: 10,
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 24,
    marginBottom: 30,
    flexWrap: "wrap",
  },

  periodBox: {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: 15,
    padding: 14,
  },

  periodLabel: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1.5,
    fontWeight: 700,
    marginBottom: 8,
  },

  periodInputs: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: MUTED,
  },

  dateInput: {
    border: `1px solid ${BORDER}`,
    background: CREAM,
    borderRadius: 8,
    padding: "9px 10px",
    color: TEXT,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 38,
  },

  statCard: {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: 17,
    padding: 22,
    minHeight: 135,
    boxSizing: "border-box",
  },

  statCardAccent: {
    background: GRAPHITE,
    color: "#fff",
    borderColor: GRAPHITE,
    boxShadow: "0 10px 30px rgba(36,35,33,0.14)",
  },

  statTitle: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 15,
  },

  statValue: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: -0.5,
  },

  statCaption: {
    fontSize: 11,
    color: MUTED,
    marginTop: 8,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 20,
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: MUTED,
    fontSize: 12,
  },

  panel: {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: 18,
    padding: 22,
    marginBottom: 22,
    boxSizing: "border-box",
  },

  panelForm: {
    maxWidth: 900,
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: 18,
    padding: 28,
    boxSizing: "border-box",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },

  panelTitle: {
    margin: 0,
    fontSize: 17,
  },

  clientSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 15,
  },

  summaryCard: {
    border: `1px solid ${BORDER}`,
    borderRadius: 15,
    padding: 18,
    background: "#FFFEFB",
  },

  summaryTop: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: CHAMPAGNE_LIGHT,
    color: GRAPHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },

  summaryName: {
    fontWeight: 700,
    fontSize: 14,
  },

  summaryMeta: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  summaryAmount: {
    fontSize: 23,
    fontWeight: 800,
    margin: "22px 0 14px",
  },

  summaryDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: MUTED,
    paddingTop: 8,
    borderTop: `1px solid #EEEAE1`,
    marginTop: 8,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  searchInput: {
    width: "100%",
    maxWidth: 520,
    padding: "13px 15px",
    border: `1px solid ${BORDER}`,
    borderRadius: 11,
    background: WHITE,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  list: {
    display: "flex",
    flexDirection: "column",
  },

  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    padding: "15px 4px",
    borderBottom: `1px solid #EEEAE1`,
    minWidth: 0,
  },

  clientIdentity: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 220,
  },

  rowTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: TEXT,
  },

  rowSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
  },

  rowInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: MUTED,
    fontSize: 11,
    minWidth: 170,
  },

  rowDate: {
    color: MUTED,
    fontSize: 10,
    whiteSpace: "nowrap",
  },

  ghostButton: {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    padding: "8px 13px",
    borderRadius: 9,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  primaryButton: {
    width: "100%",
    border: "none",
    background: GRAPHITE,
    color: WHITE,
    borderRadius: 11,
    padding: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(36,35,33,0.12)",
  },

  primaryButtonSmall: {
    border: "none",
    background: GRAPHITE,
    color: WHITE,
    borderRadius: 10,
    padding: "11px 17px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    borderRadius: 10,
    padding: "10px 15px",
    fontSize: 13,
    cursor: "pointer",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: MUTED,
    padding: 0,
    marginBottom: 20,
    cursor: "pointer",
    fontSize: 13,
  },

  label: {
    display: "block",
    color: TEXT,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 7,
  },

  field: {
    marginBottom: 17,
  },

  input: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    background: "#FFFEFB",
    color: TEXT,
    borderRadius: 9,
    padding: "12px 13px",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    background: "#FFFEFB",
    color: TEXT,
    borderRadius: 9,
    padding: "12px 13px",
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0 16px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },

  error: {
    background: "#F8E8E4",
    color: "#8B4337",
    border: "1px solid #EAC8C0",
    padding: 11,
    borderRadius: 9,
    marginBottom: 14,
    fontSize: 12,
  },

  success: {
    background: "#EEF3E9",
    color: "#5F7254",
    border: "1px solid #D8E3D0",
    padding: 11,
    borderRadius: 9,
    marginBottom: 14,
    fontSize: 12,
  },

  empty: {
    padding: "55px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: CHAMPAGNE_LIGHT,
    color: GRAPHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 13px",
    fontWeight: 800,
  },

  emptyTitle: {
    fontWeight: 700,
    fontSize: 15,
  },

  emptyText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 6,
  },

  loadingBox: {
    padding: 45,
    textAlign: "center",
    color: MUTED,
    fontSize: 13,
  },

  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: CHAMPAGNE_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: GRAPHITE,
    fontSize: 18,
    flexShrink: 0,
  },

  tariffGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: 18,
  },

  systemTariffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 10,
  },

  systemTariff: {
    background: CREAM,
    borderRadius: 12,
    padding: 15,
  },

  systemTariffName: {
    color: MUTED,
    fontSize: 11,
  },

  systemTariffPrice: {
    fontSize: 17,
    fontWeight: 800,
    marginTop: 8,
  },

  ruleBox: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "11px 0",
    borderBottom: `1px solid #EEEAE1`,
    fontSize: 12,
  },

  ruleBox: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "11px 0",
    borderBottom: `1px solid #EEEAE1`,
    fontSize: 12,
  },

  tariffTypeBadge: {
    background: CHAMPAGNE_LIGHT,
    color: GRAPHITE,
    padding: "6px 9px",
    borderRadius: 20,
    fontSize: 10,
    whiteSpace: "nowrap",
  },

  tariffPrice: {
    fontWeight: 800,
    minWidth: 100,
    textAlign: "right",
  },

  operationLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 20,
  },

  operationSwitch: {
    display: "inline-flex",
    background: "#EAE6DD",
    padding: 4,
    borderRadius: 10,
    marginBottom: 18,
  },

  switchButton: {
    border: "none",
    background: "transparent",
    borderRadius: 7,
    padding: "9px 15px",
    color: MUTED,
    cursor: "pointer",
    fontSize: 12,
  },

  switchActive: {
    background: WHITE,
    color: GRAPHITE,
    boxShadow: "0 2px 8px rgba(36,35,33,0.08)",
    fontWeight: 700,
  },

  pricePreview: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    background: GRAPHITE,
    color: WHITE,
    borderRadius: 13,
    padding: 17,
    marginBottom: 18,
  },

  priceLabel: {
    display: "block",
    color: "#AAA69D",
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },

  totalPrice: {
    color: CHAMPAGNE,
    fontSize: 19,
  },

  operationIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: CHAMPAGNE_LIGHT,
    color: GRAPHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },

  storageIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: "#ECE9E2",
    color: GRAPHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },

  compactRow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "12px 0",
    borderBottom: `1px solid #EEEAE1`,
  },

  periodToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    padding: 18,
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  payableTotal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 5,
  },

  payableTotal: {
    color: MUTED,
    fontSize: 11,
  },

  payableItemAmount: {
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusBadgeWarm: {
    background: "#F5EBDD",
    color: "#8A6B38",
    padding: "6px 9px",
    borderRadius: 20,
    fontSize: 10,
    whiteSpace: "nowrap",
  },

  statusActive: {
    background: "#EDF2E9",
    color: "#607456",
    padding: "6px 9px",
    borderRadius: 20,
    fontSize: 10,
    whiteSpace: "nowrap",
  },

  statusPlanned: {
    background: "#F5EBDD",
    color: "#8A6B38",
    padding: "6px 9px",
    borderRadius: 20,
    fontSize: 10,
    whiteSpace: "nowrap",
  },

  statusCancelled: {
    background: "#F5E7E4",
    color: "#8B5148",
    padding: "6px 9px",
    borderRadius: 20,
    fontSize: 10,
    whiteSpace: "nowrap",
  },

  cancelButton: {
    border: "none",
    background: "transparent",
    color: "#9A6D64",
    cursor: "pointer",
    fontSize: 11,
    whiteSpace: "nowrap",
  },

  filterGroup: {
    display: "flex",
    gap: 5,
    background: "#EAE6DD",
    borderRadius: 10,
    padding: 4,
  },

  filterButton: {
    border: "none",
    background: "transparent",
    color: MUTED,
    padding: "8px 13px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 12,
  },

  filterActive: {
    background: WHITE,
    color: GRAPHITE,
    fontWeight: 700,
    boxShadow: "0 2px 7px rgba(36,35,33,0.07)",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(36,35,33,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 100,
  },

  modal: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "90vh",
    overflowY: "auto",
    background: WHITE,
    borderRadius: 20,
    padding: 26,
    boxSizing: "border-box",
    boxShadow: "0 25px 80px rgba(36,35,33,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 22,
  },

  modalTitle: {
    margin: 0,
    fontSize: 21,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    border: `1px solid ${BORDER}`,
    background: CREAM,
    color: MUTED,
    fontSize: 21,
    cursor: "pointer",
  },
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
