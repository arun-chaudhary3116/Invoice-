# API Integration Guide

## Migration from localStorage to Backend API

This guide helps you migrate from frontend localStorage to the professional backend database.

---

## Current State

- **Frontend**: Uses localStorage via `store.ts`
- **Backend**: Now has MongoDB collections with REST API

---

## Step 1: Update Frontend API Service

Replace or extend `lib/api.tsx` with proper API calls:

```typescript
const API_BASE = process.env.VITE_API_URL || "http://localhost:3000/api";

// ────────────────────────────────────────
// CLIENTS API
// ────────────────────────────────────────
export const clientsApi = {
  getAll: (params?: { isActive?: boolean; skip?: number; limit?: number }) =>
    fetch(`${API_BASE}/clients?${new URLSearchParams(params as any)}`).then(
      (r) => r.json(),
    ),

  create: (data: Omit<Client, "id" | "createdAt">) =>
    fetch(`${API_BASE}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((r) => r.json()),

  get: (id: string) =>
    fetch(`${API_BASE}/clients/${id}`, { credentials: "include" }).then((r) =>
      r.json(),
    ),

  update: (id: string, data: Partial<Client>) =>
    fetch(`${API_BASE}/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((r) => r.json()),

  delete: (id: string) =>
    fetch(`${API_BASE}/clients/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => r.json()),
};

// ────────────────────────────────────────
// INVOICES API
// ────────────────────────────────────────
export const invoicesApi = {
  getAll: (params?: any) =>
    fetch(`${API_BASE}/invoices?${new URLSearchParams(params)}`).then((r) =>
      r.json(),
    ),

  create: (data: Omit<Invoice, "id" | "createdAt">) =>
    fetch(`${API_BASE}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((r) => r.json()),

  get: (id: string) =>
    fetch(`${API_BASE}/invoices/${id}`, { credentials: "include" }).then((r) =>
      r.json(),
    ),

  update: (id: string, data: Partial<Invoice>) =>
    fetch(`${API_BASE}/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((r) => r.json()),

  send: (id: string) =>
    fetch(`${API_BASE}/invoices/${id}/send`, {
      method: "POST",
      credentials: "include",
    }).then((r) => r.json()),

  delete: (id: string) =>
    fetch(`${API_BASE}/invoices/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => r.json()),

  getStats: () =>
    fetch(`${API_BASE}/invoices/stats/summary`, {
      credentials: "include",
    }).then((r) => r.json()),
};

// ────────────────────────────────────────
// PAYMENTS API
// ────────────────────────────────────────
export const paymentsApi = {
  getAll: (params?: any) =>
    fetch(`${API_BASE}/payments?${new URLSearchParams(params)}`).then((r) =>
      r.json(),
    ),

  create: (data: Omit<Payment, "id" | "createdAt">) =>
    fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((r) => r.json()),

  get: (id: string) =>
    fetch(`${API_BASE}/payments/${id}`, { credentials: "include" }).then((r) =>
      r.json(),
    ),

  update: (id: string, data: Partial<Payment>) =>
    fetch(`${API_BASE}/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then((r) => r.json()),

  delete: (id: string) =>
    fetch(`${API_BASE}/payments/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => r.json()),

  getStats: (params?: any) =>
    fetch(`${API_BASE}/payments/stats/summary?${new URLSearchParams(params)}`, {
      credentials: "include",
    }).then((r) => r.json()),
};
```

---

## Step 2: Update Store to Use API

Replace `lib/store.ts` or create new `lib/server-store.ts`:

```typescript
import { useState, useEffect } from "react";
import { clientsApi, invoicesApi, paymentsApi } from "./api";

// ────────────────────────────────────────
// CLIENTS HOOK
// ────────────────────────────────────────
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await clientsApi.getAll({ isActive: true });
      if (res.ok) setClients(res.data);
      else setError(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const createClient = async (data: Omit<Client, "id" | "createdAt">) => {
    try {
      const res = await clientsApi.create(data);
      if (res.ok) {
        setClients([...clients, res.data]);
        return res.data;
      }
      throw new Error(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      throw err;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      const res = await clientsApi.update(id, data);
      if (res.ok) {
        setClients(clients.map((c) => (c.id === id ? res.data : c)));
        return res.data;
      }
      throw new Error(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const res = await clientsApi.delete(id);
      if (res.ok) {
        setClients(clients.filter((c) => c.id !== id));
        return true;
      }
      throw new Error(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
      throw err;
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
};

// ────────────────────────────────────────
// INVOICES HOOK
// ────────────────────────────────────────
export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoicesApi.getAll();
      if (res.ok) setInvoices(res.data);
      else setError(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const createInvoice = async (data: Omit<Invoice, "id" | "createdAt">) => {
    try {
      const res = await invoicesApi.create(data);
      if (res.ok) {
        setInvoices([...invoices, res.data]);
        return res.data;
      }
      throw new Error(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
  };
};

// Similar hooks for payments...
```

---

## Step 3: Update Components

### Before (localStorage):

```typescript
import { useClients } from "@/lib/store";

function ClientsList() {
  const [clients, setClients] = useClients();

  return (
    <div>
      {clients.map(c => (
        <div key={c.id}>{c.name}</div>
      ))}
    </div>
  );
}
```

### After (API):

```typescript
import { useClients } from "@/lib/server-store";

function ClientsList() {
  const { clients, loading, createClient } = useClients();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {clients.map(c => (
        <div key={c.id}>{c.name}</div>
      ))}
    </div>
  );
}
```

---

## Step 4: Environment Variables

Add to `.env.local`:

```
VITE_API_URL=http://localhost:3000/api
```

---

## Step 5: Test API Endpoints

Using curl:

```bash
# Get all clients
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --cookie "session=YOUR_SESSION"

# Create client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","company":"Acme Corp"}' \
  --cookie "session=YOUR_SESSION"

# Get invoices with stats
curl http://localhost:3000/api/invoices/stats/summary \
  --cookie "session=YOUR_SESSION"
```

---

## Troubleshooting

### CORS Errors

Ensure backend has correct CORS settings in `app.js`:

```javascript
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
  }),
);
```

### Authentication Errors

- Check session cookie is being sent (`credentials: 'include'`)
- Verify user is authenticated before making requests

### Database Errors

- Check MongoDB connection string in `.env`
- Verify indexes are created
- Check user owns the data being accessed (userId filter)

---

## Data Migration Script

To migrate from localStorage to MongoDB:

```javascript
// backend/scripts/migrate.js
import Client from "../src/model/client.model.js";
import Invoice from "../src/model/invoice.model.js";
import connectDB from "../src/config/db.js";

const migrate = async () => {
  await connectDB();

  const userId = "YOUR_USER_ID"; // Get from authenticated user

  // Import from localStorage export
  const localStorageData = JSON.parse(fs.readFileSync("export.json"));

  // Migrate clients
  for (const client of localStorageData.clients) {
    await Client.create({ ...client, userId });
  }

  console.log("Migration complete!");
};

migrate().catch(console.error);
```

---

## Deployment Checklist

- [ ] Update API endpoint URLs
- [ ] Test all CRUD operations
- [ ] Verify authentication flow
- [ ] Check database backups
- [ ] Monitor query performance
- [ ] Set up error logging
- [ ] Test with production database
