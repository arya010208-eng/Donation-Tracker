# Donation Tracker 💚

A minimal, full-stack donation tracking web application built as a 45-minute workshop project. Designed with simplicity, clean code, and zero fluff.

---

## 🎯 Architecture & Constraints

| Component | Limit / Constraint | Implementation |
| :--- | :--- | :--- |
| **Frontend Pages** | Max 3 pages | 1. **Auth Page** (OTP Sign In / Registration)<br>2. **Campaigns Page** (Explore causes, progress bars & launch causes)<br>3. **Donations Page** (Make contributions & view live ledger) |
| **Backend APIs** | Max 5 endpoints | 1. `POST /api/auth/send-otp`<br>2. `POST /api/auth/verify-otp`<br>3. `GET /api/campaigns`<br>4. `POST /api/campaigns`<br>5. `POST /api/donations` |
| **Database Models** | Max 3 models | 1. `User`<br>2. `Campaign`<br>3. `Donation` |
| **Authentication** | Passwordless OTP | Powered by **MiniMoth API** (WhatsApp & SMS delivery) |

---

## 🗂️ Project Structure

```text
donation-tracker/
├── backend/
│   ├── data/
│   │   └── db.json          # Lightweight file-based JSON database
│   ├── models/
│   │   ├── User.js          # User entity
│   │   ├── Campaign.js      # Campaign entity
│   │   └── Donation.js      # Donation entity
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Template for environment configuration
│   ├── db.js                # Database read/write utility
│   ├── server.js            # Express API server with 5 endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx   # Top navigation bar
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        # Page 1: MiniMoth OTP Login & Registration
│   │   │   ├── CampaignsPage.jsx   # Page 2: Explore causes & track targets
│   │   │   └── DonationsPage.jsx   # Page 3: Record donations & live activity
│   │   ├── App.jsx          # Root component & page routing
│   │   ├── App.css          # Clean, responsive philanthropic styling
│   │   └── main.jsx         # Vite entrypoint
│   ├── .env                 # Frontend environment variables
│   ├── .env.example         # Frontend environment template
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🔑 MiniMoth OTP Configuration

The application uses [MiniMoth](https://minimoth.dev) for phone-based WhatsApp/SMS OTP authentication.

1. Sign up or log into [MiniMoth](https://minimoth.dev) to get your API Key.
2. In `backend/.env`, set your key:
   ```env
   PORT=5000
   MINIMOTH_API_KEY=mm_live_your_actual_api_key_here
   ```

> **Workshop Demo Mode Note:**
> If you leave `MINIMOTH_API_KEY` with the default test value (`mm_test_demo_key`), the backend operates in **Workshop Demo Mode**. You can enter any 10-digit phone number and verify using the demo OTP `123456` without needing live API credits.

---

## 🚀 Running the Project

### 1. Start the Backend

In the terminal:

```bash
cd backend
npm install
npm start
```
*(On Windows PowerShell, if scripts are restricted, run `npm.cmd start` or `node server.js`)*

Backend will run on **`http://localhost:5000`**.

### 2. Start the Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```
*(On Windows PowerShell, use `npm.cmd run dev` if needed)*

Backend will run on **`http://localhost:5000`** and Frontend on **`http://localhost:3000`**.

> **Windows PowerShell Tip:**
> If you encounter `running scripts is disabled on this system`, run this one-time command in PowerShell:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```


---

## 📡 API Reference (5 Endpoints)

### 1. `POST /api/auth/send-otp`
- **Body**: `{ "phone": "+919876543210" }`
- **Description**: Triggers OTP dispatch via MiniMoth WhatsApp/SMS API.

### 2. `POST /api/auth/verify-otp`
- **Body**: `{ "phone": "+919876543210", "code": "123456", "name": "Jane Doe" }`
- **Description**: Verifies OTP with MiniMoth, registers or logs in user, returns user profile.

### 3. `GET /api/campaigns`
- **Description**: Returns all campaigns with progress totals, aggregate stats, and recent contributions.

### 4. `POST /api/campaigns`
- **Body**: `{ "title": "Winter Clothes Drive", "category": "Community", "targetAmount": 50000, "description": "..." }`
- **Description**: Creates a new campaign with a target goal.

### 5. `POST /api/donations`
- **Body**: `{ "campaignId": "camp_123", "donorName": "Jane Doe", "amount": 1000, "message": "Stay strong!" }`
- **Description**: Records a contribution and updates the campaign's raised amount.

---

## 🛡️ License

MIT License. Designed for workshops and rapid prototyping.

