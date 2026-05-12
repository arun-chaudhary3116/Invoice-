# Database Schema Documentation

## Overview

Professional MongoDB database schema for invoice management system (Ledgerly). Organizes data into separate collections for better scalability, data integrity, and query performance.

---

## Collections & Models

### 1. **User Collection** (`user.model.js`)

Manages user authentication and profile information.

```
{
  _id: ObjectId
  googleId: String (unique, sparse)
  email: String (unique, required)
  name: String
  nickname: String
  givenName: String
  familyName: String
  avatar: String
  avatarSource: String (enum: ["google", "upload"])
  provider: String (default: "google")
  roles: [String] (default: ["user"])
  isActive: Boolean (default: true)
  lastLoginAt: Date
  createdAt: Date (timestamp)
  updatedAt: Date (timestamp)
}
```

**Indexes:**

- `googleId` (unique, sparse)
- `email` (unique)

---

### 2. **Client Collection** (`client.model.js`)

Stores customer/client information.

```
{
  _id: ObjectId
  userId: ObjectId (ref: User, required, indexed)
  name: String (required)
  email: String (unique per user, required)
  company: String
  phone: String
  address: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  taxId: String
  website: String
  notes: String
  isActive: Boolean (default: true, indexed)
  totalInvoiced: Number (cached sum, default: 0)
  totalPaid: Number (cached sum, default: 0)
  lastInvoiceDate: Date
  createdAt: Date (timestamp)
  updatedAt: Date (timestamp)
}
```

**Indexes:**

- `userId + isActive`
- `email + userId` (unique)
- `createdAt` (descending)

**Virtuals:**

- `outstandingAmount` = totalInvoiced - totalPaid

---

### 3. **Invoice Collection** (`invoice.model.js`)

Manages invoice records with embedded line items.

```
{
  _id: ObjectId
  userId: ObjectId (ref: User, required, indexed)
  clientId: ObjectId (ref: Client, required, indexed)
  invoiceNumber: String (unique, required, indexed)
  status: String (enum: ["draft", "sent", "viewed", "paid", "partial", "overdue", "cancelled"])
  issueDate: Date (required, indexed)
  dueDate: Date (required, indexed)
  items: [
    {
      _id: ObjectId
      description: String (required)
      quantity: Number (required, min: 0.01)
      price: Number (required, min: 0)
      amount: Number (auto-calculated)
    }
  ]
  subtotal: Number (auto-calculated)
  taxRate: Number (0-100, default: 0)
  taxAmount: Number (auto-calculated)
  total: Number (required, auto-calculated)
  paidAmount: Number (default: 0)
  discount: Number (default: 0)
  currency: String (enum: ["USD", "EUR", "GBP", "CAD", "AUD"], default: "USD")
  notes: String
  terms: String
  sentAt: Date
  viewedAt: Date
  reminderSentAt: Date
  lastReminderSentAt: Date
  attachments: [
    {
      url: String
      name: String
      uploadedAt: Date
    }
  ]
  createdAt: Date (timestamp)
  updatedAt: Date (timestamp)
}
```

**Indexes:**

- `userId + status`
- `userId + issueDate` (descending)
- `clientId + userId`
- `dueDate`
- `createdAt` (descending)

**Virtuals:**

- `outstandingAmount` = total - paidAmount
- `daysOverdue` = calculated based on dueDate

---

### 4. **Payment Collection** (`payment.model.js`)

Tracks all payments received for invoices.

```
{
  _id: ObjectId
  userId: ObjectId (ref: User, required, indexed)
  invoiceId: ObjectId (ref: Invoice, required, indexed)
  clientId: ObjectId (ref: Client, required, indexed)
  amount: Number (required, min: 0)
  paymentMethod: String (enum: ["cash", "check", "bank_transfer", "credit_card", "paypal", "other"])
  reference: String
  status: String (enum: ["pending", "completed", "failed", "refunded"], default: "completed", indexed)
  paymentDate: Date (required, indexed)
  notes: String
  receiptUrl: String
  transactionId: String
  createdAt: Date (timestamp)
  updatedAt: Date (timestamp)
}
```

**Indexes:**

- `userId + paymentDate` (descending)
- `invoiceId`
- `clientId + userId`
- `status + paymentDate` (descending)

---

