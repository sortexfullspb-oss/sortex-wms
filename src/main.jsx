import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/*
  SORTEX WMS — rebuilt to match the existing Supabase schema.
  Design: dark graphite + gold, responsive/mobile friendly.
  No database migration is required for the CRUD used here.

  Important storage detail:
  The existing DB constraint calculates total_rub from
  volume_m3 * days * price_per_m3_day_rub.
  For "за единицу" mode, this file maps unit_count into the
  existing calculation fields so the current constraint remains valid.
*/

const RUB = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

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

const REQUEST_STATUSES = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "contacted", label: "Связались" },
  { value: "closed", label: "Закрыта" },
];

const STORAGE_STATUSES = [
  { value: "planned", label: "Запланировано" },
  { value: "active", label: "Активно" },
  { value: "completed", label: "Завершено" },
  { value: "cancelled", label: "Отменено" },
];

const OPERATION_STATUSES = [
  { value: "active", label: "Активна" },
  { value: "cancelled", label: "Отменена" },
];

const today = () => new Date().toISOString().slice(0, 10);
const money = (v) => RUB.format(Number(v || 0));
const number = (v) => NUM.format(Number(v || 0));

const formatDate = (v) => {
  if (!v) return "—";
  const [y, m, d] = String(v).slice(0, 10).split("-");
  return y && m && d ? `${d}.${m}.${y}` : v;
};

const daysBetween = (start, end) => {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
};

const labelOf = (items, value) =>
  items.find((x) => x.value === value)?.label || value || "—";

