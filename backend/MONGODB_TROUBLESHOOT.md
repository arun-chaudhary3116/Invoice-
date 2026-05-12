# MongoDB Connection Troubleshooting Guide

## Current Issue

```
❌ MongoDB Connection Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.tf2gjuw.mongodb.net
```

This error occurs when the connection can't reach MongoDB Atlas.

## Fix Checklist

### ✅ Step 1: Check Your Password for Special Characters

If your MongoDB password contains any of these characters, they MUST be URL encoded:

- `@` → `%40`
- `:` → `%3A`
- `#` → `%23`
- `?` → `%3F`
- `/` → `%2F`
- `&` → `%26`
- `=` → `%3D`

**Example:**

```
If password is: Pass@word#123
Should be: Pass%40word%23123
```

### ✅ Step 2: MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster (Cluster0)
3. Go to **Network Access** (left sidebar)
4. Click **"+ ADD IP ADDRESS"**
5. Select **"ALLOW ACCESS FROM ANYWHERE"** (for development)
   - Or add your specific IP: `Your IP`
6. Click Confirm

### ✅ Step 3: Check Database Credentials

1. Click your cluster (Cluster0)
2. Click **"CONNECT"** button
3. Select **"Connect your application"**
4. Copy the full connection string
5. Make sure you're using the correct:
   - **Username**: `arunc3116_db_user`
   - **Password**: Your actual password (URL encoded if needed)
   - **Database name** (if specified)

### ✅ Step 4: Update .env File

Replace your MongoDB URI with the one from Atlas:

```env
MONGODB_URI=mongodb+srv://arunc3116_db_user:YOUR_PASSWORD_HERE@cluster0.tf2gjuw.mongodb.net/?appName=Cluster0
```

### ✅ Step 5: Restart Server

```bash
npm start
```

## Common Passwords Issues

**If your password has `@` symbol:**

```
Original: Pass@123
Encoded:  Pass%40123
Full URI: mongodb+srv://arunc3116_db_user:Pass%40123@cluster0.tf2gjuw.mongodb.net/?appName=Cluster0
```

**If your password has `#` symbol:**

```
Original: Pass#123
Encoded:  Pass%23123
Full URI: mongodb+srv://arunc3116_db_user:Pass%23123@cluster0.tf2gjuw.mongodb.net/?appName=Cluster0
```

## Testing Connection

Once updated, you should see:

```
✅ MongoDB Connected: cluster0.tf2gjuw.mongodb.net
🚀 Server running on http://localhost:5000
Environment: development
```

## Still Having Issues?

Try using MongoDB Compass to test:

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste your full connection string
3. If it connects there, the issue is with your Node.js setup
4. If it fails, the issue is with MongoDB Atlas configuration

---

**What to do next:**

1. Check your password for special characters
2. Verify Network Access is enabled in MongoDB Atlas
3. Update the connection string if needed
4. Restart the server
