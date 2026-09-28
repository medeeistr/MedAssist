# MedAssist 🏥

MedAssist is a full-stack web application designed to simplify hospital management and internal operations. It bridges the gap between administrative workflows, medical staff, and human resources in a single, unified platform.

I built this project to combine a clean React frontend, a robust .NET Web API backend, and a PostgreSQL database into a practical, real-world system tailored for medical institutions.

---

## 🚀 Tech Stack
- **Frontend:** React, React Router, modern component styling
- **Backend:** ASP.NET Core Web API (C#)
- **Database:** PostgreSQL with Entity Framework Core

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Custom user permissions mapped out for a hospital hierarchy—supporting Doctors, Department Heads, Nurses, HR, and Support Staff.
- **Surgical and Operational Schedule:** An interactive daily schedule featuring quick date navigation, color-coded department tags for specialties like cardiology, orthopedics, and intensive care, alongside direct access to download patient surgical files.
- **Comprehensive Employee Portal:** A dedicated workspace for hospital personnel featuring:
  - Personal shift tracking and schedule overview.
  - Leave and vacation management.
  - Secure access to salary history, earnings, tax deductions, and financial certificates.
  - Centralized access to important institutional documents and policies.
  - Professional development and mandatory hospital training modules.
  - Performance reviews and self-evaluation tools.

---

## 🛠️ Getting Started Locally

If you want to run or test the project locally, here is the quick setup:

### 1. Database Setup
- Make sure PostgreSQL is running.
- Create a database and update your connection string in `appsettings.json` on the backend.

### 2. Run the Backend (.NET)
```bash
cd MedAssistB
dotnet run
```

### 3. Run the Frontend (React)
```bash
npm install
npm run dev
```

---

## 💡 Highlights and Technical Challenges Solved

- **Data Synchronization** : Aligned complex backend C# models with React state management to handle dynamic JSON responses smoothly.
- **Security** : Integrated authentication with customized database roles to secure clinical and administrative endpoints.
- **UX Focus** : Designed clean, readable interfaces and intuitive workflows tailored for fast-paced hospital environments.

### Built with passion for clean code and practical software solutions.