const csvEscape = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCSV = (filename, rows) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.map(csvEscape).join(";"),
    ...rows.map((r) =>
      headers.map((h) => csvEscape(r[h])).join(";")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const CSS = `
:root{
  --bg:#151514;
  --bg-soft:#191816;
  --panel:#1d1c19;
  --panel2:#24221e;
  --panel3:#292620;
  --gold:#c7a36a;
  --gold2:#d5b77f;
  --gold-soft:rgba(199,163,106,.12);
  --gold-line:rgba(199,163,106,.25);
  --text:#f3efe7;
  --muted:#a9a39a;
  --muted2:#777168;
  --border:rgba(255,255,255,.075);
  --danger:#c97c72;
  --success:#91ae8a;
  --shadow:0 18px 60px rgba(0,0,0,.28);
  --radius:18px;
}

*{
  box-sizing:border-box
}

html,body,#root{
  margin:0;
  min-height:100%;
  width:100%
}

body{
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  color:var(--text);
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
  -webkit-font-smoothing:antialiased
}

button,input,select,textarea{
  font:inherit
}

button{
  cursor:pointer;
  touch-action:manipulation
}

input,select,textarea{
  font-size:16px;
  min-width:0
}

button:disabled{
  opacity:.48;
  cursor:not-allowed
}

.app{
  min-height:100vh
}

.sidebar{
  position:fixed;
  left:18px;
  top:18px;
  bottom:18px;
  width:250px;
  border:1px solid var(--border);
  border-radius:22px;
  background:rgba(29,28,25,.94);
  backdrop-filter:blur(18px);
  box-shadow:var(--shadow);
  display:flex;
  flex-direction:column;
  padding:20px;
  z-index:100;
  overflow:auto
}

.brand{
  display:flex;
  gap:11px;
  align-items:center;
  margin-bottom:22px
}

.brand-mark{
  width:40px;
  height:40px;
  border:1px solid var(--gold-line);
  border-radius:13px;
  display:grid;
  place-items:center;
  color:var(--gold2);
  background:var(--gold-soft);
  font-weight:800
}

.brand-title{
  font-size:15px;
  font-weight:800;
  letter-spacing:.12em
}

.brand-sub{
  font-size:9px;
  color:var(--muted);
  margin-top:3px;
  letter-spacing:.12em
}

.nav-label{
  font-size:10px;
  color:var(--muted2);
  text-transform:uppercase;
  letter-spacing:.12em;
  margin:10px 8px
}

.nav{
  display:grid;
  gap:5px
}

.nav button{
  border:1px solid transparent;
  background:transparent;
  color:var(--muted);
  border-radius:12px;
  padding:11px 12px;
  text-align:left;
  display:flex;
  align-items:center;
  gap:10px
}

.nav button:hover,
.nav button.active{
  background:var(--gold-soft);
  border-color:var(--gold-line);
  color:var(--text)
}

.nav-icon{
  width:21px;
  text-align:center;
  color:var(--gold2)
}

.sidebar-bottom{
  margin-top:auto;
  border-top:1px solid var(--border);
  padding-top:14px
}

.user-card{
  padding:12px;
  border:1px solid var(--border);
  border-radius:13px;
  background:rgba(255,255,255,.018)
}

.user-email{
  font-size:11px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}

.muted{
  color:var(--muted)
}

.small{
  font-size:11px
}

.main{
  width:calc(100% - 286px);
  margin-left:286px;
  padding:30px 28px 50px
}

.topbar{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:20px;
  margin-bottom:25px
}

.page-title{
  font-size:30px;
  font-weight:800;
  letter-spacing:-.02em
}

.page-subtitle{
  font-size:12px;
  color:var(--muted);
  margin-top:6px
}

.top-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap
}

.button{
  border:1px solid var(--border);
  background:var(--panel2);
  color:var(--text);
  border-radius:11px;
  padding:10px 14px;
  min-height:40px
}

.button:hover{
  border-color:var(--gold-line);
  background:var(--gold-soft)
}

.button.primary{
  background:var(--gold);
  border-color:var(--gold);
  color:#171512;
  font-weight:750
}

.button.primary:hover{
  background:var(--gold2)
}

.button.danger{
  border-color:rgba(201,124,114,.35);
  color:#e1aaa2
}

.mobile-menu{
  display:none
}

.grid4{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px
}

.grid3{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px
}

.grid2{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px
}

.card{
  border:1px solid var(--border);
  background:rgba(29,28,25,.86);
  border-radius:18px;
  box-shadow:var(--shadow)
}

.kpi{
  padding:17px;
  min-height:112px
}

.kpi-label{
  font-size:11px;
  color:var(--muted)
}

.kpi-value{
  font-size:25px;
  font-weight:800;
  margin-top:9px
}

.kpi-sub{
  font-size:10px;
  color:var(--muted2);
  margin-top:6px
}

.section{
  overflow:hidden;
  margin-bottom:14px
}

.section-head{
  padding:16px 18px;
  border-bottom:1px solid var(--border);
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center
}

.section-title{
  font-weight:750;
  font-size:14px
}

.section-body{
  padding:16px 18px
}

.table-wrap{
  overflow:auto
}

table{
  width:100%;
  border-collapse:collapse;
  min-width:760px
}

th,td{
  text-align:left;
  padding:12px 10px;
  border-bottom:1px solid var(--border);
  font-size:12px;
  vertical-align:middle
}

th{
  font-size:10px;
  color:var(--muted);
  font-weight:650;
  text-transform:uppercase;
  letter-spacing:.07em
}

tr:hover td{
  background:rgba(255,255,255,.012)
}

.badge{
  display:inline-flex;
  align-items:center;
  padding:5px 8px;
  border-radius:999px;
  border:1px solid var(--border);
  font-size:10px;
  background:rgba(255,255,255,.025);
  color:var(--muted)
}

.badge.gold{
  border-color:var(--gold-line);
  color:var(--gold2);
  background:var(--gold-soft)
}

.badge.green{
  border-color:rgba(145,174,138,.25);
  color:#b6cdb0;
  background:rgba(145,174,138,.08)
}

.badge.red{
  border-color:rgba(201,124,114,.3);
  color:#e0aaa2;
  background:rgba(201,124,114,.07)
}

.search{
  max-width:300px;
  width:100%;
  border:1px solid var(--border);
  background:#171614;
  color:var(--text);
  border-radius:10px;
  padding:10px 12px;
  outline:none
}

.search:focus,
input:focus,
select:focus,
textarea:focus{
  border-color:var(--gold-line);
  box-shadow:0 0 0 3px rgba(199,163,106,.07)
}

.form-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px
}

.form-grid.three{
  grid-template-columns:repeat(3,minmax(0,1fr))
}

.field{
  display:grid;
  gap:6px
}

.field.full{
  grid-column:1/-1
}

.field label{
  font-size:10px;
  color:var(--muted)
}

.field input,
.field select,
.field textarea{
  width:100%;
  border:1px solid var(--border);
  background:#171614;
  color:var(--text);
  border-radius:10px;
  padding:10px 11px;
  outline:none
}

.field textarea{
  min-height:90px;
  resize:vertical
}

.check{
  display:flex;
  gap:8px;
  align-items:center;
  font-size:12px;
  color:var(--muted)
}

.check input{
  accent-color:var(--gold)
}

.total-preview{
  border:1px solid var(--gold-line);
  background:var(--gold-soft);
  border-radius:13px;
  padding:14px
}

.total-label{
  font-size:10px;
  color:var(--muted)
}

.total-value{
  font-size:22px;
  color:var(--gold2);
  font-weight:800;
  margin-top:4px
}

.quick{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px
}

.quick button{
  padding:14px;
  border:1px solid var(--border);
  border-radius:13px;
  background:rgba(255,255,255,.018);
  color:var(--text);
  text-align:left
}

.quick button:hover{
  border-color:var(--gold-line);
  background:var(--gold-soft)
}

.quick-title{
  font-weight:700;
  font-size:12px
}

.quick-sub{
  color:var(--muted);
  font-size:10px;
  margin-top:4px
}

.overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.65);
  z-index:200;
  display:grid;
  place-items:center;
  padding:18px
}

.modal{
  width:min(760px,100%);
  max-height:calc(100vh - 36px);
  overflow:auto;
  background:#1d1c19;
  border:1px solid var(--border);
  border-radius:20px;
  box-shadow:0 30px 100px rgba(0,0,0,.5)
}

.modal-head{
  padding:17px 18px;
  border-bottom:1px solid var(--border);
  display:flex;
  justify-content:space-between;
  align-items:center
}

.modal-title{
  font-size:16px;
  font-weight:800
}

.modal-body{
  padding:18px
}

.modal-foot{
  padding:14px 18px;
  border-top:1px solid var(--border);
  display:flex;
  justify-content:flex-end;
  gap:8px
}

.close{
  border:1px solid var(--border);
  background:transparent;
  color:var(--muted);
  border-radius:9px;
  width:34px;
  height:34px
}

.toast{
  position:fixed;
  right:18px;
  bottom:18px;
  z-index:400;
  max-width:min(430px,calc(100vw - 36px));
  padding:13px 15px;
  border-radius:13px;
  background:#211f1b;
  border:1px solid var(--gold-line);
  box-shadow:var(--shadow);
  font-size:12px
}

.toast.error{
  border-color:rgba(201,124,114,.4)
}

.empty{
  padding:35px;
  text-align:center;
  color:var(--muted);
  font-size:12px
}

.mobile-nav{
  display:none
}

@media(max-width:1150px){
  .sidebar{
    width:225px
  }

  .main{
    width:calc(100% - 250px);
    margin-left:250px
  }

  .grid4{
    grid-template-columns:repeat(2,1fr)
  }

  .quick{
    grid-template-columns:repeat(2,1fr)
  }
}

@media(max-width:900px){
  .sidebar{
    transform:translateX(-105%);
    left:0;
    top:0;
    bottom:0;
    border-radius:0 20px 20px 0;
    width:min(310px,86vw);
    transition:.22s
  }

  .sidebar.open{
    transform:translateX(0)
  }

  .main{
    width:100%;
    margin:0;
    padding:15px 12px 40px
  }

  .mobile-menu{
    display:inline-flex
  }

  .overlay-nav{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.55);
    z-index:90
  }

  .topbar{
    flex-direction:column
  }

  .grid4,
  .grid3,
  .grid2,
  .form-grid,
  .form-grid.three{
    grid-template-columns:1fr
  }

  .quick{
    grid-template-columns:1fr 1fr
  }
}

@media(max-width:560px){
  .quick{
    grid-template-columns:1fr
  }

  .page-title{
    font-size:24px
  }

  .section-head,
  .section-body{
    padding:14px
  }

  .modal-body{
    padding:14px
  }
}
`;

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [storage, setStorage] = useState([]);
  const [requests, setRequests] = useState([]);

  const showToast = (message, error = false) => {
    setToast({ message, error });

    setTimeout(
      () => setToast(null),
      error ? 8000 : 3500
    );
  };

  const showError = (e) => {
    console.error(e);

    const msg = [
      e?.message,
      e?.details,
      e?.hint,
      e?.code ? `Код: ${e.code}` : null,
    ]
      .filter(Boolean)
      .join(" — ") || "Не удалось выполнить операцию.";

    showToast(msg, true);
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data: sub } =
      supabase.auth.onAuthStateChange((_event, s) => {
        if (alive) setSession(s);
      });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadAll = async () => {
    if (!supabase) return;

    setLoading(true);

    try {
      const names = [
        "clients",
        "products",
        "service_tariffs",
        "shipments",
        "storage_records",
        "cooperation_requests",
      ];

      const results = await Promise.all(
        names.map((n) =>
          supabase.from(n).select("*")
        )
      );

      const bad = results.find((r) => r.error);

      if (bad?.error) throw bad.error;

      setClients(results[0].data || []);
      setProducts(results[1].data || []);
      setTariffs(results[2].data || []);
      setShipments(results[3].data || []);
      setStorage(results[4].data || []);
      setRequests(results[5].data || []);
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadAll();
  }, [session]);

  const addClient = async (p) => {
    try {
      const payload = {
        name: p.name.trim(),
        legal_name: p.legal_name || null,
        inn: p.inn || null,
        contact_name: p.contact_name || null,
        phone: p.phone || null,
        email: p.email || null,
        notes: p.notes || null,
        is_active: p.is_active !== false,
      };

      const { data, error } = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setClients((x) => [data, ...x]);

      closeModal();
      showToast("Клиент добавлен.");
    } catch (e) {
      showError(e);
    }
  };

  const addProduct = async (p) => {
    try {
      if (!p.client_id)
        throw new Error("Выберите клиента.");

      if (!p.name.trim())
        throw new Error("Укажите название товара.");

      if (!p.sku.trim())
        throw new Error("Укажите SKU.");

      const payload = {
        client_id: p.client_id,
        sku: p.sku.trim(),
        name: p.name.trim(),
        size_type: p.size_type || null,
        length_cm:
          p.length_cm === ""
            ? null
            : Number(p.length_cm),
        width_cm:
          p.width_cm === ""
            ? null
            : Number(p.width_cm),
        height_cm:
          p.height_cm === ""
            ? null
            : Number(p.height_cm),
        weight_kg:
          p.weight_kg === ""
            ? null
            : Number(p.weight_kg),
        notes: p.notes || null,
        is_active: p.is_active !== false,
      };

      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setProducts((x) => [data, ...x]);

      closeModal();
      showToast("Товар добавлен.");
    } catch (e) {
      showError(e);
    }
  };

  const addTariff = async (p) => {
    try {
      if (!p.client_id)
        throw new Error("Выберите клиента.");

      const price = Number(p.price_rub);

      if (!Number.isFinite(price) || price < 0)
        throw new Error(
          "Цена должна быть неотрицательной."
        );

      const payload = {
        client_id: p.client_id,
        product_id: p.product_id || null,
        service_type: p.service_type || "shipment",
        price_rub: price,
        enabled: p.enabled !== false,
        effective_from: p.effective_from || today(),
        effective_to: p.effective_to || null,
        notes: p.notes || null,
        created_by: session?.user?.id || null,
        included_weight_kg:
          p.included_weight_kg === ""
            ? 1
            : Number(p.included_weight_kg),
        extra_kg_price_rub:
          p.extra_kg_price_rub === ""
            ? 8
            : Number(p.extra_kg_price_rub),
      };

      const { data, error } = await supabase
        .from("service_tariffs")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setTariffs((x) => [data, ...x]);

      closeModal();
      showToast("Тариф добавлен.");
    } catch (e) {
      showError(e);
    }
  };

  const addShipment = async (p) => {
    try {
      if (!p.client_id || !p.product_id)
        throw new Error(
          "Выберите клиента и товар."
        );

      const quantity = Number(p.quantity);
      const weight = Number(p.weight_kg || 0);
      const base = Number(
        p.base_unit_price_rub ||
          p.unit_price_rub ||
          0
      );
      const included = Number(
        p.included_weight_kg || 1
      );
      const extraPrice = Number(
        p.extra_kg_price_rub || 8
      );
      const receivingEnabled = Boolean(
        p.receiving_enabled
      );
      const receivingPrice = Number(
        p.receiving_unit_price_rub || 5
      );

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Количество должно быть больше нуля."
        );
      }

      if (!p.shipment_date)
        throw new Error(
          "Укажите дату отгрузки."
        );

      const extraKg = Math.max(
        weight - included,
        0
      );

      const extraTotal = Number(
        (
          quantity *
          extraKg *
          extraPrice
        ).toFixed(2)
      );

      const receivingTotal =
        receivingEnabled
          ? Number(
              (
                quantity *
                receivingPrice
              ).toFixed(2)
            )
          : 0;

      const total = Number(
        (
          quantity *
            (base +
              extraKg *
                extraPrice) +
          receivingTotal
        ).toFixed(2)
      );

      const payload = {
        client_id: p.client_id,
        product_id: p.product_id,
        shipment_date: p.shipment_date,
        quantity,
        tariff_type:
          p.tariff_type || "shipment",
        unit_price_rub: base,
        total_rub: total,
        status: p.status || "active",
        note: p.note || null,
        created_by:
          session?.user?.id || null,
        weight_kg: weight,
        base_unit_price_rub: base,
        included_weight_kg: included,
        extra_kg_price_rub: extraPrice,
        extra_kg_rub: extraTotal,
        receiving_enabled:
          receivingEnabled,
        receiving_unit_price_rub:
          receivingPrice,
        receiving_total_rub:
          receivingTotal,
      };

      const { data, error } = await supabase
        .from("shipments")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setShipments((x) => [data, ...x]);

      closeModal();
      showToast("Отгрузка добавлена.");
    } catch (e) {
      showError(e);
    }
  };

  const addStorage = async (p) => {
    try {
      if (!p.client_id)
        throw new Error("Выберите клиента.");

      if (!p.start_date || !p.end_date)
        throw new Error(
          "Укажите период хранения."
        );

      if (p.end_date < p.start_date)
        throw new Error(
          "Дата окончания не может быть раньше даты начала."
        );

      const mode = p.billing_mode || "m3";

      const days = daysBetween(
        p.start_date,
        p.end_date
      );

      const unitCount = Math.max(
        0,
        Number(p.unit_count || 0)
      );

      const volume =
        mode === "unit"
          ? unitCount
          : Number(p.volume_m3 || 0);

      const price =
        mode === "unit"
          ? Number(
              p.price_per_unit_day_rub || 0
            )
          : Number(
              p.price_per_m3_day_rub || 0
            );

      if (volume <= 0) {
        throw new Error(
          mode === "unit"
            ? "Количество единиц должно быть больше нуля."
            : "Объём должен быть больше нуля."
        );
      }

      if (
        price < 0 ||
        !Number.isFinite(price)
      ) {
        throw new Error(
          "Тариф должен быть неотрицательным."
        );
      }

      // Existing DB constraint requires:
      // total_rub = volume_m3 * days * price_per_m3_day_rub.

      const total = Number(
        (
          volume *
          days *
          price
        ).toFixed(2)
      );

      const payload = {
        client_id: p.client_id,
        volume_m3: volume,
        start_date: p.start_date,
        end_date: p.end_date,
        tariff_type: "storage",
        price_per_m3_day_rub: price,
        total_rub: total,
        status: p.status || "planned",
        note: [
          mode === "unit"
            ? "Расчёт: за единицу"
            : "Расчёт: за м³",
          p.note || "",
        ]
          .filter(Boolean)
          .join(" · "),
        created_by:
          session?.user?.id || null,
        unit_count:
          mode === "unit"
            ? unitCount
            : 0,
        price_per_unit_day_rub:
          mode === "unit"
            ? price
            : Number(
                p.price_per_unit_day_rub || 0
              ),
      };

      const { data, error } = await supabase
        .from("storage_records")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setStorage((x) => [data, ...x]);

      closeModal();
      showToast("Хранение добавлено.");
    } catch (e) {
      showError(e);
    }
  };

  const updateRequest = async (id, p) => {
    try {
      const status = p.status;

      const payload = {
        status,
        client_id: p.client_id || null,
        internal_note: p.internal_note || null,
        processed_at:
          status === "new"
            ? null
            : new Date().toISOString(),
        processed_by:
          status === "new"
            ? null
            : session?.user?.id || null,
      };

      const { data, error } = await supabase
        .from("cooperation_requests")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setRequests((x) =>
        x.map((r) =>
          r.id === id ? data : r
        )
      );

      showToast("Заявка обновлена.");
    } catch (e) {
      showError(e);
    }
  };

  const closeModal = () => setModal(null);

  const navigate = (p) => {
    setPage(p);
    setMobileOpen(false);
  };

  const clientMap = useMemo(
    () =>
      Object.fromEntries(
        clients.map((x) => [x.id, x])
      ),
    [clients]
  );

  const productMap = useMemo(
    () =>
      Object.fromEntries(
        products.map((x) => [x.id, x])
      ),
    [products]
  );

  const totals = useMemo(
    () => ({
      clients: clients.length,
      products: products.length,
      shipments: shipments.length,
      storage: storage.length,
      shipmentRevenue:
        shipments.reduce(
          (s, x) =>
            s + Number(x.total_rub || 0),
          0
        ),
      storageRevenue:
        storage.reduce(
          (s, x) =>
            s + Number(x.total_rub || 0),
          0
        ),
      requests:
        requests.filter(
          (x) => x.status === "new"
        ).length,
    }),
    [
      clients,
      products,
      shipments,
      storage,
      requests,
    ]
  );

  const nav = [
    ["dashboard", "⌂", "Главная"],
    ["clients", "♙", "Клиенты"],
    ["products", "▦", "Товары"],
    ["shipments", "↗", "Отгрузки"],
    ["storage", "▤", "Хранение"],
    ["tariffs", "₽", "Тарифы"],
    ["requests", "✉", "Заявки"],
    ["reports", "▥", "Отчёты"],
  ];

  if (authLoading)
    return (
      <>
        <style>{CSS}</style>
        <div className="empty">
          Загрузка…
        </div>
      </>
    );

  if (!supabase)
    return (
      <>
        <style>{CSS}</style>
        <div className="empty">
          Не заданы VITE_SUPABASE_URL и
          VITE_SUPABASE_ANON_KEY.
        </div>
      </>
    );

  if (!session)
    return (
      <>
        <style>{CSS}</style>
        <Login />
      </>
    );

  return (
    <>
      <style>{CSS}</style>

      <div className="app">
        {mobileOpen && (
          <div
            className="overlay-nav"
            onClick={() =>
              setMobileOpen(false)
            }
          />
        )}

        <aside
          className={`sidebar ${
            mobileOpen ? "open" : ""
          }`}
        >
          <div className="brand">
            <div className="brand-mark">
              S
            </div>

            <div>
              <div className="brand-title">
                SORTEX
              </div>

              <div className="brand-sub">
                WAREHOUSE SYSTEM
              </div>
            </div>
          </div>

          <div className="nav-label">
            Рабочая зона
          </div>

          <nav className="nav">
            {nav.map(
              ([id, icon, label]) => (
                <button
                  key={id}
                  className={
                    page === id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    navigate(id)
                  }
                >
                  <span className="nav-icon">
                    {icon}
                  </span>

                  {label}
                </button>
              )
            )}
          </nav>

          <div className="sidebar-bottom">
            <div className="user-card">
              <div className="small muted">
                Пользователь
              </div>

              <div className="user-email">
                {session.user?.email ||
                  "—"}
              </div>

              <button
                className="button"
                style={{
                  width: "100%",
                  marginTop: 10,
                }}
                onClick={() =>
                  supabase.auth.signOut()
                }
              >
                Выйти
              </button>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div>
              <button
                className="button mobile-menu"
                onClick={() =>
                  setMobileOpen(true)
                }
              >
                ☰ Меню
              </button>

              <div className="page-title">
                {nav.find(
                  (x) => x[0] === page
                )?.[2] || "SORTEX"}
              </div>

              <div className="page-subtitle">
                Управление складом,
                клиентами, отгрузками и
                тарифами
              </div>
            </div>

            <div className="top-actions">
              <button
                className="button"
                onClick={loadAll}
                disabled={loading}
              >
                {loading
                  ? "Обновление…"
                  : "↻ Обновить"}
              </button>

              {page === "clients" && (
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({
                      type: "client",
                    })
                  }
                >
                  + Клиент
                </button>
              )}

              {page === "products" && (
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({
                      type: "product",
                    })
                  }
                >
                  + Товар
                </button>
              )}

              {page === "shipments" && (
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({
                      type: "shipment",
                    })
                  }
                >
                  + Отгрузка
                </button>
              )}

              {page === "storage" && (
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({
                      type: "storage",
                    })
                  }
                >
                  + Хранение
                </button>
              )}

              {page === "tariffs" && (
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({
                      type: "tariff",
                    })
                  }
                >
                  + Тариф
                </button>
              )}
            </div>
          </div>

          {page === "dashboard" && (
            <Dashboard
              totals={totals}
              navigate={navigate}
              shipments={shipments}
              requests={requests}
              clientMap={clientMap}
            />
          )}

          {page === "clients" && (
            <Clients
              clients={clients}
              onAdd={() =>
                setModal({
                  type: "client",
                })
              }
            />
          )}

          {page === "products" && (
            <Products
              products={products}
              clientMap={clientMap}
              onAdd={() =>
                setModal({
                  type: "product",
                })
              }
            />
          )}

          {page === "shipments" && (
            <Shipments
              shipments={shipments}
              clientMap={clientMap}
              productMap={productMap}
              onAdd={() =>
                setModal({
                  type: "shipment",
                })
              }
            />
          )}

          {page === "storage" && (
            <Storage
              storage={storage}
              clientMap={clientMap}
              onAdd={() =>
                setModal({
                  type: "storage",
                })
              }
            />
          )}

          {page === "tariffs" && (
            <Tariffs
              tariffs={tariffs}
              clientMap={clientMap}
              productMap={productMap}
            />
          )}

          {page === "requests" && (
            <Requests
              requests={requests}
              clientMap={clientMap}
              clients={clients}
              onUpdate={updateRequest}
            />
          )}

          {page === "reports" && (
            <Reports
              totals={totals}
              clients={clients}
              products={products}
              shipments={shipments}
              storage={storage}
              clientMap={clientMap}
            />
          )}

          {modal?.type === "client" && (
            <ClientModal
              onClose={closeModal}
              onSave={addClient}
            />
          )}

          {modal?.type === "product" && (
            <ProductModal
              clients={clients}
              onClose={closeModal}
              onSave={addProduct}
            />
          )}

          {modal?.type === "tariff" && (
            <TariffModal
              clients={clients}
              products={products}
              onClose={closeModal}
              onSave={addTariff}
            />
          )}

          {modal?.type === "shipment" && (
            <ShipmentModal
              clients={clients}
              products={products}
              tariffs={tariffs}
              onClose={closeModal}
              onSave={addShipment}
            />
          )}

          {modal?.type === "storage" && (
            <StorageModal
              clients={clients}
              onClose={closeModal}
              onSave={addStorage}
            />
          )}
        </main>
      </div>

      {toast && (
        <div
          className={`toast ${
            toast.error ? "error" : ""
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      const { error } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

      if (error) throw error;
    } catch (x) {
      setError(
        x.message || "Ошибка входа"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <style>{CSS}</style>

      <form
        className="card"
        onSubmit={login}
        style={{
          width: "min(420px,100%)",
          padding: 24,
        }}
      >
        <div className="brand">
          <div className="brand-mark">
            S
          </div>

          <div>
            <div className="brand-title">
              SORTEX
            </div>

            <div className="brand-sub">
              WAREHOUSE SYSTEM
            </div>
          </div>
        </div>

        <h2
          style={{
            margin: "10px 0 5px",
          }}
        >
          Вход
        </h2>

        <div
          className="muted small"
          style={{
            marginBottom: 18,
          }}
        >
          Авторизация через Supabase
        </div>

        <div className="form-grid">
          <div className="field full">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="field full">
            <label>Пароль</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />
          </div>
        </div>

        {error && (
          <div
            className="toast error"
            style={{
              position: "static",
              marginTop: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          className="button primary"
          style={{
            width: "100%",
            marginTop: 16,
          }}
          disabled={busy}
        >
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({
  totals,
  navigate,
  shipments,
  requests,
  clientMap,
}) {
  const recent = [...shipments]
    .sort((a, b) =>
      String(b.shipment_date).localeCompare(
        String(a.shipment_date)
      )
    )
    .slice(0, 5);

  return (
    <div>
      <div className="grid4">
        <KPI
          label="Клиенты"
          value={number(totals.clients)}
          sub="активные контрагенты"
        />

        <KPI
          label="Товары"
          value={number(totals.products)}
          sub="позиции каталога"
        />

        <KPI
          label="Отгрузки"
          value={number(totals.shipments)}
          sub={money(
            totals.shipmentRevenue
          )}
        />

        <KPI
          label="Новые заявки"
          value={number(totals.requests)}
          sub="требуют внимания"
        />
      </div>

      <div
        className="section card"
        style={{ marginTop: 14 }}
      >
        <div className="section-head">
          <div className="section-title">
            Быстрые действия
          </div>
        </div>

        <div className="section-body">
          <div className="quick">
            <button
              onClick={() =>
                navigate("clients")
              }
            >
              <div className="quick-title">
                Клиенты
              </div>

              <div className="quick-sub">
                Добавить и посмотреть
                клиентов
              </div>
            </button>

            <button
              onClick={() =>
                navigate("products")
              }
            >
              <div className="quick-title">
                Товары
              </div>

              <div className="quick-sub">
                Каталог и характеристики
              </div>
            </button>

            <button
              onClick={() =>
                navigate("shipments")
              }
            >
              <div className="quick-title">
                Отгрузка
              </div>

              <div className="quick-sub">
                Создать операцию
              </div>
            </button>

            <button
              onClick={() =>
                navigate("storage")
              }
            >
              <div className="quick-title">
                Хранение
              </div>

              <div className="quick-sub">
                м³ или за единицу
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="section card">
          <div className="section-head">
            <div className="section-title">
              Последние отгрузки
            </div>

            <button
              className="button"
              onClick={() =>
                navigate("shipments")
              }
            >
              Все
            </button>
          </div>

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
                {recent.length ? (
                  recent.map((x) => (
                    <tr key={x.id}>
                      <td>
                        {formatDate(
                          x.shipment_date
                        )}
                      </td>

                      <td>
                        {clientMap[
                          x.client_id
                        ]?.name || "—"}
                      </td>

                      <td>
                        {number(x.quantity)}
                      </td>

                      <td>
                        {money(
                          x.total_rub
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty">
                        Пока нет отгрузок
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section card">
          <div className="section-head">
            <div className="section-title">
              Заявки
            </div>

            <button
              className="button"
              onClick={() =>
                navigate("requests")
              }
            >
              Открыть
            </button>
          </div>

          <div className="section-body">
            <div className="grid3">
              <KPI
                label="Новые"
                value={
                  requests.filter(
                    (x) =>
                      x.status ===
                      "new"
                  ).length
                }
              />

              <KPI
                label="В работе"
                value={
                  requests.filter(
                    (x) =>
                      x.status ===
                      "in_progress"
                  ).length
                }
              />

              <KPI
                label="Закрытые"
                value={
                  requests.filter(
                    (x) =>
                      x.status ===
                      "closed"
                  ).length
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  sub,
}) {
  return (
    <div className="card kpi">
      <div className="kpi-label">
        {label}
      </div>

      <div className="kpi-value">
        {value}
      </div>

      {sub && (
        <div className="kpi-sub">
          {sub}
        </div>
      )}
    </div>
  );
}

function ListShell({
  title,
  action,
  children,
}) {
  return (
    <div className="section card">
      <div className="section-head">
        <div className="section-title">
          {title}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

function Clients({
  clients,
  onAdd,
}) {
  const [q, setQ] = useState("");

  const rows = clients.filter((x) =>
    [
      x.name,
      x.legal_name,
      x.inn,
      x.phone,
      x.email,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <ListShell
      title={`Клиенты · ${clients.length}`}
      action={
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <input
            className="search"
            placeholder="Поиск…"
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
          />

          <button
            className="button primary"
            onClick={onAdd}
          >
            + Добавить
          </button>
        </div>
      }
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Клиент</th>
              <th>ИНН</th>
              <th>Контакт</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Статус</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.name}</b>

                    <div className="small muted">
                      {x.legal_name || ""}
                    </div>
                  </td>

                  <td>
                    {x.inn || "—"}
                  </td>

                  <td>
                    {x.contact_name ||
                      "—"}
                  </td>

                  <td>
                    {x.phone || "—"}
                  </td>

                  <td>
                    {x.email || "—"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        x.is_active
                          ? "green"
                          : "red"
                      }`}
                    >
                      {x.is_active
                        ? "Активен"
                        : "Неактивен"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty">
                    Ничего не найдено
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

function Products({
  products,
  clientMap,
  onAdd,
}) {
  const [q, setQ] = useState("");

  const rows = products.filter((x) =>
    [
      x.name,
      x.sku,
      clientMap[
        x.client_id
      ]?.name,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <ListShell
      title={`Товары · ${products.length}`}
      action={
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <input
            className="search"
            placeholder="Поиск…"
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
          />

          <button
            className="button primary"
            onClick={onAdd}
          >
            + Добавить
          </button>
        </div>
      }
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Товар</th>
              <th>Клиент</th>
              <th>Размер</th>
              <th>Вес</th>
              <th>Статус</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((x) => (
                <tr key={x.id}>
                  <td>{x.sku}</td>

                  <td>
                    <b>{x.name}</b>
                  </td>

                  <td>
                    {clientMap[
                      x.client_id
                    ]?.name || "—"}
                  </td>

                  <td>
                    {[
                      x.length_cm,
                      x.width_cm,
                      x.height_cm,
                    ].some(
                      (v) => v != null
                    )
                      ? `${x.length_cm || 0} × ${
                          x.width_cm || 0
                        } × ${
                          x.height_cm || 0
                        } см`
                      : "—"}
                  </td>

                  <td>
                    {x.weight_kg != null
                      ? `${number(
                          x.weight_kg
                        )} кг`
                      : "—"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        x.is_active
                          ? "green"
                          : "red"
                      }`}
                    >
                      {x.is_active
                        ? "Активен"
                        : "Неактивен"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty">
                    Ничего не найдено
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

function Shipments({
  shipments,
  clientMap,
  productMap,
  onAdd,
}) {
  return (
    <ListShell
      title={`Отгрузки · ${shipments.length}`}
      action={
        <button
          className="button primary"
          onClick={onAdd}
        >
          + Добавить
        </button>
      }
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Товар</th>
              <th>Кол-во</th>
              <th>Тариф</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>

          <tbody>
            {shipments.length ? (
              shipments.map((x) => (
                <tr key={x.id}>
                  <td>
                    {formatDate(
                      x.shipment_date
                    )}
                  </td>

                  <td>
                    {clientMap[
                      x.client_id
                    ]?.name || "—"}
                  </td>

                  <td>
                    {productMap[
                      x.product_id
                    ]?.name || "—"}
                  </td>

                  <td>
                    {number(x.quantity)}
                  </td>

                  <td>
                    {labelOf(
                      TARIFF_TYPES,
                      x.tariff_type
                    )}
                  </td>

                  <td>
                    {money(x.total_rub)}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        x.status ===
                        "active"
                          ? "green"
                          : "red"
                      }`}
                    >
                      {x.status ===
                      "active"
                        ? "Активна"
                        : "Отменена"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty">
                    Отгрузок пока нет
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

function Storage({
  storage,
  clientMap,
  onAdd,
}) {
  return (
    <ListShell
      title={`Хранение · ${storage.length}`}
      action={
        <button
          className="button primary"
          onClick={onAdd}
        >
          + Добавить
        </button>
      }
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Период</th>
              <th>Расчёт</th>
              <th>Тариф</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>

          <tbody>
            {storage.length ? (
              storage.map((x) => (
                <tr key={x.id}>
                  <td>
                    {clientMap[
                      x.client_id
                    ]?.name || "—"}
                  </td>

                  <td>
                    {formatDate(
                      x.start_date
                    )}{" "}
                    —{" "}
                    {formatDate(
                      x.end_date
                    )}
                  </td>

                  <td>
                    {x.unit_count > 0
                      ? `${number(
                          x.unit_count
                        )} ед.`
                      : `${number(
                          x.volume_m3
                        )} м³`}
                  </td>

                  <td>
                    {money(
                      x.unit_count > 0
                        ? x.price_per_unit_day_rub
                        : x.price_per_m3_day_rub
                    )}{" "}
                    / день
                  </td>

                  <td>
                    {money(x.total_rub)}
                  </td>

                  <td>
                    <span className="badge gold">
                      {labelOf(
                        STORAGE_STATUSES,
                        x.status
                      )}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty">
                    Записей хранения пока
                    нет
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

function Tariffs({
  tariffs,
  clientMap,
  productMap,
}) {
  return (
    <ListShell
      title={`Тарифы · ${tariffs.length}`}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Тип</th>
              <th>Клиент</th>
              <th>Товар</th>
              <th>Цена</th>
              <th>Включено</th>
              <th>Доп. кг</th>
              <th>Срок</th>
            </tr>
          </thead>

          <tbody>
            {tariffs.length ? (
              tariffs.map((x) => (
                <tr key={x.id}>
                  <td>
                    {labelOf(
                      SERVICE_TYPES,
                      x.service_type
                    )}
                  </td>

                  <td>
                    {clientMap[
                      x.client_id
                    ]?.name || "—"}
                  </td>

                  <td>
                    {x.product_id
                      ? productMap[
                          x.product_id
                        ]?.name || "—"
                      : "Общий"}
                  </td>

                  <td>
                    {money(x.price_rub)}
                  </td>

                  <td>
                    {x.included_weight_kg ??
                      "—"}{" "}
                    кг
                  </td>

                  <td>
                    {money(
                      x.extra_kg_price_rub
                    )}
                  </td>

                  <td>
                    {formatDate(
                      x.effective_from
                    )}

                    {x.effective_to
                      ? ` — ${formatDate(
                          x.effective_to
                        )}`
                      : ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty">
                    Тарифов пока нет
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

function Requests({
  requests,
  clientMap,
  clients,
  onUpdate,
}) {
  return (
    <ListShell
      title={`Заявки · ${requests.length}`}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Имя</th>
              <th>Компания</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>

          <tbody>
            {requests.length ? (
              requests.map((x) => (
                <RequestRow
                  key={x.id}
                  row={x}
                  clients={clients}
                  clientMap={clientMap}
                  onUpdate={onUpdate}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty">
                    Заявок пока нет
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

function RequestRow({
  row,
  clients,
  onUpdate,
}) {
  const [status, setStatus] =
    useState(row.status);

  const [client, setClient] =
    useState(row.client_id || "");

  const [note, setNote] =
    useState(row.internal_note || "");

  return (
    <tr>
      <td>
        {formatDate(row.created_at)}
      </td>

      <td>
        <b>{row.name}</b>

        <div className="small muted">
          {row.email || ""}
        </div>
      </td>

      <td>
        {row.company_name || "—"}
      </td>

      <td>{row.phone}</td>

      <td>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          {REQUEST_STATUSES.map(
            (x) => (
              <option
                key={x.value}
                value={x.value}
              >
                {x.label}
              </option>
            )
          )}
        </select>
      </td>

      <td>
        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          <select
            value={client}
            onChange={(e) =>
              setClient(e.target.value)
            }
          >
            <option value="">
              Без клиента
            </option>

            {clients.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>
            ))}
          </select>

          <button
            className="button"
            onClick={() =>
              onUpdate(row.id, {
                status,
                client_id: client,
                internal_note: note,
              })
            }
          >
            Сохранить
          </button>
        </div>
      </td>
    </tr>
  );
}

function Reports({
  totals,
  clients,
  products,
  shipments,
  storage,
  clientMap,
}) {
  return (
    <div>
      <div className="grid3">
        <KPI
          label="Выручка отгрузок"
          value={money(
            totals.shipmentRevenue
          )}
        />

        <KPI
          label="Хранение"
          value={money(
            totals.storageRevenue
          )}
        />

        <KPI
          label="Всего операций"
          value={number(
            shipments.length +
              storage.length
          )}
        />
      </div>

      <div
        className="section card"
        style={{ marginTop: 14 }}
      >
        <div className="section-head">
          <div className="section-title">
            Экспорт
          </div>
        </div>

        <div className="section-body">
          <div className="top-actions">
            <button
              className="button"
              onClick={() =>
                downloadCSV(
                  "clients.csv",
                  clients.map((x) => ({
                    name: x.name,
                    inn: x.inn,
                    phone: x.phone,
                    email: x.email,
                  }))
                )
              }
            >
              Клиенты CSV
            </button>

            <button
              className="button"
              onClick={() =>
                downloadCSV(
                  "products.csv",
                  products.map((x) => ({
                    sku: x.sku,
                    name: x.name,
                    client:
                      clientMap[
                        x.client_id
                      ]?.name,
                  }))
                )
              }
            >
              Товары CSV
            </button>

            <button
              className="button"
              onClick={() =>
                downloadCSV(
                  "shipments.csv",
                  shipments.map((x) => ({
                    date:
                      x.shipment_date,
                    client:
                      clientMap[
                        x.client_id
                      ]?.name,
                    quantity:
                      x.quantity,
                    total:
                      x.total_rub,
                    status:
                      x.status,
                  }))
                )
              }
            >
              Отгрузки CSV
            </button>

            <button
              className="button"
              onClick={() =>
                downloadCSV(
                  "storage.csv",
                  storage.map((x) => ({
                    start:
                      x.start_date,
                    end:
                      x.end_date,
                    client:
                      clientMap[
                        x.client_id
                      ]?.name,
                    units:
                      x.unit_count,
                    volume_m3:
                      x.volume_m3,
                    total:
                      x.total_rub,
                  }))
                )
              }
            >
              Хранение CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  onSave,
  busy = false,
}) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">
            {title}
          </div>

          <button
            className="close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="modal-body">
            {children}
          </div>

          <div className="modal-foot">
            <button
              type="button"
              className="button"
              onClick={onClose}
            >
              Отмена
            </button>

            <button
              type="submit"
              className="button primary"
              disabled={busy}
            >
              {busy
                ? "Сохранение…"
                : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientModal({
  onClose,
  onSave,
}) {
  const [p, setP] = useState({
    name: "",
    legal_name: "",
    inn: "",
    contact_name: "",
    phone: "",
    email: "",
    notes: "",
    is_active: true,
  });

  const [busy, setBusy] =
    useState(false);

  const go = async () => {
    setBusy(true);
    await onSave(p);
    setBusy(false);
  };

  return (
    <Modal
      title="Новый клиент"
      onClose={onClose}
      onSave={go}
      busy={busy}
    >
      <div className="form-grid">
        <Field
          label="Название *"
          value={p.name}
          onChange={(v) =>
            setP({
              ...p,
              name: v,
            })
          }
          required
        />

        <Field
          label="Юридическое название"
          value={p.legal_name}
          onChange={(v) =>
            setP({
              ...p,
              legal_name: v,
            })
          }
        />

        <Field
          label="ИНН"
          value={p.inn}
          onChange={(v) =>
            setP({
              ...p,
              inn: v,
            })
          }
        />

        <Field
          label="Контактное лицо"
          value={p.contact_name}
          onChange={(v) =>
            setP({
              ...p,
              contact_name: v,
            })
          }
        />

        <Field
          label="Телефон"
          value={p.phone}
          onChange={(v) =>
            setP({
              ...p,
              phone: v,
            })
          }
        />

        <Field
          label="Email"
          type="email"
          value={p.email}
          onChange={(v) =>
            setP({
              ...p,
              email: v,
            })
          }
        />

        <Field
          label="Заметка"
          textarea
          value={p.notes}
          onChange={(v) =>
            setP({
              ...p,
              notes: v,
            })
          }
        />

        <label className="check">
          <input
            type="checkbox"
            checked={p.is_active}
            onChange={(e) =>
              setP({
                ...p,
                is_active:
                  e.target.checked,
              })
            }
          />

          Активный клиент
        </label>
      </div>
    </Modal>
  );
}

function ProductModal({
  clients,
  onClose,
  onSave,
}) {
  const [p, setP] = useState({
    client_id: "",
    sku: "",
    name: "",
    size_type: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    weight_kg: "",
    notes: "",
    is_active: true,
  });

  const [busy, setBusy] =
    useState(false);

  const go = async () => {
    setBusy(true);
    await onSave(p);
    setBusy(false);
  };

  return (
    <Modal
      title="Новый товар"
      onClose={onClose}
      onSave={go}
      busy={busy}
    >
      <div className="form-grid">
        <SelectField
          label="Клиент *"
          value={p.client_id}
          onChange={(v) =>
            setP({
              ...p,
              client_id: v,
            })
          }
          options={clients.map(
            (c) => ({
              value: c.id,
              label: c.name,
            })
          )}
        />

        <Field
          label="SKU *"
          value={p.sku}
          onChange={(v) =>
            setP({
              ...p,
              sku: v,
            })
          }
        />

        <Field
          label="Название *"
          value={p.name}
          onChange={(v) =>
            setP({
              ...p,
              name: v,
            })
          }
        />

        <SelectField
          label="Тип размера"
          value={p.size_type}
          onChange={(v) =>
            setP({
              ...p,
              size_type: v,
            })
          }
          options={[
            {
              value: "",
              label: "Не задано",
            },
            ...TARIFF_TYPES,
          ]}
        />

        <Field
          label="Длина, см"
          type="number"
          value={p.length_cm}
          onChange={(v) =>
            setP({
              ...p,
              length_cm: v,
            })
          }
        />

        <Field
          label="Ширина, см"
          type="number"
          value={p.width_cm}
          onChange={(v) =>
            setP({
              ...p,
              width_cm: v,
            })
          }
        />

        <Field
          label="Высота, см"
          type="number"
          value={p.height_cm}
          onChange={(v) =>
            setP({
              ...p,
              height_cm: v,
            })
          }
        />

        <Field
          label="Вес, кг"
          type="number"
          value={p.weight_kg}
          onChange={(v) =>
            setP({
              ...p,
              weight_kg: v,
            })
          }
        />

        <Field
          label="Заметка"
          textarea
          value={p.notes}
          onChange={(v) =>
            setP({
              ...p,
              notes: v,
            })
          }
        />

        <label className="check">
          <input
            type="checkbox"
            checked={p.is_active}
            onChange={(e) =>
              setP({
                ...p,
                is_active:
                  e.target.checked,
              })
            }
          />

          Активный товар
        </label>
      </div>
    </Modal>
  );
}

function TariffModal({
  clients,
  products,
  onClose,
  onSave,
}) {
  const [p, setP] = useState({
    client_id: "",
    product_id: "",
    service_type: "shipment",
    price_rub: "",
    included_weight_kg: "1",
    extra_kg_price_rub: "8",
    effective_from: today(),
    effective_to: "",
    notes: "",
    enabled: true,
  });

  const [busy, setBusy] =
    useState(false);

  const go = async () => {
    setBusy(true);
    await onSave(p);
    setBusy(false);
  };

  return (
    <Modal
      title="Новый тариф"
      onClose={onClose}
      onSave={go}
      busy={busy}
    >
      <div className="form-grid">
        <SelectField
          label="Клиент *"
          value={p.client_id}
          onChange={(v) =>
            setP({
              ...p,
              client_id: v,
            })
          }
          options={clients.map(
            (c) => ({
              value: c.id,
              label: c.name,
            })
          )}
        />

        <SelectField
          label="Товар"
          value={p.product_id}
          onChange={(v) =>
            setP({
              ...p,
              product_id: v,
            })
          }
          options={[
            {
              value: "",
              label: "Общий тариф",
            },
            ...products
              .filter(
                (x) =>
                  !p.client_id ||
                  x.client_id ===
                    p.client_id
              )
              .map((x) => ({
                value: x.id,
                label: `${x.sku} — ${x.name}`,
              })),
          ]}
        />

        <SelectField
          label="Услуга *"
          value={p.service_type}
          onChange={(v) =>
            setP({
              ...p,
              service_type: v,
            })
          }
          options={SERVICE_TYPES}
        />

        <Field
          label="Цена, ₽ *"
          type="number"
          step="0.01"
          value={p.price_rub}
          onChange={(v) =>
            setP({
              ...p,
              price_rub: v,
            })
          }
        />

        <Field
          label="Включено, кг"
          type="number"
          step="0.01"
          value={
            p.included_weight_kg
          }
          onChange={(v) =>
            setP({
              ...p,
              included_weight_kg: v,
            })
          }
        />

        <Field
          label="Доп. кг, ₽"
          type="number"
          step="0.01"
          value={
            p.extra_kg_price_rub
          }
          onChange={(v) =>
            setP({
              ...p,
              extra_kg_price_rub: v,
            })
          }
        />

        <Field
          label="Действует с"
          type="date"
          value={p.effective_from}
          onChange={(v) =>
            setP({
              ...p,
              effective_from: v,
            })
          }
        />

        <Field
          label="Действует до"
          type="date"
          value={p.effective_to}
          onChange={(v) =>
            setP({
              ...p,
              effective_to: v,
            })
          }
        />

        <Field
          label="Заметка"
          textarea
          value={p.notes}
          onChange={(v) =>
            setP({
              ...p,
              notes: v,
            })
          }
        />

        <label className="check">
          <input
            type="checkbox"
            checked={p.enabled}
            onChange={(e) =>
              setP({
                ...p,
                enabled:
                  e.target.checked,
              })
            }
          />

          Тариф включён
        </label>
      </div>
    </Modal>
  );
}

function ShipmentModal({
  clients,
  products,
  tariffs,
  onClose,
  onSave,
}) {
  const [p, setP] = useState({
    client_id: "",
    product_id: "",
    shipment_date: today(),
    quantity: "1",
    tariff_type: "shipment",
    base_unit_price_rub: "",
    weight_kg: "0",
    included_weight_kg: "1",
    extra_kg_price_rub: "8",
    receiving_enabled: false,
    receiving_unit_price_rub: "5",
    note: "",
    status: "active",
  });

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {
    if (p.client_id) {
      const t = tariffs.find(
        (x) =>
          x.client_id ===
            p.client_id &&
          x.service_type ===
            "shipment" &&
          x.enabled &&
          (!x.product_id ||
            x.product_id ===
              p.product_id)
      );

      if (t) {
        setP((x) => ({
          ...x,
          base_unit_price_rub:
            String(t.price_rub),
          included_weight_kg:
            String(
              t.included_weight_kg ??
                1
            ),
          extra_kg_price_rub:
            String(
              t.extra_kg_price_rub ??
                8
            ),
        }));
      }
    }
  }, [
    p.client_id,
    p.product_id,
  ]);

  const q = Number(
    p.quantity || 0
  );

  const w = Number(
    p.weight_kg || 0
  );

  const base = Number(
    p.base_unit_price_rub || 0
  );

  const inc = Number(
    p.included_weight_kg || 1
  );

  const extra = Number(
    p.extra_kg_price_rub || 8
  );

  const rp = Number(
    p.receiving_unit_price_rub ||
      5
  );

  const total = Number(
    (
      q *
        (
          base +
          Math.max(w - inc, 0) *
            extra
        ) +
      (p.receiving_enabled
        ? q * rp
        : 0)
    ).toFixed(2)
  );

  const go = async () => {
    setBusy(true);

    await onSave({
      ...p,
      total_rub: total,
      unit_price_rub: base,
      extra_kg_rub: Number(
        (
          q *
          Math.max(w - inc, 0) *
          extra
        ).toFixed(2)
      ),
      receiving_total_rub:
        p.receiving_enabled
          ? Number(
              (
                q * rp
              ).toFixed(2)
            )
          : 0,
    });

    setBusy(false);
  };

  return (
    <Modal
      title="Новая отгрузка"
      onClose={onClose}
      onSave={go}
      busy={busy}
    >
      <div className="form-grid">
        <SelectField
          label="Клиент *"
          value={p.client_id}
          onChange={(v) =>
            setP({
              ...p,
              client_id: v,
              product_id: "",
            })
          }
          options={clients.map(
            (c) => ({
              value: c.id,
              label: c.name,
            })
          )}
        />

        <SelectField
          label="Товар *"
          value={p.product_id}
          onChange={(v) =>
            setP({
              ...p,
              product_id: v,
            })
          }
          options={[
            {
              value: "",
              label: "Выберите товар",
            },
            ...products
              .filter(
                (x) =>
                  !p.client_id ||
                  x.client_id ===
                    p.client_id
              )
              .map((x) => ({
                value: x.id,
                label: `${x.sku} — ${x.name}`,
              })),
          ]}
        />

        <Field
          label="Дата *"
          type="date"
          value={p.shipment_date}
          onChange={(v) =>
            setP({
              ...p,
              shipment_date: v,
            })
          }
        />

        <Field
          label="Количество *"
          type="number"
          min="1"
          value={p.quantity}
          onChange={(v) =>
            setP({
              ...p,
              quantity: v,
            })
          }
        />

        <SelectField
          label="Тип тарифа"
          value={p.tariff_type}
          onChange={(v) =>
            setP({
              ...p,
              tariff_type: v,
            })
          }
          options={TARIFF_TYPES}
        />

        <Field
          label="Базовая цена за единицу, ₽"
          type="number"
          step="0.01"
          value={
            p.base_unit_price_rub
          }
          onChange={(v) =>
            setP({
              ...p,
              base_unit_price_rub:
                v,
            })
          }
        />

        <Field
          label="Вес единицы, кг"
          type="number"
          step="0.01"
          value={p.weight_kg}
          onChange={(v) =>
            setP({
              ...p,
              weight_kg: v,
            })
          }
        />

        <Field
          label="Включено, кг"
          type="number"
          step="0.01"
          value={
            p.included_weight_kg
          }
          onChange={(v) =>
            setP({
              ...p,
              included_weight_kg: v,
            })
          }
        />

        <Field
          label="Доп. кг, ₽"
          type="number"
          step="0.01"
          value={
            p.extra_kg_price_rub
          }
          onChange={(v) =>
            setP({
              ...p,
              extra_kg_price_rub: v,
            })
          }
        />

        <label className="check">
          <input
            type="checkbox"
            checked={
              p.receiving_enabled
            }
            onChange={(e) =>
              setP({
                ...p,
                receiving_enabled:
                  e.target.checked,
              })
            }
          />

          Добавить приёмку
        </label>

        {p.receiving_enabled && (
          <Field
            label="Приёмка за единицу, ₽"
            type="number"
            step="0.01"
            value={
              p.receiving_unit_price_rub
            }
            onChange={(v) =>
              setP({
                ...p,
                receiving_unit_price_rub:
                  v,
              })
            }
          />
        )}

        <div className="total-preview full">
          <div className="total-label">
            Итог к сохранению
          </div>

          <div className="total-value">
            {money(total)}
          </div>
        </div>

        <SelectField
          label="Статус"
          value={p.status}
          onChange={(v) =>
            setP({
              ...p,
              status: v,
            })
          }
          options={
            OPERATION_STATUSES
          }
        />

        <Field
          label="Комментарий"
          textarea
          value={p.note}
          onChange={(v) =>
            setP({
              ...p,
              note: v,
            })
          }
        />
      </div>
    </Modal>
  );
}

function StorageModal({
  clients,
  onClose,
  onSave,
}) {
  const [p, setP] = useState({
    client_id: "",
    billing_mode: "m3",
    volume_m3: "",
    unit_count: "",
    start_date: today(),
    end_date: today(),
    price_per_m3_day_rub: "",
    price_per_unit_day_rub: "",
    status: "planned",
    note: "",
  });

  const [busy, setBusy] =
    useState(false);

  const days =
    p.start_date &&
    p.end_date &&
    p.end_date >= p.start_date
      ? daysBetween(
          p.start_date,
          p.end_date
        )
      : 0;

  const qty =
    p.billing_mode === "unit"
      ? Number(
          p.unit_count || 0
        )
      : Number(
          p.volume_m3 || 0
        );

  const price =
    p.billing_mode === "unit"
      ? Number(
          p.price_per_unit_day_rub ||
            0
        )
      : Number(
          p.price_per_m3_day_rub ||
            0
        );

  const total = Number(
    (
      qty *
      days *
      price
    ).toFixed(2)
  );

  const go = async () => {
    setBusy(true);

    await onSave(p);

    setBusy(false);
  };

  return (
    <Modal
      title="Новое хранение"
      onClose={onClose}
      onSave={go}
      busy={busy}
    >
      <div className="form-grid">
        <SelectField
          label="Клиент *"
          value={p.client_id}
          onChange={(v) =>
            setP({
              ...p,
              client_id: v,
            })
          }
          options={clients.map(
            (c) => ({
              value: c.id,
              label: c.name,
            })
          )}
        />

        <SelectField
          label="Способ расчёта"
          value={p.billing_mode}
          onChange={(v) =>
            setP({
              ...p,
              billing_mode: v,
            })
          }
          options={[
            {
              value: "m3",
              label: "За м³",
            },
            {
              value: "unit",
              label: "За единицу",
            },
          ]}
        />

        {p.billing_mode ===
        "m3" ? (
          <Field
            label="Объём, м³ *"
            type="number"
            step="0.001"
            min="0.001"
            value={p.volume_m3}
            onChange={(v) =>
              setP({
                ...p,
                volume_m3: v,
              })
            }
          />
        ) : (
          <Field
            label="Количество единиц *"
            type="number"
            min="1"
            value={p.unit_count}
            onChange={(v) =>
              setP({
                ...p,
                unit_count: v,
              })
            }
          />
        )}

        <Field
          label={
            p.billing_mode === "m3"
              ? "Цена за м³ / день, ₽"
              : "Цена за единицу / день, ₽"
          }
          type="number"
          step="0.01"
          min="0"
          value={
            p.billing_mode === "m3"
              ? p.price_per_m3_day_rub
              : p.price_per_unit_day_rub
          }
          onChange={(v) =>
            setP(
              p.billing_mode ===
                "m3"
                ? {
                    ...p,
                    price_per_m3_day_rub:
                      v,
                  }
                : {
                    ...p,
                    price_per_unit_day_rub:
                      v,
                  }
            )
          }
        />

        <Field
          label="Дата начала *"
          type="date"
          value={p.start_date}
          onChange={(v) =>
            setP({
              ...p,
              start_date: v,
            })
          }
        />

        <Field
          label="Дата окончания *"
          type="date"
          value={p.end_date}
          onChange={(v) =>
            setP({
              ...p,
              end_date: v,
            })
          }
        />

        <SelectField
          label="Статус"
          value={p.status}
          onChange={(v) =>
            setP({
              ...p,
              status: v,
            })
          }
          options={
            STORAGE_STATUSES
          }
        />

        <div className="total-preview full">
          <div className="total-label">
            Период: {days || 0} дн. ·
            расчёт:{" "}
            {p.billing_mode === "m3"
              ? "м³"
              : "единица"}
          </div>

          <div className="total-value">
            {money(total)}
          </div>
        </div>

        <Field
          label="Комментарий"
          textarea
          value={p.note}
          onChange={(v) =>
            setP({
              ...p,
              note: v,
            })
          }
        />
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  ...rest
}) {
  return (
    <div className="field">
      <label>{label}</label>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          {...rest}
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);
