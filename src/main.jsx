import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

import "./styles.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const money = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const dateRu = (value) => {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}.${m}.${y}`;
};

const today = () => new Date().toISOString().slice(0, 10);

const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const tariffLabels = {
  small: "Малый",
  medium: "Средний",
  large: "Большой",
  storage: "Хранение",
};

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [page, setPage] = useState("home");
  const [mobileMore, setMobileMore] = useState(false);

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [systemTariffs, setSystemTariffs] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [storageRecords, setStorageRecords] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [loadingData, setLoadingData] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState("");

  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showTariffForm, setShowTariffForm] = useState(false);

  const [showOperationForm, setShowOperationForm] = useState(false);

  const [clientForm, setClientForm] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    legal_name: "",
    inn: "",
    notes: "",
  });

  const [productForm, setProductForm] = useState({
    client_id: "",
    sku: "",
    name: "",
    size_type: "medium",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    weight_kg: "",
    notes: "",
  });

  const [tariffForm, setTariffForm] = useState({
    client_id: "",
    product_id: "",
    tariff_type: "small",
    price_rub: "",
    effective_from: today(),
    notes: "",
  });

  const [operationForm, setOperationForm] = useState({
    client_id: "",
    product_id: "",
    shipment_date: today(),
    quantity: 1,
    tariff_type: "small",
    note: "",
    operation_type: "shipment",
  });

  const [periodFrom, setPeriodFrom] = useState(monthStart());
  const [periodTo, setPeriodTo] = useState(today());

  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadAll();
  }, [session]);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  async function loadAll() {
    setLoadingData(true);

    const [
      clientsRes,
      productsRes,
      tariffsRes,
      systemTariffsRes,
      shipmentsRes,
      storageRes,
      auditRes,
    ] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase
        .from("products")
        .select("*, clients(name)")
        .order("name"),
      supabase
        .from("tariffs")
        .select("*, clients(name), products(name, sku)")
        .order("effective_from", { ascending: false }),
      supabase.from("system_tariffs").select("*").order("tariff_type"),
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
        .limit(100),
    ]);

    if (!clientsRes.error) setClients(clientsRes.data || []);
    if (!productsRes.error) setProducts(productsRes.data || []);
    if (!tariffsRes.error) setTariffs(tariffsRes.data || []);
    if (!systemTariffsRes.error)
      setSystemTariffs(systemTariffsRes.data || []);
    if (!shipmentsRes.error) setShipments(shipmentsRes.data || []);
    if (!storageRes.error) setStorageRecords(storageRes.data || []);
    if (!auditRes.error) setAuditLog(auditRes.data || []);

    setLoadingData(false);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setMobileMore(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openNewClient() {
    setEditingClient(null);
    setClientForm({
      name: "",
      contact_name: "",
      phone: "",
      email: "",
      legal_name: "",
      inn: "",
      notes: "",
    });
    setShowClientForm(true);
  }

  function openEditClient(client) {
    setEditingClient(client);
    setClientForm({
      name: client.name || "",
      contact_name: client.contact_name || "",
      phone: client.phone || "",
      email: client.email || "",
      legal_name: client.legal_name || "",
      inn: client.inn || "",
      notes: client.notes || "",
    });
    setShowClientForm(true);
  }

  async function saveClient() {
    if (!clientForm.name.trim()) {
      showNotice("Укажите название клиента");
      return;
    }

    let result;

    if (editingClient) {
      result = await supabase
        .from("clients")
        .update(clientForm)
        .eq("id", editingClient.id);
    } else {
      result = await supabase.from("clients").insert(clientForm);
    }

    if (result.error) {
      showNotice(result.error.message);
      return;
    }

    setShowClientForm(false);
    setSelectedClient(null);
    await loadAll();
    showNotice(editingClient ? "Клиент сохранён" : "Клиент добавлен");
  }

  function openNewProduct() {
    setEditingProduct(null);
    setProductForm({
      client_id: clients[0]?.id || "",
      sku: "",
      name: "",
      size_type: "medium",
      length_cm: "",
      width_cm: "",
      height_cm: "",
      weight_kg: "",
      notes: "",
    });
    setShowProductForm(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      client_id: product.client_id || "",
      sku: product.sku || "",
      name: product.name || "",
      size_type: product.size_type || "medium",
      length_cm: product.length_cm || "",
      width_cm: product.width_cm || "",
      height_cm: product.height_cm || "",
      weight_kg: product.weight_kg || "",
      notes: product.notes || "",
    });
    setShowProductForm(true);
  }

  async function saveProduct() {
    if (!productForm.client_id || !productForm.sku || !productForm.name) {
      showNotice("Заполните клиента, SKU и название");
      return;
    }

    const payload = {
      ...productForm,
      length_cm: productForm.length_cm
        ? Number(productForm.length_cm)
        : null,
      width_cm: productForm.width_cm
        ? Number(productForm.width_cm)
        : null,
      height_cm: productForm.height_cm
        ? Number(productForm.height_cm)
        : null,
      weight_kg: productForm.weight_kg
        ? Number(productForm.weight_kg)
        : null,
    };

    let result;

    if (editingProduct) {
      result = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
    } else {
      result = await supabase.from("products").insert(payload);
    }

    if (result.error) {
      showNotice(result.error.message);
      return;
    }

    setShowProductForm(false);
    await loadAll();
    showNotice(editingProduct ? "Номенклатура сохранена" : "Номенклатура добавлена");
  }

  async function saveTariff() {
    if (!tariffForm.client_id || !tariffForm.price_rub) {
      showNotice("Заполните клиента и стоимость");
      return;
    }

    if (
      tariffForm.tariff_type !== "storage" &&
      !tariffForm.product_id &&
      tariffForm.product_id !== ""
    ) {
      // client-level tariff is allowed
    }

    const payload = {
      client_id: tariffForm.client_id,
      product_id:
        tariffForm.tariff_type === "storage"
          ? null
          : tariffForm.product_id || null,
      tariff_type: tariffForm.tariff_type,
      price_rub: Number(tariffForm.price_rub),
      effective_from: tariffForm.effective_from,
      notes: tariffForm.notes || null,
    };

    const result = await supabase.from("tariffs").insert(payload);

    if (result.error) {
      showNotice(result.error.message);
      return;
    }

    setShowTariffForm(false);
    await loadAll();
    showNotice("Тариф добавлен");
  }

  async function addOperation() {
    if (!operationForm.client_id) {
      showNotice("Выберите клиента");
      return;
    }

    if (
      operationForm.operation_type === "shipment" &&
      Number(operationForm.quantity) <= 0
    ) {
      showNotice("Количество должно быть больше 0");
      return;
    }

    if (operationForm.operation_type === "shipment") {
      const tariff = await getEffectiveShipmentTariff(
        operationForm.client_id,
        operationForm.product_id || null,
        operationForm.tariff_type,
        operationForm.shipment_date
      );

      if (tariff === null) {
        showNotice("Не найден тариф для операции");
        return;
      }

      const payload = {
        client_id: operationForm.client_id,
        product_id: operationForm.product_id || null,
        shipment_date: operationForm.shipment_date,
        quantity: Number(operationForm.quantity),
        tariff_type: operationForm.tariff_type,
        unit_price_rub: Number(tariff),
        total_rub: Number(tariff) * Number(operationForm.quantity),
        status: "active",
        note: operationForm.note || null,
        created_by: session.user.id,
      };

      const result = await supabase.from("shipments").insert(payload);

      if (result.error) {
        showNotice(result.error.message);
        return;
      }

      setShowOperationForm(false);
      await loadAll();
      showNotice("Операция добавлена");
      return;
    }

    showNotice(
      "Для хранения используйте раздел операций хранения после добавления соответствующей записи."
    );
  }

  async function getEffectiveShipmentTariff(
    clientId,
    productId,
    tariffType,
    operationDate
  ) {
    const { data, error } = await supabase.rpc(
      "get_effective_shipment_tariff",
      {
        p_client_id: clientId,
        p_product_id: productId || null,
        p_tariff_type: tariffType,
        p_date: operationDate,
      }
    );

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  }

  async function cancelShipment(id) {
    const result = await supabase.rpc("cancel_shipment", {
      p_shipment_id: id,
    });

    if (result.error) {
      showNotice(result.error.message);
      return;
    }

    await loadAll();
    showNotice("Операция отменена");
  }

  async function cancelStorage(id) {
    const result = await supabase.rpc("cancel_storage", {
      p_storage_id: id,
    });

    if (result.error) {
      showNotice(result.error.message);
      return;
    }

    await loadAll();
    showNotice("Хранение отменено");
  }

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        client.name,
        client.contact_name,
        client.phone,
        client.email,
        client.inn,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, search]);

  const selectedClientProducts = useMemo(() => {
    if (!tariffForm.client_id) return products;
    return products.filter((p) => p.client_id === tariffForm.client_id);
  }, [products, tariffForm.client_id]);

  const operationProducts = useMemo(() => {
    if (!operationForm.client_id) return products;
    return products.filter((p) => p.client_id === operationForm.client_id);
  }, [products, operationForm.client_id]);

  const periodShipments = useMemo(() => {
    return shipments.filter(
      (item) =>
        item.status === "active" &&
        item.shipment_date >= periodFrom &&
        item.shipment_date <= periodTo
    );
  }, [shipments, periodFrom, periodTo]);

  const periodStorage = useMemo(() => {
    return storageRecords.filter((item) => {
      const active =
        item.status !== "cancelled" &&
        item.start_date <= periodTo &&
        (!item.end_date || item.end_date >= periodFrom);

      return active;
    });
  }, [storageRecords, periodFrom, periodTo]);

  const payableTotal = useMemo(() => {
    const shipmentsTotal = periodShipments.reduce(
      (sum, item) => sum + Number(item.total_rub || 0),
      0
    );

    const storageTotal = periodStorage.reduce(
      (sum, item) => sum + Number(item.total_rub || 0),
      0
    );

    return shipmentsTotal + storageTotal;
  }, [periodShipments, periodStorage]);

  const activeOperations = shipments.filter(
    (item) => item.status === "active"
  );

  const dashboardTotal = activeOperations.reduce(
    (sum, item) => sum + Number(item.total_rub || 0),
    0
  );

  const dashboardQuantity = activeOperations.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        navigate={navigate}
        logout={logout}
      />

      <div className="app-main">
        <MobileTopBar
          page={page}
          onMenu={() => setMobileMore((v) => !v)}
          mobileMore={mobileMore}
          navigate={navigate}
        />

        {mobileMore && (
          <MobileMoreMenu
            navigate={navigate}
            logout={logout}
          />
        )}

        <main className="content">
          {loadingData && (
            <div className="loading-strip">Обновление данных…</div>
          )}

          {notice && <div className="notice">{notice}</div>}

          {page === "home" && (
            <HomePage
              clients={clients}
              dashboardTotal={dashboardTotal}
              dashboardQuantity={dashboardQuantity}
              activeOperations={activeOperations}
              navigate={navigate}
            />
          )}

          {page === "clients" && (
            <ClientsPage
              clients={filteredClients}
              search={search}
              setSearch={setSearch}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              openNewClient={openNewClient}
              openEditClient={openEditClient}
              products={products}
              shipments={shipments}
              onNewProduct={openNewProduct}
              onEditProduct={openEditProduct}
            />
          )}

          {page === "products" && (
            <ProductsPage
              products={products}
              clients={clients}
              openNewProduct={openNewProduct}
              openEditProduct={openEditProduct}
            />
          )}

          {page === "tariffs" && (
            <TariffsPage
              tariffs={tariffs}
              systemTariffs={systemTariffs}
              clients={clients}
              products={products}
              showTariffForm={showTariffForm}
              setShowTariffForm={setShowTariffForm}
              tariffForm={tariffForm}
              setTariffForm={setTariffForm}
              selectedClientProducts={selectedClientProducts}
              saveTariff={saveTariff}
            />
          )}

          {page === "operations" && (
            <OperationsPage
              shipments={shipments}
              storageRecords={storageRecords}
              clients={clients}
              openOperation={() => {
                setOperationForm({
                  client_id: clients[0]?.id || "",
                  product_id: "",
                  shipment_date: today(),
                  quantity: 1,
                  tariff_type: "small",
                  note: "",
                  operation_type: "shipment",
                });
                setShowOperationForm(true);
              }}
              cancelShipment={cancelShipment}
              cancelStorage={cancelStorage}
            />
          )}

          {page === "payable" && (
            <PayablePage
              periodFrom={periodFrom}
              setPeriodFrom={setPeriodFrom}
              periodTo={periodTo}
              setPeriodTo={setPeriodTo}
              periodShipments={periodShipments}
              periodStorage={periodStorage}
              payableTotal={payableTotal}
              clients={clients}
            />
          )}

          {page === "history" && (
            <HistoryPage
              shipments={shipments}
              storageRecords={storageRecords}
              auditLog={auditLog}
            />
          )}
        </main>

        <MobileBottomNav
          page={page}
          navigate={navigate}
          onMore={() => setMobileMore((v) => !v)}
          moreOpen={mobileMore}
        />
      </div>

      {showClientForm && (
        <Modal
          title={editingClient ? "Редактирование клиента" : "Новый клиент"}
          onClose={() => setShowClientForm(false)}
        >
          <FormField
            label="Название клиента *"
            value={clientForm.name}
            onChange={(v) =>
              setClientForm({ ...clientForm, name: v })
            }
          />

          <FormField
            label="Контактное лицо"
            value={clientForm.contact_name}
            onChange={(v) =>
              setClientForm({ ...clientForm, contact_name: v })
            }
          />

          <div className="form-grid">
            <FormField
              label="Телефон"
              value={clientForm.phone}
              onChange={(v) =>
                setClientForm({ ...clientForm, phone: v })
              }
            />

            <FormField
              label="Email"
              value={clientForm.email}
              onChange={(v) =>
                setClientForm({ ...clientForm, email: v })
              }
            />
          </div>

          <div className="form-grid">
            <FormField
              label="Юридическое название"
              value={clientForm.legal_name}
              onChange={(v) =>
                setClientForm({ ...clientForm, legal_name: v })
              }
            />

            <FormField
              label="ИНН"
              value={clientForm.inn}
              onChange={(v) =>
                setClientForm({ ...clientForm, inn: v })
              }
            />
          </div>

          <FormField
            label="Заметки"
            value={clientForm.notes}
            onChange={(v) =>
              setClientForm({ ...clientForm, notes: v })
            }
            textarea
          />

          <ModalActions
            onCancel={() => setShowClientForm(false)}
            onSave={saveClient}
          />
        </Modal>
      )}

      {showProductForm && (
        <Modal
          title={
            editingProduct
              ? "Редактирование номенклатуры"
              : "Новая номенклатура"
          }
          onClose={() => setShowProductForm(false)}
        >
          <SelectField
            label="Клиент *"
            value={productForm.client_id}
            onChange={(v) =>
              setProductForm({ ...productForm, client_id: v })
            }
            options={clients.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />

          <div className="form-grid">
            <FormField
              label="SKU *"
              value={productForm.sku}
              onChange={(v) =>
                setProductForm({ ...productForm, sku: v })
              }
            />

            <FormField
              label="Название *"
              value={productForm.name}
              onChange={(v) =>
                setProductForm({ ...productForm, name: v })
              }
            />
          </div>

          <SelectField
            label="Категория размера"
            value={productForm.size_type}
            onChange={(v) =>
              setProductForm({ ...productForm, size_type: v })
            }
            options={[
              { value: "small", label: "Малый" },
              { value: "medium", label: "Средний" },
              { value: "large", label: "Большой" },
            ]}
          />

          <div className="form-grid-4">
            <FormField
              label="Длина, см"
              value={productForm.length_cm}
              onChange={(v) =>
                setProductForm({ ...productForm, length_cm: v })
              }
              type="number"
            />

            <FormField
              label="Ширина, см"
              value={productForm.width_cm}
              onChange={(v) =>
                setProductForm({ ...productForm, width_cm: v })
              }
              type="number"
            />

            <FormField
              label="Высота, см"
              value={productForm.height_cm}
              onChange={(v) =>
                setProductForm({ ...productForm, height_cm: v })
              }
              type="number"
            />

            <FormField
              label="Вес, кг"
              value={productForm.weight_kg}
              onChange={(v) =>
                setProductForm({ ...productForm, weight_kg: v })
              }
              type="number"
            />
          </div>

          <FormField
            label="Заметки"
            value={productForm.notes}
            onChange={(v) =>
              setProductForm({ ...productForm, notes: v })
            }
            textarea
          />

          <ModalActions
            onCancel={() => setShowProductForm(false)}
            onSave={saveProduct}
          />
        </Modal>
      )}

      {showOperationForm && (
        <Modal
          title="Новая операция"
          onClose={() => setShowOperationForm(false)}
        >
          <SelectField
            label="Тип операции"
            value={operationForm.operation_type}
            onChange={(v) =>
              setOperationForm({
                ...operationForm,
                operation_type: v,
              })
            }
            options={[
              { value: "shipment", label: "Услуга / операция" },
            ]}
          />

          <SelectField
            label="Клиент *"
            value={operationForm.client_id}
            onChange={(v) =>
              setOperationForm({
                ...operationForm,
                client_id: v,
                product_id: "",
              })
            }
            options={clients.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />

          <SelectField
            label="Номенклатура"
            value={operationForm.product_id}
            onChange={(v) =>
              setOperationForm({
                ...operationForm,
                product_id: v,
              })
            }
            options={[
              { value: "", label: "Без номенклатуры" },
              ...operationProducts.map((p) => ({
                value: p.id,
                label: `${p.sku} — ${p.name}`,
              })),
            ]}
          />

          <div className="form-grid">
            <FormField
              label="Дата"
              type="date"
              value={operationForm.shipment_date}
              onChange={(v) =>
                setOperationForm({
                  ...operationForm,
                  shipment_date: v,
                })
              }
            />

            <FormField
              label="Количество"
              type="number"
              value={operationForm.quantity}
              onChange={(v) =>
                setOperationForm({
                  ...operationForm,
                  quantity: v,
                })
              }
            />
          </div>

          <SelectField
            label="Тариф"
            value={operationForm.tariff_type}
            onChange={(v) =>
              setOperationForm({
                ...operationForm,
                tariff_type: v,
              })
            }
            options={[
              { value: "small", label: "Малый" },
              { value: "medium", label: "Средний" },
              { value: "large", label: "Большой" },
            ]}
          />

          <FormField
            label="Комментарий"
            value={operationForm.note}
            onChange={(v) =>
              setOperationForm({
                ...operationForm,
                note: v,
              })
            }
            textarea
          />

          <ModalActions
            onCancel={() => setShowOperationForm(false)}
            onSave={addOperation}
            saveText="Добавить операцию"
          />
        </Modal>
      )}
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) setError(loginError.message);

    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-mark">S</div>

        <div className="login-brand">SORTEX</div>
        <div className="login-subtitle">WMS · OPERATIONS</div>

        <h1>Вход в систему</h1>

        <form onSubmit={login}>
          <FormField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
          />

          <FormField
            label="Пароль"
            value={password}
            onChange={setPassword}
            type="password"
          />

          {error && <div className="error-box">{error}</div>}

          <button
            className="primary-button login-button"
            disabled={loading}
          >
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">SORTEX</div>
      <div className="loading-text">Загрузка системы…</div>
    </div>
  );
}

