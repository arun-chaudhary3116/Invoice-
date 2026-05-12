# Quick Fix: MongoDB Network Access

## The Problem

```
❌ MongoDB Connection Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.tf2gjuw.mongodb.net
```

This means MongoDB Atlas cannot be reached - network access is blocked.

## The Solution (3 Easy Steps)

### Step 1: Open MongoDB Atlas

Go to: https://cloud.mongodb.com/

### Step 2: Configure Network Access

1. Click your **Organization** (top left) or go to **Clusters**
2. Find **Cluster0** and click it
3. On the left sidebar, look for **"Network Access"** under Security
4. Click **"+ ADD IP ADDRESS"**
5. In the popup:
   - Select: **ALLOW ACCESS FROM ANYWHERE** (for development)
   - Click **"CONFIRM"**

### Step 3: Restart Server

```bash
npm start
```

## Expected Success

You should see:

```
✅ MongoDB Connected: cluster0.tf2gjuw.mongodb.net
🚀 Server running on http://localhost:5000
Environment: development
```

---

**If Still Failing:**

Check if there's a **firewall/VPN** blocking the connection on your computer:

1. Try disabling your VPN if you have one
2. Check if Windows Firewall is blocking Node.js
   - Go to Settings → Firewall → Allow app through firewall
   - Add Node.js if missing

---

**Alternative (Only if Network Access doesn't work):**

Replace connection string format:

```
Before: mongodb+srv://arunc3116_db_user:66cpGR86ieob1KkR@cluster0.tf2gjuw.mongodb.net/?appName=Cluster0

After: mongodb://arunc3116_db_user:66cpGR86ieob1KkR@cluster0.tf2gjuw.mongodb.net/?authSource=admin
```

Then restart server.
