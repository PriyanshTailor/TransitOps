<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/truck.svg" alt="TransitOps Logo" width="120" height="120">
  
  # 🚛 TransitOps
  **Enterprise-Grade AI-Powered Fleet Management System**
  
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat&logo=nodedotjs)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![AI Powered](https://img.shields.io/badge/AI-HuggingFace-yellow.svg?style=flat&logo=huggingface)](https://huggingface.co/)
  
  *TransitOps is a comprehensive, modular, and intelligent platform designed to streamline logistics, optimize operations, and manage fleets with unprecedented efficiency.*
</div>

---

## ✨ Key Features

### 🔐 Advanced Role-Based Access Control (RBAC)
TransitOps provides a highly secure, multi-tenant environment tailored to different operational roles:
* **👑 Super Admin:** Full unrestricted access to all modules, system settings, and global audit logs.
* **🚚 Fleet Manager:** Orchestrate vehicles, trips, maintenance schedules, and fuel logs.
* **🛡️ Safety Officer:** Manage drivers, track safety scores, and handle driver documentation.
* **💰 Financial Analyst:** Oversee revenue, expenses, fuel costs, and generate financial reports.
* **🛣️ Driver:** A focused, distraction-free view featuring assigned trips and an exclusive **Live Telemetry Tracker** (with real-time weather and route visualization).

### 📐 System Architecture
TransitOps employs a modern, decoupled architecture connecting a fast React frontend with a robust Node.js API, powered by a relational PostgreSQL database and external AI services.

```mermaid
graph TD
    Client[("💻 Client (React + Vite)")] -->|REST API & JWT| API["⚙️ API Gateway (Node.js/Express)"]
    API --> DB[("🗄️ Database (PostgreSQL)")]
    API --> AI["🤖 AI Engine (Hugging Face API)"]
    API --> ThirdParty["🌤️ Third-Party Services (Open-Meteo)"]
    
    style Client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style API fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style DB fill:#336791,stroke:#1e3a8a,stroke-width:2px,color:#fff
    style AI fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
```

### 🧠 AI-Powered Automation
* **Intelligent Document OCR:** Automatically extract critical data from uploaded Vehicle Registration Certificates (RCs) and Driver's Licenses using advanced Large Language Models (Qwen2.5-7B-Instruct via Hugging Face). It instantly populates complex forms, reducing manual data entry to zero.
* **Conversational AI Assistant:** A built-in AI chatbot capable of analyzing fleet data and answering complex operational questions.

### 📊 Comprehensive Management Modules
* **Dashboard:** High-level KPIs, real-time metrics, and dynamic 6-month trend charts for revenue, fuel, and expenses.
* **Global Search:** Lightning-fast, unified search across vehicles, drivers, and active trips accessible directly from the top navigation bar.
* **Vehicle & Driver Registry:** Track vehicle health, odometers, capacities, driver safety scores, and compliance metrics.
* **Trip Dispatch Workflow:** Plan trips, assign resources, track expected vs actual revenue, and move trips through a strict status pipeline.
  
  ```mermaid
  stateDiagram-v2
      [*] --> Draft: Create Trip
      Draft --> Assigned: Allocate Driver & Vehicle
      Assigned --> Dispatched: Fleet Manager Approval
      Dispatched --> In_Transit: Driver Departs
      In_Transit --> Completed: Arrived at Destination
      
      state In_Transit {
          [*] --> TelemetryActive
          TelemetryActive --> WeatherUpdates
          TelemetryActive --> RouteTracking
      }
  ```

* **Live Telemetry (Driver Exclusive):** Features a beautiful SVG-based dynamic route map and real-time weather data (via Open-Meteo API) for origin and destination cities.
* **Financials & Maintenance:** Log toll fees, routine maintenance costs, and fuel receipts to calculate true operational profitability.
* **System Audit Logs:** Immutable tracking of critical actions (who did what and when) for ultimate accountability.

### 🗃️ Core Entity Data Model
```mermaid
erDiagram
    COMPANY ||--o{ USERS : employs
    COMPANY ||--o{ VEHICLES : owns
    COMPANY ||--o{ DRIVERS : manages
    USERS }|--|| ROLES : has
    VEHICLES ||--o{ TRIPS : assigned_to
    DRIVERS ||--o{ TRIPS : performs
    TRIPS ||--o{ EXPENSES : incurs

    VEHICLES {
        uuid id PK
        string reg_number
        string model
        string status
    }
    DRIVERS {
        uuid id PK
        string name
        string license_number
        string safety_score
    }
    TRIPS {
        uuid id PK
        string status
        string origin
        string destination
        float revenue
    }
```

---

## 🛠️ Technology Stack

**Frontend:**
- React 18 (Vite)
- React Router DOM
- Recharts (for analytics and charting)
- Lucide React (for beautiful SVG iconography)
- Vanilla CSS with a responsive, modern glassmorphic Dark/Light theme system.

**Backend:**
- Node.js & Express
- PostgreSQL (via `pg` pool)
- `bcrypt` for secure password hashing
- `jsonwebtoken` for secure API authentication
- Hugging Face Inference API (for LLM-based OCR & Chat)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally
- A Hugging Face API Token (for AI features)

### 1. Database Setup
Create a PostgreSQL database named `transitops_db`:
```sql
CREATE DATABASE transitops_db;
```
Run the provided rich seed script to instantly populate the platform with a demo company, realistic historical data, and test accounts:
```bash
cd backend
node run_seed.js
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transitops_db
JWT_SECRET=your_super_secret_jwt_key
HF_TOKEN=your_hugging_face_token
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
In a new terminal, navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Accounts
All demo accounts share the same password: `password123`

| Role | Email |
| :--- | :--- |
| **Super Admin** | `admin@demo.com` |
| **Fleet Manager** | `fleet@demo.com` |
| **Financial Analyst** | `finance@demo.com` |
| **Safety Officer** | `safety@demo.com` |
| **Driver** | `driver@demo.com` |

---

## 📸 Screenshots & Design
TransitOps is designed with a premium, aesthetic focus. It features a custom design system with CSS variables, smooth transitions, interactive hover states, and a beautiful dark mode that is easy on the eyes during long operational shifts.

---

<div align="center">
  <i>Built to keep the world moving.</i>
</div>
