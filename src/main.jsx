import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setLoading(false);
  }

  if (loading) {
    return <div style={styles.center}>Загрузка...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <Clients />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Неверный email или пароль");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>SORTEX WMS</h1>
        <p style={styles.subtitle}>Система учета склада</p>

        <form onSubmit={handleLogin}>
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

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Не удалось загрузить клиентов");
      console.error(error);
    } else {
      setClients(data || []);
    }

    setLoading(false);
  }

  function openClient(client) {
    setSelectedClient(client);
    setName(client.name || "");
    setContact(client.contact_name || "");
    setPhone(client.phone || "");
    setError("");
    setShowForm(false);
  }

  function openNewClient() {
    setSelectedClient(null);
    setName("");
    setContact("");
    setPhone("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setSelectedClient(null);
    setName("");
    setContact("");
    setPhone("");
    setError("");
  }

  async function saveClient(event) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Введите название клиента");
      return;
    }

    setSaving(true);

    if (selectedClient) {
      const { error } = await supabase
        .from("clients")
        .update({
          name: name.trim(),
          contact_name: contact.trim() || null,
          phone: phone.trim() || null,
        })
        .eq("id", selectedClient.id);

      if (error) {
        setError("Не удалось сохранить изменения");
        console.error(error);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("clients").insert({
        name: name.trim(),
        contact_name: contact.trim() || null,
        phone: phone.trim() || null,
      });

      if (error) {
        setError("Не удалось добавить клиента");
        console.error(error);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeForm();
    await loadClients();
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const filteredClients = clients.filter((client) => {
    const text = `${client.name || ""} ${
      client.contact_name || ""
    } ${client.phone || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  if (showForm || selectedClient) {
    return (
      <div style={styles.app}>
        <header style={styles.header}>
          <div>
            <div style={styles.logo}>SORTEX WMS</div>
            <div style={styles.headerSubtitle}>
              Система учета склада
            </div>
          </div>

          <button style={styles.logoutButton} onClick={logout}>
            Выйти
          </button>
        </header>

        <main style={styles.main}>
          <button style={styles.backButton} onClick={closeForm}>
            ← Назад к клиентам
          </button>

          <div style={styles.formCard}>
            <h1 style={styles.heading}>
              {selectedClient
                ? "Карточка клиента"
                : "Новый клиент"}
            </h1>

            <p style={styles.muted}>
              {selectedClient
                ? "Редактирование данных клиента"
                : "Добавление нового клиента"}
            </p>

            <form onSubmit={saveClient}>
              <label style={styles.label}>
                Название компании *
              </label>

              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название компании"
                required
              />

              <label style={styles.label}>
                Контактное лицо
              </label>

              <input
                style={styles.input}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Имя контактного лица"
              />

              <label style={styles.label}>Телефон</label>

              <input
                style={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+372 ..."
              />

              {error && <div style={styles.error}>{error}</div>}

              <button
                style={styles.button}
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Сохранение..."
                  : selectedClient
                  ? "Сохранить изменения"
                  : "Создать клиента"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>SORTEX WMS</div>
          <div style={styles.headerSubtitle}>
            Система учета склада
          </div>
        </div>

        <button style={styles.logoutButton} onClick={logout}>
          Выйти
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.heading}>Клиенты</h1>
            <p style={styles.muted}>
              Управление клиентами склада
            </p>
          </div>

          <button style={styles.addButton} onClick={openNewClient}>
            + Добавить клиента
          </button>
        </div>

        <div style={styles.searchCard}>
          <input
            style={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, контакту или телефону..."
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tableCard}>
          {loading ? (
            <p>Загрузка клиентов...</p>
          ) : filteredClients.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyTitle}>
                {clients.length === 0
                  ? "Клиентов пока нет"
                  : "Ничего не найдено"}
              </div>

              <div style={styles.muted}>
                {clients.length === 0
                  ? "Добавьте первого клиента."
                  : "Измените поисковый запрос."}
              </div>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Название</th>
                    <th style={styles.th}>Контактное лицо</th>
                    <th style={styles.th}>Телефон</th>
                    <th style={styles.th}>Действие</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td style={styles.td}>{client.name}</td>

                      <td style={styles.td}>
                        {client.contact_name || "—"}
                      </td>

                      <td style={styles.td}>
                        {client.phone || "—"}
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.editButton}
                          onClick={() => openClient(client)}
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
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  title: {
    margin: 0,
    textAlign: "center",
    fontSize: "30px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },

  app: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    background: "#111827",
    color: "#ffffff",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  logo: {
    fontSize: "22px",
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: "13px",
    opacity: 0.7,
    marginTop: "3px",
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  heading: {
    margin: 0,
    fontSize: "30px",
  },

  muted: {
    color: "#6b7280",
    marginTop: "6px",
  },

  addButton: {
    border: "none",
    borderRadius: "8px",
    padding: "13px 18px",
    background: "#111827",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  backButton: {
    border: "none",
    background: "transparent",
    padding: "0",
    marginBottom: "20px",
    fontSize: "16px",
    cursor: "pointer",
  },

  logoutButton: {
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    padding: "9px 14px",
    background: "transparent",
    color: "#ffffff",
    cursor: "pointer",
  },

  searchCard: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  searchInput: {
    width: "100%",
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  formCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    maxWidth: "700px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },

  editButton: {
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "8px 12px",
    background: "#ffffff",
    cursor: "pointer",
  },

  formTitle: {
    marginTop: 0,
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "13px",
    marginBottom: "18px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