### 5. **ActivityLog Collection** (`activity-log.model.js`)

Audit trail for all system actions.

```
{
  _id: ObjectId
  userId: ObjectId (ref: User, required, indexed)
  action: String (enum: ["invoice_created", "invoice_updated", "invoice_sent", "invoice_viewed", "invoice_paid", "invoice_reminded", "invoice_cancelled", "payment_recorded", "client_created", "client_updated", "client_deleted", "invoice_deleted"])
  entityType: String (enum: ["invoice", "payment", "client", "user"])
  entityId: ObjectId (required)
  entityName: String
  description: String
  changes: Mixed (stores before/after values)
  ipAddress: String
  userAgent: String
  createdAt: Date (timestamp, TTL: 1 year)
}
```

**Indexes:**

- `userId + createdAt` (descending)
- `action + createdAt` (descending)
- `entityType + entityId`
- `createdAt` (descending)
- TTL Index: Auto-delete records older than 1 year

---

## API Endpoints

### Clients

```
GET    /api/clients                    - Get all clients
POST   /api/clients                    - Create client
GET    /api/clients/:id                - Get specific client
PATCH  /api/clients/:id                - Update client
DELETE /api/clients/:id                - Delete client
```

### Invoices

```
GET    /api/invoices                   - Get all invoices
POST   /api/invoices                   - Create invoice
GET    /api/invoices/stats/summary     - Get invoice statistics
GET    /api/invoices/:id               - Get specific invoice
PATCH  /api/invoices/:id               - Update invoice
POST   /api/invoices/:id/send          - Send invoice
DELETE /api/invoices/:id               - Delete invoice
```

### Payments

```
GET    /api/payments                   - Get all payments
POST   /api/payments                   - Record payment
GET    /api/payments/stats/summary     - Get payment statistics
GET    /api/payments/:id               - Get specific payment
PATCH  /api/payments/:id               - Update payment
DELETE /api/payments/:id               - Delete payment
```

---

## Data Relationships

```
User (1:N)
  ├── Clients (1:N)
  │   └── Invoices (1:N)
  │       ├── Items (embedded)
  │       └── Payments (referenced)
  ├── Invoices (1:N)
  ├── Payments (1:N)
  └── ActivityLogs (1:N)
```

---

## Key Features

### ✅ Data Integrity

- Foreign key relationships via ObjectId references
- Unique constraints on email per user
- Required field validation
- Enum validation for status fields

### ✅ Performance

- Strategic indexing on frequently queried fields
- Embedded items array in Invoice (denormalization for read performance)
- Cached totals (totalInvoiced, totalPaid) on Client for quick aggregations
- TTL index on ActivityLog for automatic cleanup

### ✅ Security

- User-based data isolation (userId on every collection)
- Role-based access control (roles array in User)
- Activity audit trail for compliance

### ✅ Scalability

- Separate collections by entity type
- Proper indexing strategy
- Support for pagination
- Optional attachment storage

---

## Migration Notes

If migrating from localStorage:

1. Create User from existing auth session
2. Convert Invoice & Client types from localStorage
3. Map invoices to invoiceNumber (auto-generated as INV-YYYY-####)
4. Create Payment records if tracking was done
5. Generate ActivityLog entries for audit trail

---

## Best Practices

1. **Always include userId** in queries for multi-user systems
2. **Use populate()** cautiously - denormalize frequently accessed data if needed
3. **Update cached fields** (totalInvoiced, totalPaid) when related records change
4. **Monitor indexes** - review slow query logs regularly
5. **Validate input** before database operations
6. **Handle cascading deletes** - cannot delete client with invoices
7. **Use transactions** for operations spanning multiple collections

---

## Example Queries

### Get all invoices for a user by status

```javascript
Invoice.find({ userId, status: "overdue" })
  .populate("clientId", "name email")
  .sort({ dueDate: 1 });
```

### Get payment summary for a date range

```javascript
Payment.aggregate([
  { $match: { userId, paymentDate: { $gte: start, $lte: end } } },
  { $group: { _id: "$paymentMethod", total: { $sum: "$amount" } } },
]);
```

### Get client with invoice stats

```javascript
Client.findById(clientId)
  .lean()
  .then((client) => {
    const invoices = Invoice.find({ clientId, userId });
    return { ...client, invoices };
  });
```
