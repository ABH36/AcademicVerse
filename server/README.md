# 🎓 AcademicVerse - The Identity-First Student Hiring Platform

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![PWA](https://img.shields.io/badge/PWA-Supported-purple)
![Security](https://img.shields.io/badge/Security-Identity%20Shield%E2%84%A2-red)

**AcademicVerse** is a next-generation hiring platform that bridges the gap between students and recruiters through verified academic identities. Unlike traditional job boards, AcademicVerse uses an **Identity Trust Engine™** to ensure authenticity, reducing fraud and streamlining the recruitment process.

---

## 🚀 Key Features

### 🛡️ Core Security & Identity
- **Identity Shield™:** Real-time fraud detection, device fingerprinting (IP, User-Agent, Geo-location), and login history tracking.
- **Role-Based Access Control (RBAC):** Distinct ecosystems for **Students**, **Recruiters**, and **Admins**.
- **Secure Auth:** JWT (Rotation strategy), Argon2 Hashing, and Email OTP Verification.
- **Legal Compliance:** Integrated Privacy Policy & Terms of Service (IT Act & GDPR compliant).

### 👨‍🎓 For Students
- **Smart Dashboard:** Overview of applications, profile strength, and academic timeline.
- **Job Board:** Advanced filtering (Remote, Salary, Role) with currency conversion (₹).
- **One-Click Apply:** "Easy Apply" system for verified profiles.
- **Resume Builder:** Auto-generate professional resumes from profile data.
- **Visual Timeline:** Track academic milestones and project history.

### 💼 For Recruiters
- **Recruiter Hub:** Centralized command center for managing job postings.
- **Applicant Tracking System (ATS):** Sort applicants by Trust Score, Skills, and Status.
- **Offer Letter Engine:** Generate and send official offer letters directly via email.
- **Analytics:** View job performance, click rates, and applicant demographics.
- **Subscription Plans:** Tiered access to premium hiring features.

### 📱 Experience
- **Mobile-First Design:** Fully responsive layout with mobile-specific navigation gestures.
- **PWA Support:** Installable as a native app on iOS and Android.
- **Dark Mode:** Sleek, developer-friendly UI with smooth Framer Motion animations.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Framer Motion, Lucide React, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose (Data Modeling) |
| **Security** | Helmet, CORS, Rate Limiting, Argon2, JWT, express-mongo-sanitize |
| **Services** | SendGrid (Emails), Cloudinary (Media), Groq SDK (AI Integration) |
| **DevOps** | GitHub Actions (CI/CD), PWA Manifest |

---

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)
- Git

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/academicverse.git](https://github.com/your-username/academicverse.git)
cd academicverse

2. Backend Setup
cd server
npm install

Create a .env file in the server directory:
Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_super_refresh_secret
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=support@academicverse.com
NODE_ENV=development
CLIENT_URL=http://localhost:5173

Run the Server:
npm run dev

3. Frontend Setup
cd client
npm install
Create a .env file in the client directory:

Code snippet
VITE_API_URL=http://localhost:5000/api

Run the Client:
npm run dev

📂 Project Structure
academicverse/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # Global State (Auth, Theme)
│   │   ├── layouts/        # Mobile vs Desktop Layouts
│   │   ├── pages/          # Main Views (Dashboard, Login, Jobs)
│   │   └── services/       # API Calls (Axios)
│   └── public/             # Assets & PWA Manifest
│
├── server/                 # Express Backend
│   ├── config/             # DB & Swagger Config
│   ├── controllers/        # Route Logic
│   ├── middleware/         # Auth & Error Handling
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   └── utils/              # Helpers (Email, Logger)
└── README.md
📖 API Documentation
The backend includes fully integrated Swagger UI documentation. Once the server is running, visit:

http://localhost:5000/api-docs
🤝 Contributing
Contributions are welcome!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📜 License
Distributed under the MIT License. See LICENSE for more information.

<div align="center"> <p>Built with ❤️ by <strong>Abhishek Jain</strong></p> <p>Protected by <strong>AcademicVerse Identity Shield™</strong></p> </div>