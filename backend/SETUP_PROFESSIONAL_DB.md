# Professional Database Setup Guide

## What Was Built

Your invoice management system now has a **professional MongoDB database architecture** with proper separation of concerns:

### New Collections (Tables)

1. **User** - Authentication & profiles
2. **Client** - Customer information with aggregate totals
3. **Invoice** - Invoice records with embedded line items
4. **Payment** - Payment tracking
5. **ActivityLog** - Audit trail

---

## Quick Start

### 1. Backend Configuration

**Ensure MongoDB is running:**

```bash
# Check your .env has:
MONGODB_URI=mongodb://localhost:27017  # or your MongoDB URL
NODE_ENV=development
```

### 2. Test the API

Start your backend:

```bash
cd backend
npm install
npm run dev
```

Test with curl:

```bash
# 1. First authenticate (see auth endpoints)
curl http://localhost:3000/

# 2. Get all clients
curl http://localhost:3000/api/clients \
  --cookie "session=YOUR_SESSION_ID"

# 3. Create a client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Company",
    "email": "contact@abc.com",
    "company": "ABC Inc",
    "phone": "+1-555-0100"
  }' \
  --cookie "session=YOUR_SESSION_ID"

# 4. Create an invoice
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID_FROM_STEP_3",
    "issueDate": "2024-01-01",
    "dueDate": "2024-02-01",
    "items": [
      {
        "description": "Web Design",
        "quantity": 1,
        "price": 5000
      }
    ],
    "taxRate": 10,
    "notes": "Thank you for your business"
  }' \
  --cookie "session=YOUR_SESSION_ID"
```

---

## Database Schema Overview

### User ↔ Client (1:N)

```
Each user can have multiple clients
- User.id → Client.userId
- Indexed for fast queries
- Email unique per user
```

### Client ↔ Invoice (1:N)

```
Each client can have many invoices
- Client.id → Invoice.clientId
- Client tracks totalInvoiced and totalPaid
- Cannot delete client with invoices
```

### Invoice ↔ Payment (1:N)

```
Each invoice can have multiple payments
- Invoice.id → Payment.invoiceId
- Payment updates Invoice.paidAmount
- Calculates outstanding balance
```

### Audit Trail

```
Every action logged in ActivityLog
- User creates, updates, deletes
- Track all changes for compliance
- Auto-cleanup after 1 year
```

---

## File Structure

```
backend/
├── src/
│   ├── model/
│   │   ├── user.model.js       ✅ User (existing)
│   │   ├── client.model.js     ✅ NEW
│   │   ├── invoice.model.js    ✅ NEW
│   │   ├── payment.model.js    ✅ NEW
│   │   └── activity-log.model.js ✅ NEW
│   ├── controller/
│   │   ├── auth.controller.js  ✅ Auth (existing)
│   │   ├── client.controller.js ✅ NEW
│   │   ├── invoice.controller.js ✅ NEW
│   │   └── payment.controller.js ✅ NEW
│   ├── route/
│   │   ├── auth.route.js       ✅ Auth routes (existing)
│   │   ├── client.route.js     ✅ NEW
│   │   ├── invoice.route.js    ✅ NEW
│   │   └── payment.route.js    ✅ NEW
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── requireAuth.js
│   │   └── upload.js
│   ├── config/
│   ├── app.js                  ✅ UPDATED (new route mounts)
│   └── index.js
├── DATABASE_SCHEMA.md          ✅ NEW - Full schema docs
├── API_INTEGRATION_GUIDE.md    ✅ NEW - Frontend integration
└── package.json

frontend/ or lovable/
└── (Use API_INTEGRATION_GUIDE.md for updating to use backend)
```

---

## API Endpoints Reference

### Clients

```
GET    /api/clients                    List all clients
POST   /api/clients                    Create client
GET    /api/clients/:id                Get client details
PATCH  /api/clients/:id                Update client
DELETE /api/clients/:id                Delete client (no invoices)
```

### Invoices

```
GET    /api/invoices                   List invoices (filterable by status, date)
POST   /api/invoices                   Create invoice
GET    /api/invoices/stats/summary     Get stats (total, paid, pending)
GET    /api/invoices/:id               Get invoice with payments
PATCH  /api/invoices/:id               Update invoice
POST   /api/invoices/:id/send          Mark as sent
DELETE /api/invoices/:id               Delete invoice (no payments)
```

### Payments

```
GET    /api/payments                   List payments
POST   /api/payments                   Record payment
GET    /api/payments/stats/summary     Get payment stats
GET    /api/payments/:id               Get payment details
PATCH  /api/payments/:id               Update payment
DELETE /api/payments/:id               Delete payment
```

---

## Key Features

### ✅ Data Integrity