function Sidebar({ page, navigate, logout }) {
  const items = [
    ["home", "⌂", "Главная"],
    ["clients", "◉", "Клиенты"],
    ["products", "□", "Номенклатура"],
    ["tariffs", "◇", "Тарифы"],
    ["operations", "↗", "Операции"],
    ["payable", "₽", "К оплате"],
    ["history", "◷", "История"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">S</div>
        <div>
          <div className="sidebar-title">SORTEX</div>
          <div className="sidebar-caption">WMS · OPERATIONS</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(([key, icon, label]) => (
          <button
            key={key}
            className={`nav-item ${page === key ? "active" : ""}`}
            onClick={() => navigate(key)}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot" />
          Система подключена
        </div>

        <button className="logout-button" onClick={logout}>
          Выйти
        </button>
      </div>
    </aside>
  );
}

function MobileTopBar({
  page,
  onMenu,
  mobileMore,
  navigate,
}) {
  const labels = {
    home: "Главная",
    clients: "Клиенты",
    products: "Номенклатура",
    tariffs: "Тарифы",
    operations: "Операции",
    payable: "К оплате",
    history: "История",
  };

  return (
    <header className="mobile-topbar">
      <div className="mobile-brand" onClick={() => navigate("home")}>
        <div className="mobile-logo">S</div>
        <div>
          <div className="mobile-brand-name">SORTEX</div>
          <div className="mobile-page-name">{labels[page]}</div>
        </div>
      </div>

      <button
        className={`mobile-menu-button ${
          mobileMore ? "selected" : ""
        }`}
        onClick={onMenu}
      >
        ☰
      </button>
    </header>
  );
}

function MobileMoreMenu({ navigate, logout }) {
  return (
    <div className="mobile-more-menu">
      <button onClick={() => navigate("products")}>
        □ Номенклатура
      </button>

      <button onClick={() => navigate("tariffs")}>
        ◇ Тарифы
      </button>

      <button onClick={() => navigate("history")}>
        ◷ История
      </button>

      <button className="mobile-logout" onClick={logout}>
        Выйти
      </button>
    </div>
  );
}

function MobileBottomNav({
  page,
  navigate,
  onMore,
  moreOpen,
}) {
  const items = [
    ["home", "⌂", "Главная"],
    ["clients", "◉", "Клиенты"],
    ["operations", "↗", "Операции"],
    ["payable", "₽", "К оплате"],
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map(([key, icon, label]) => (
        <button
          key={key}
          className={page === key ? "active" : ""}
          onClick={() => navigate(key)}
        >
          <span>{icon}</span>
          <small>{label}</small>
        </button>
      ))}

      <button
        className={
          moreOpen ||
          ["products", "tariffs", "history"].includes(page)
            ? "active"
            : ""
        }
        onClick={onMore}
      >
        <span>•••</span>
        <small>Ещё</small>
      </button>
    </nav>
  );
}

function HomePage({
  clients,
  dashboardTotal,
  dashboardQuantity,
  activeOperations,
  navigate,
}) {
  const recent = activeOperations.slice(0, 5);

  return (
    <div>
      <PageHeader
        eyebrow="SORTEX WMS"
        title="Главная"
        description="Контроль клиентских операций и начислений"
      />

      <div className="stats-grid">
        <StatCard
          label="Клиенты"
          value={clients.length}
          caption="активные карточки"
        />

        <StatCard
          label="Операции"
          value={dashboardQuantity}
          caption="единиц за всё время"
        />

        <StatCard
          label="Начислено"
          value={money(dashboardTotal)}
          caption="активные операции"
          money
        />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">БЫСТРЫЙ ДОСТУП</div>
            <h2>Рабочие разделы</h2>
          </div>
        </div>

        <div className="quick-grid">
          <QuickCard
            title="Клиенты"
            text="Карточки клиентов и контакты"
            onClick={() => navigate("clients")}
          />

          <QuickCard
            title="Операции"
            text="Добавление и контроль начислений"
            onClick={() => navigate("operations")}
          />

          <QuickCard
            title="К оплате"
            text="Сумма начислений за период"
            onClick={() => navigate("payable")}
          />

          <QuickCard
            title="Тарифы"
            text="Правила расчёта стоимости"
            onClick={() => navigate("tariffs")}
          />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">ПОСЛЕДНИЕ</div>
            <h2>Последние операции</h2>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("operations")}
          >
            Все операции
          </button>
        </div>

        {recent.length === 0 ? (
          <EmptyState text="Операций пока нет" />
        ) : (
          <div className="data-list">
            {recent.map((item) => (
              <OperationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClientsPage({
  clients,
  search,
  setSearch,
  selectedClient,
  setSelectedClient,
  openNewClient,
  openEditClient,
  products,
  shipments,
  onNewProduct,
  onEditProduct,
}) {
  if (selectedClient) {
    const clientProducts = products.filter(
      (p) => p.client_id === selectedClient.id
    );

    const clientOperations = shipments.filter(
      (s) => s.client_id === selectedClient.id
    );

    const clientTotal = clientOperations
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + Number(s.total_rub || 0), 0);

    return (
      <div>
        <button
          className="back-button"
          onClick={() => setSelectedClient(null)}
        >
          ← Все клиенты
        </button>

        <PageHeader
          eyebrow="КЛИЕНТ"
          title={selectedClient.name}
          description={
            selectedClient.contact_name ||
            selectedClient.phone ||
            "Карточка клиента"
          }
          action={
            <button
              className="primary-button"
              onClick={() => openEditClient(selectedClient)}
            >
              Редактировать
            </button>
          }
        />

        <div className="client-summary-grid">
          <InfoCard
            label="Контакт"
            value={selectedClient.contact_name || "—"}
          />
          <InfoCard
            label="Телефон"
            value={selectedClient.phone || "—"}
          />
          <InfoCard
            label="Email"
            value={selectedClient.email || "—"}
          />
          <InfoCard
            label="Активные начисления"
            value={money(clientTotal)}
          />
        </div>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="section-eyebrow">НОМЕНКЛАТУРА</div>
              <h2>Товары клиента</h2>
            </div>

            <button
              className="secondary-button"
              onClick={onNewProduct}
            >
              + Добавить
            </button>
          </div>

          {clientProducts.length === 0 ? (
            <EmptyState text="Номенклатура пока не добавлена" />
          ) : (
            <div className="data-list">
              {clientProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => onEditProduct(product)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="СПРАВОЧНИК"
        title="Клиенты"
        description="Клиентские карточки и контактные данные"
        action={
          <button className="primary-button" onClick={openNewClient}>
            + Новый клиент
          </button>
        }
      />

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Поиск клиента…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="search-count">
          Найдено: <strong>{clients.length}</strong>
        </div>
      </div>

      {clients.length === 0 ? (
        <EmptyState text="Клиенты не найдены" />
      ) : (
        <div className="data-list">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onOpen={() => setSelectedClient(client)}
              onEdit={() => openEditClient(client)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsPage({
  products,
  clients,
  openNewProduct,
  openEditProduct,
}) {
  return (
    <div>
      <PageHeader
        eyebrow="СПРАВОЧНИК"
        title="Номенклатура"
        description="SKU и параметры клиентских товаров"
        action={
          <button className="primary-button" onClick={openNewProduct}>
            + Добавить
          </button>
        }
      />

      {products.length === 0 ? (
        <EmptyState text="Номенклатура пока не добавлена" />
      ) : (
        <div className="data-list">
          {products.map((product) => {
            const client = clients.find(
              (c) => c.id === product.client_id
            );

            return (
              <ProductCard
                key={product.id}
                product={product}
                clientName={client?.name}
                onEdit={() => openEditProduct(product)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TariffsPage({
  tariffs,
  systemTariffs,
  clients,
  products,
  showTariffForm,
  setShowTariffForm,
  tariffForm,
  setTariffForm,
  selectedClientProducts,
  saveTariff,
}) {
  return (
    <div>
      <PageHeader
        eyebrow="НАСТРОЙКИ"
        title="Тарифы"
        description="Стоимость операций по клиентам и системе"
        action={
          <button
            className="primary-button"
            onClick={() => setShowTariffForm(true)}
          >
            + Новый тариф
          </button>
        }
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">СИСТЕМНЫЕ</div>
            <h2>Базовые тарифы</h2>
          </div>
        </div>

        <div className="system-tariff-grid">
          {systemTariffs.map((item) => (
            <div className="system-tariff-card" key={item.id}>
              <span>{tariffLabels[item.tariff_type]}</span>
              <strong>{money(item.price_rub)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">ИНДИВИДУАЛЬНЫЕ</div>
            <h2>Тарифы клиентов</h2>
          </div>
        </div>

        {tariffs.length === 0 ? (
          <EmptyState text="Индивидуальных тарифов пока нет" />
        ) : (
          <div className="data-list">
            {tariffs.map((tariff) => (
              <TariffCard key={tariff.id} tariff={tariff} />
            ))}
          </div>
        )}
      </section>

      {showTariffForm && (
        <Modal
          title="Новый тариф"
          onClose={() => setShowTariffForm(false)}
        >
          <SelectField
            label="Клиент *"
            value={tariffForm.client_id}
            onChange={(v) =>
              setTariffForm({
                ...tariffForm,
                client_id: v,
                product_id: "",
              })
            }
            options={clients.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />

          <SelectField
            label="Тип тарифа"
            value={tariffForm.tariff_type}
            onChange={(v) =>
              setTariffForm({
                ...tariffForm,
                tariff_type: v,
                product_id: "",
              })
            }
            options={[
              { value: "small", label: "Малый" },
              { value: "medium", label: "Средний" },
              { value: "large", label: "Большой" },
              { value: "storage", label: "Хранение" },
            ]}
          />

          {tariffForm.tariff_type !== "storage" && (
            <SelectField
              label="Номенклатура"
              value={tariffForm.product_id}
              onChange={(v) =>
                setTariffForm({
                  ...tariffForm,
                  product_id: v,
                })
              }
              options={[
                { value: "", label: "Для всего клиента" },
                ...selectedClientProducts.map((p) => ({
                  value: p.id,
                  label: `${p.sku} — ${p.name}`,
                })),
              ]}
            />
          )}

          <div className="form-grid">
            <FormField
              label="Цена, ₽ *"
              type="number"
              value={tariffForm.price_rub}
              onChange={(v) =>
                setTariffForm({
                  ...tariffForm,
                  price_rub: v,
                })
              }
            />

            <FormField
              label="Действует с"
              type="date"
              value={tariffForm.effective_from}
              onChange={(v) =>
                setTariffForm({
                  ...tariffForm,
                  effective_from: v,
                })
              }
            />
          </div>

          <FormField
            label="Заметки"
            value={tariffForm.notes}
            onChange={(v) =>
              setTariffForm({
                ...tariffForm,
                notes: v,
              })
            }
            textarea
          />

          <ModalActions
            onCancel={() => setShowTariffForm(false)}
            onSave={saveTariff}
          />
        </Modal>
      )}
    </div>
  );
}

function OperationsPage({
  shipments,
  storageRecords,
  openOperation,
  cancelShipment,
  cancelStorage,
}) {
  return (
    <div>
      <PageHeader
        eyebrow="ОПЕРАЦИИ"
        title="Операции"
        description="Начисления за выполненные услуги"
        action={
          <button className="primary-button" onClick={openOperation}>
            + Новая операция
          </button>
        }
      />

      <div className="operation-summary">
        <InfoCard
          label="Активные операции"
          value={
            shipments.filter((s) => s.status === "active").length
          }
        />

        <InfoCard
          label="Отменённые"
          value={
            shipments.filter((s) => s.status === "cancelled").length
          }
        />

        <InfoCard
          label="Хранение"
          value={storageRecords.length}
        />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">НАЧИСЛЕНИЯ</div>
            <h2>Операции</h2>
          </div>
        </div>

        {shipments.length === 0 ? (
          <EmptyState text="Операций пока нет" />
        ) : (
          <div className="data-list">
            {shipments.map((item) => (
              <OperationCard
                key={item.id}
                item={item}
                onCancel={
                  item.status === "active"
                    ? () => cancelShipment(item.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {storageRecords.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="section-eyebrow">ХРАНЕНИЕ</div>
              <h2>Хранение</h2>
            </div>
          </div>

          <div className="data-list">
            {storageRecords.map((item) => (
              <StorageCard
                key={item.id}
                item={item}
                onCancel={
                  item.status !== "cancelled"
                    ? () => cancelStorage(item.id)
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PayablePage({
  periodFrom,
  setPeriodFrom,
  periodTo,
  setPeriodTo,
  periodShipments,
  periodStorage,
  payableTotal,
}) {
  const shipmentTotal = periodShipments.reduce(
    (sum, item) => sum + Number(item.total_rub || 0),
    0
  );

  const storageTotal = periodStorage.reduce(
    (sum, item) => sum + Number(item.total_rub || 0),
    0
  );

  return (
    <div>
      <PageHeader
        eyebrow="ФИНАНСЫ"
        title="К оплате"
        description="Активные начисления за выбранный период"
      />

      <div className="period-panel">
        <div>
          <label>С</label>
          <input
            type="date"
            value={periodFrom}
            onChange={(e) => setPeriodFrom(e.target.value)}
          />
        </div>

        <div>
          <label>По</label>
          <input
            type="date"
            value={periodTo}
            onChange={(e) => setPeriodTo(e.target.value)}
          />
        </div>
      </div>

      <div className="payable-hero">
        <div>
          <div className="section-eyebrow">ИТОГО</div>
          <div className="payable-number">{money(payableTotal)}</div>
          <div className="muted-text">
            сумма активных начислений за период
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Операции"
          value={money(shipmentTotal)}
          caption={`${periodShipments.length} операций`}
          money
        />

        <StatCard
          label="Хранение"
          value={money(storageTotal)}
          caption={`${periodStorage.length} записей`}
          money
        />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">РАСШИФРОВКА</div>
            <h2>Начисления</h2>
          </div>
        </div>

        {periodShipments.length === 0 && periodStorage.length === 0 ? (
          <EmptyState text="За выбранный период начислений нет" />
        ) : (
          <div className="data-list">
            {periodShipments.map((item) => (
              <OperationCard key={item.id} item={item} />
            ))}

            {periodStorage.map((item) => (
              <StorageCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HistoryPage({
  shipments,
  storageRecords,
  auditLog,
}) {
  const historyItems = [
    ...shipments.map((item) => ({
      id: item.id,
      date: item.shipment_date,
      type: "Операция",
      name: item.clients?.name || "—",
      amount: item.total_rub,
      status: item.status,
    })),
    ...storageRecords.map((item) => ({
      id: item.id,
      date: item.start_date,
      type: "Хранение",
      name: item.clients?.name || "—",
      amount: item.total_rub,
      status: item.status,
    })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <div>
      <PageHeader
        eyebrow="КОНТРОЛЬ"
        title="История"
        description="История операций и системных изменений"
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">ОПЕРАЦИИ</div>
            <h2>История начислений</h2>
          </div>
        </div>

        {historyItems.length === 0 ? (
          <EmptyState text="История пока пуста" />
        ) : (
          <div className="data-list">
            {historyItems.map((item) => (
              <div className="history-card" key={`${item.type}-${item.id}`}>
                <div className="history-main">
                  <div className="history-type">{item.type}</div>
                  <strong>{item.name}</strong>
                  <span>{dateRu(item.date)}</span>
                </div>

                <div className="history-side">
                  <strong>{money(item.amount)}</strong>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">AUDIT</div>
            <h2>Журнал изменений</h2>
          </div>
        </div>

        {auditLog.length === 0 ? (
          <EmptyState text="Записей аудита пока нет" />
        ) : (
          <div className="audit-list">
            {auditLog.slice(0, 50).map((item) => (
              <div className="audit-card" key={item.id}>
                <div>
                  <strong>{item.entity_type}</strong>
                  <span>{item.action}</span>
                </div>

                <time>
                  {item.changed_at
                    ? new Date(item.changed_at).toLocaleString("ru-RU")
                    : "—"}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        <div className="section-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

function StatCard({ label, value, caption }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-caption">{caption}</div>
    </div>
  );
}

function QuickCard({ title, text, onClick }) {
  return (
    <button className="quick-card" onClick={onClick}>
      <div className="quick-arrow">↗</div>
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}

function ClientCard({ client, onOpen, onEdit }) {
  return (
    <div className="data-card clickable-card" onClick={onOpen}>
      <div className="card-main">
        <div className="card-eyebrow">КЛИЕНТ</div>
        <h3>{client.name}</h3>

        <div className="card-details">
          {client.contact_name && (
            <span>{client.contact_name}</span>
          )}
          {client.phone && <span>{client.phone}</span>}
          {client.email && <span>{client.email}</span>}
        </div>
      </div>

      <div className="card-actions">
        <button
          className="small-button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Изменить
        </button>

        <span className="card-arrow">→</span>
      </div>
    </div>
  );
}

function ProductCard({ product, clientName, onEdit }) {
  return (
    <div className="data-card">
      <div className="card-main">
        <div className="card-eyebrow">
          {product.sku}
        </div>

        <h3>{product.name}</h3>

        <div className="card-details">
          {clientName && <span>{clientName}</span>}
          {product.size_type && (
            <span>{tariffLabels[product.size_type]}</span>
          )}

          {product.length_cm &&
            product.width_cm &&
            product.height_cm && (
              <span>
                {product.length_cm} × {product.width_cm} ×{" "}
                {product.height_cm} см
              </span>
            )}
        </div>
      </div>

      <div className="card-actions">
        <button className="small-button" onClick={onEdit}>
          Изменить
        </button>
      </div>
    </div>
  );
}

function TariffCard({ tariff }) {
  const clientName = tariff.clients?.name || "—";
  const productName = tariff.products?.name;

  return (
    <div className="data-card">
      <div className="card-main">
        <div className="card-eyebrow">
          {tariffLabels[tariff.tariff_type]}
        </div>

        <h3>{clientName}</h3>

        <div className="card-details">
          <span>
            {productName
              ? `Номенклатура: ${productName}`
              : "Тариф клиента"}
          </span>
          <span>
            Действует с {dateRu(tariff.effective_from)}
          </span>
        </div>
      </div>

      <div className="amount-block">
        {money(tariff.price_rub)}
      </div>
    </div>
  );
}

function OperationCard({ item, onCancel }) {
  return (
    <div className="data-card">
      <div className="card-main">
        <div className="card-eyebrow">
          {tariffLabels[item.tariff_type] || "Операция"}
        </div>

        <h3>{item.clients?.name || "Клиент"}</h3>

        <div className="card-details">
          <span>{dateRu(item.shipment_date)}</span>

          {item.products?.name && (
            <span>{item.products.name}</span>
          )}

          <span>Количество: {item.quantity}</span>

          {item.note && <span>{item.note}</span>}
        </div>
      </div>

      <div className="card-side">
        <div className="amount-block">
          {money(item.total_rub)}
        </div>

        <StatusBadge status={item.status} />

        {onCancel && (
          <button
            className="danger-button"
            onClick={onCancel}
          >
            Отменить
          </button>
        )}
      </div>
    </div>
  );
}

function StorageCard({ item, onCancel }) {
  return (
    <div className="data-card">
      <div className="card-main">
        <div className="card-eyebrow">ХРАНЕНИЕ</div>

        <h3>{item.clients?.name || "Клиент"}</h3>

        <div className="card-details">
          <span>
            {dateRu(item.start_date)} —{" "}
            {dateRu(item.end_date)}
          </span>

          <span>
            Объём: {item.volume_m3} м³
          </span>
        </div>
      </div>

      <div className="card-side">
        <div className="amount-block">
          {money(item.total_rub)}
        </div>

        <StatusBadge status={item.status} />

        {onCancel && (
          <button
            className="danger-button"
            onClick={onCancel}
          >
            Отменить
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = {
    active: "Активно",
    cancelled: "Отменено",
    planned: "Запланировано",
    completed: "Завершено",
  };

  return (
    <span className={`status-badge status-${status}`}>
      {labels[status] || status}
    </span>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="info-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">—</div>
      <div>{text}</div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onSave,
  saveText = "Сохранить",
}) {
  return (
    <div className="modal-actions">
      <button
        className="secondary-button"
        onClick={onCancel}
      >
        Отмена
      </button>

      <button
        className="primary-button"
        onClick={onSave}
      >
        {saveText}
      </button>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
}) {
  return (
    <label className="form-field">
      <span>{label}</span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="form-field">
      <span>{label}</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchIcon() {
  return null;
}

function AppStyles() {
  return null;
}

createRoot(document.getElementById("root")).render(<App />);
