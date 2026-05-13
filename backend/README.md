# Invoice App - Backend API

A professional REST API built with Node.js, Express, and MongoDB for managing invoices, clients, payments, and more.

## 🚀 Features

- ✅ **User Authentication** - Google OAuth 2.0 & Email/Password signup
- ✅ **Invoice Management** - Create, update, delete invoices with templates
- ✅ **Client Management** - Manage client information and track communications
- ✅ **Payment Tracking** - Record payments and track payment status
- ✅ **Activity Logging** - Audit trail of all user actions
- ✅ **File Uploads** - Cloudinary integration for image uploads
- ✅ **Payment Processing** - Stripe integration for payments
- ✅ **Security** - JWT authentication, password hashing with bcrypt
- ✅ **Email Notifications** - Nodemailer for sending emails
- ✅ **PDF Generation** - PDFKit for invoice PDF generation
- ✅ **Rate Limiting** - Express rate limit for API protection
- ✅ **CORS Support** - Cross-origin resource sharing configured
- ✅ **Data Validation** - Express validator for input validation
- ✅ **Database Security** - Mongo sanitization & XSS protection

## 📋 Tech Stack

| Technology      | Version    | Purpose            |
| --------------- | ---------- | ------------------ |
| **Node.js**     | Latest LTS | JavaScript runtime |
| **Express.js**  | ^4.22.1    | Web framework      |
| **MongoDB**     | 7.8.9      | NoSQL database     |
| **Mongoose**    | ^7.8.9     | MongoDB ODM        |
| **JWT**         | ^9.0.3     | Authentication     |
| **Bcryptjs**    | ^2.4.3     | Password hashing   |
| **Google Auth** | ^2.0.0     | OAuth 2.0          |
| **Stripe**      | ^22.1.1    | Payment processing |
| **Cloudinary**  | ^1.41.3    | Image storage      |
| **Nodemailer**  | ^8.0.7     | Email service      |
| **PDFKit**      | ^0.18.0    | PDF generation     |

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [Cloud: MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- **Git** - [Download](https://github.com/arun-chaudhary3116/Invoice-)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/arun-chaudhary3116/Invoice->
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend root directory and add the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=Cluster0

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_jwt_secret_key_here

# Session (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_session_secret_key_here

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Getting Required API Keys

#### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### MongoDB Setup:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get connection string
6. Replace `<username>`, `<password>` in `MONGODB_URI`

#### Cloudinary Setup:

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret to `.env`

#### Stripe Setup:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Copy Secret Key
3. Create a webhook endpoint for your app
4. Copy Webhook Secret to `.env`

### 5. Database Connection

The app will automatically connect to MongoDB on startup. You'll see:

```
MongoDB connected !! DB HOST: cluster0.mongodb.net
🚀 Server is running at 5000
```

## 🏃 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

This uses **nodemon** to automatically restart the server when files change.

### Production Mode

```bash
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js              # Application entry point
│   ├── app.js                # Express app configuration
│   ├── constant.js           # Application constants
│   │
│   ├── config/               # Configuration files
│   │   ├── db.js             # MongoDB connection
│   │   ├── cloudinary.js     # Cloudinary setup
│   │   ├── stripe.js         # Stripe configuration
│   │   └── passport.js       # Passport authentication
│   │
│   ├── controller/           # Route handlers
│   │   ├── auth.controller.js
│   │   ├── client.controller.js
│   │   ├── invoice.controller.js
│   │   ├── payment.controller.js
│   │   └── activity-log.controller.js
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── requireAuth.js    # JWT verification
│   │   └── upload.js         # File upload handler
│   │
│   ├── model/                # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── client.model.js
│   │   ├── invoice.model.js
│   │   ├── payment.model.js
│   │   └── activity-log.model.js
│   │
│   └── route/                # API routes
│       ├── auth.route.js
│       ├── client.route.js
│       ├── invoice.route.js
│       ├── payment.route.js
│       └── stripe.route.js
│
├── .env                      # Environment variables
├── .env.example              # Example env file
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/signup              - Email/password signup
POST   /api/auth/signin              - Email/password login
POST   /api/auth/google              - Google OAuth login
POST   /api/auth/logout              - Logout user
GET    /api/auth/me                  - Get current user (protected)
PATCH  /api/auth/me                  - Update profile (protected)
```

### Clients

```
GET    /api/clients                  - Get all clients (protected)
POST   /api/clients                  - Create new client (protected)
GET    /api/clients/:id              - Get single client (protected)
PUT    /api/clients/:id              - Update client (protected)
DELETE /api/clients/:id              - Delete client (protected)
```

### Invoices

```
GET    /api/invoices                 - Get all invoices (protected)
POST   /api/invoices                 - Create new invoice (protected)
GET    /api/invoices/:id             - Get single invoice (protected)
PUT    /api/invoices/:id             - Update invoice (protected)
DELETE /api/invoices/:id             - Delete invoice (protected)
POST   /api/invoices/:id/send        - Send invoice (protected)
GET    /api/invoices/:id/pdf         - Generate PDF (protected)
```

### Payments

```
GET    /api/payments                 - Get all payments (protected)
POST   /api/payments                 - Record payment (protected)
GET    /api/payments/:id             - Get payment details (protected)
PUT    /api/payments/:id             - Update payment (protected)
DELETE /api/payments/:id             - Delete payment (protected)
```

### Stripe

```
POST   /api/stripe/connect           - Setup Stripe Connect
POST   /api/stripe/webhook           - Stripe webhook handler
```

### Health Check

```
GET    /                             - Health check endpoint
```

## 🔐 Protected Routes

Routes marked with _(protected)_ require JWT authentication:

1. Add the token to request headers:

```
Authorization: Bearer <your_jwt_token>
```

2. Token is obtained from signup/signin response

## 📝 Environment Variables Explanation

| Variable                | Description                          |
| ----------------------- | ------------------------------------ |
| `PORT`                  | Server port (default: 5000)          |
| `NODE_ENV`              | Environment (development/production) |
| `FRONTEND_URL`          | Frontend URL for CORS                |
| `MONGODB_URI`           | MongoDB connection string            |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID               |
| `JWT_SECRET`            | Secret for JWT signing               |
| `STRIPE_SECRET_KEY`     | Stripe API secret key                |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name              |

## 🚀 Deployment

### Deploy to Render (Recommended)

1. Push code to GitHub
2. Go to [Render.com](https://render.com/)
3. Create new Web Service
4. Connect your GitHub repository
5. Configure environment variables
6. Deploy

```
Build Command: npm install
Start Command: npm start
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add environment variables
heroku config:set MONGODB_URI=<your_mongodb_uri>
heroku config:set JWT_SECRET=<your_jwt_secret>
# ... add other env variables

# Deploy
git push heroku main
```

## 📊 Database Schema

The app uses 6 main collections:

- **users** - User accounts and authentication
- **clients** - Client information
- **invoices** - Invoice records
- **invoice_items** - Line items for invoices
- **payments** - Payment records
- **activity_logs** - Activity audit trail

See `RestAPI-SQL.sql` for SQL schema equivalent.

## 🧪 Testing the API

### Using Postman

1. Import the API collection into Postman
2. Set `{{baseUrl}}` variable to `http://localhost:5000`
3. For protected routes, use the token from signup/signin response

### Using cURL

```bash
# Health check
curl http://localhost:5000/

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Get current user (replace TOKEN with actual token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: MongoDB connection failed
```

**Solution:** Check your `MONGODB_URI` is correct and your IP is whitelisted in MongoDB Atlas.

### Google OAuth Error

```
Error: Invalid Google token
```

**Solution:** Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct.

### CORS Error

```
Error: Cross-Origin-Opener-Policy policy would block the window.postMessage call
```

**Solution:** This is already fixed in `app.js`. Ensure `FRONTEND_URL` is set in `.env`.

### Port Already in Use

```
Error: EADDRINUSE: address already in use :::5000
```

**Solution:** Change PORT in `.env` or kill the process using port 5000:

```bash
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [Stripe Documentation](https://stripe.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, create an issue in the repository or contact the development team.

---

**Happy Coding!** 🎉