- Foreign key relationships maintained
- Unique constraints on critical fields
- Cascading update restrictions (can't delete client with invoices)
- Automatic field calculations (subtotal, tax, total)

### ✅ Performance

- Strategic indexes on userId, status, dates
- Embedded items in invoices (no extra queries)
- Cached totals on Client (denormalization for speed)
- Pagination support on all list endpoints

### ✅ Security

- User isolation (every query filtered by userId)
- Activity audit trail
- Session-based authentication
- Protected routes require auth

### ✅ Professional Features

- Invoice number auto-generation (INV-YYYY-####)
- Status tracking (draft → sent → paid/overdue)
- Payment tracking with methods
- Multiple currencies support
- Attachment support (URL storage)
- Notes and terms fields

---

## Example Workflows

### Workflow 1: Create and Send Invoice

```javascript
// 1. Create client
const client = await fetch("/api/clients", {
  method: "POST",
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    company: "Tech Corp",
  }),
});
const clientId = client.data._id;

// 2. Create invoice
const invoice = await fetch("/api/invoices", {
  method: "POST",
  body: JSON.stringify({
    clientId,
    issueDate: "2024-01-01",
    dueDate: "2024-02-01",
    items: [{ description: "Service", quantity: 1, price: 1000 }],
    taxRate: 10,
  }),
});

// 3. Send invoice
await fetch(`/api/invoices/${invoice.data._id}/send`, {
  method: "POST",
});
```

### Workflow 2: Record Payment

```javascript
// 1. Get outstanding invoices
const invoices = await fetch("/api/invoices?status=sent");

// 2. Record payment
const payment = await fetch("/api/payments", {
  method: "POST",
  body: JSON.stringify({
    invoiceId: invoices.data[0]._id,
    amount: 1100, // 1000 + 10% tax
    paymentMethod: "bank_transfer",
    paymentDate: new Date(),
    reference: "TXN-12345",
  }),
});

// Invoice status auto-updates to "paid"
```

### Workflow 3: Get Dashboard Stats

```javascript
// 1. Get invoice stats
const invoiceStats = await fetch("/api/invoices/stats/summary");
// Returns: total, draft, sent, paid, overdue, partial, totalAmount, paidAmount, pendingAmount

// 2. Get payment stats
const paymentStats = await fetch(
  "/api/payments/stats/summary?startDate=2024-01-01&endDate=2024-01-31",
);
// Returns: totalPayments, totalAmount, breakdown by method
```

---

## Migration from localStorage

If you have existing data in localStorage:

1. **Export localStorage data**

   ```javascript
   const backup = {
     clients: JSON.parse(localStorage.getItem("ledgerly_clients")),
     invoices: JSON.parse(localStorage.getItem("ledgerly_invoices")),
   };
   ```

2. **Create script to import** (see API_INTEGRATION_GUIDE.md)

3. **Update frontend** to use new API endpoints (see API_INTEGRATION_GUIDE.md)

4. **Test thoroughly** before deleting localStorage

---

## Common Issues & Solutions

### Issue: "Cannot DELETE client with invoices"

**Solution:** Delete associated invoices first, or use soft delete

```javascript
// Safe delete: mark client as inactive
PATCH /api/clients/:id { "isActive": false }
```

### Issue: "Outstanding amount doesn't match"

**Solution:** Check all payments are recorded

```javascript
// Verify invoice
GET /api/invoices/:id
# Check paidAmount matches sum of payments
```

### Issue: Invoice totals incorrect

**Solution:** Pre-save hook auto-calculates. Ensure items have quantity and price

```javascript
// Each item MUST have quantity and price
{ description: "...", quantity: 1, price: 100 }
```

### Issue: CORS errors when calling from frontend

**Solution:** Check backend CORS in app.js includes your frontend URL

```javascript
origin: ["http://localhost:8080", "http://localhost:5173"];
```

---

## Next Steps

1. **Test the backend APIs** - Use curl or Postman
2. **Update frontend** - Follow API_INTEGRATION_GUIDE.md
3. **Add error handling** - Wrap API calls in try/catch
4. **Implement real-time updates** - Consider WebSockets
5. **Add email notifications** - Send invoice reminders
6. **Set up backups** - Regular MongoDB backups
7. **Monitor performance** - Check query times with indexes

---

## Helpful Commands

```bash
# Test client creation
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","email":"test@example.com"}' \
  --cookie "session=$SESSION_ID"

# List all invoices
curl http://localhost:3000/api/invoices \
  --cookie "session=$SESSION_ID"

# Get invoice statistics
curl http://localhost:3000/api/invoices/stats/summary \
  --cookie "session=$SESSION_ID"

# Record a payment
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "INVOICE_ID",
    "amount": 5500,
    "paymentMethod": "bank_transfer",
    "paymentDate": "2024-01-15",
    "reference": "Payment for INV-001"
  }' \
  --cookie "session=$SESSION_ID"
```

---

## Documentation Files

- **DATABASE_SCHEMA.md** - Detailed field documentation, indexes, relationships
- **API_INTEGRATION_GUIDE.md** - Frontend integration code samples and migration steps
- **This file** - Quick reference and setup guide

---

## Support

For issues:

1. Check MongoDB is running: `mongo` or `mongosh`
2. Verify .env file has correct MONGODB_URI
3. Check backend logs for errors: `npm run dev`
4. Review DATABASE_SCHEMA.md for field requirements
5. Review API_INTEGRATION_GUIDE.md for frontend examples

**You're all set! 🚀**
