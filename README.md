# Secure Multi-Tenant Task Management System

A production-ready, full-stack project management application designed for seamless task tracking, contextual organization, and performance analytics. Built with a robust decoupled architecture, this platform enables users to isolate data across custom namespaces (Projects) while maintaining granular task metrics (Priority & Status Tracking).

---

## 🛠️ Technology Stack & Architecture

The application is structured as a decoupled monorepos/polyrepo dividing client interactions from backend computational nodes:

### 1. Frontend Layer (Client Workspace)
* **Framework:** React.js (Vite Build Pipeline)
* **Routing Control:** React Router DOM
* **State Management:** Functional Hooks (`useState`, `useEffect`)
* **Styling Engine:** Semantic CSS3 Variables with absolute fluid design architecture.

### 2. Backend Middleware Layer (API Router Gateway)
* **Runtime Environment:** Node.js
* **Server Framework:** Express.js 
* **Protocol & Architecture:** RESTful API Guidelines with stateless JSON payloads.

### 3. Database & Identity Tier (Cloud Infrastructure)
* **Database Cluster:** Supabase (PostgreSQL Platform Engine)
* **Authentication Engine:** Cryptographically signed JSON Web Tokens (JWT).
* **Security Controls:** Strict Relational Foreign Key Integrity Constraints with relational cascading deletes.

---

## 🚀 Core Features & Business Logic

* **Cryptographic Session Isolation:** Users authenticate securely via JWT. The application interceptors apply a global route-guard checking network traffic permissions. Expired sessions automatically force a re-authentication handshake redirection.
* **Multi-Tenant Scoping (Projects namespaces):** Tasks do not sit loosely in a global space; they are strongly partitioned by unique Project IDs owned by specific user accounts.
* **Granular Lifecycle Tracking:** Supports tracking items with multi-state criteria:
  * **Priority Matrix:** `Low` | `Medium` | `High`
  * **Operational Status:** `Pending` | `In Progress` | `Completed`
* **Smart Priority Tag Parser:** The front-end interface includes an intelligent inline extraction tool. Adding `#high`, `#mid`, or `#low` anywhere inside a task input automatically sets the database priority enum while cleaning the string payload before storage.

---

## 📋 Pre-requisites & Installation Sequence

### System Requirements
* Node.js (v16.x or higher)
* npm (v8.x or higher)
* A registered Supabase project instance

### 1. Repository Core Configuration
Clone the project space down to your local developer workspace:
```bash
git clone <your-repository-url>
cd task-manager-app
2. Backend Middleware Setup
Navigate to the server core and provision local environmental variables:

Bash
cd backend
npm install
Create a file named .env in the root of your backend/ directory:

Code snippet
PORT=5000
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
Spin up the network listening port:

Bash
npm start
3. Frontend Workspace Setup
Open a secondary terminal process and initiate the user interface view development engine:

Bash
cd ../frontend
npm install
npm run dev
🔒 Security Practices Built-In
Header Inspection Middleware: All incoming requests targeting tasks or projects are put through an validation check that strips the Bearer token from the standard HTTP Authorization header.

Cascade Delete Protections: If a parent workspace domain project is destroyed, the downstream PostgreSQL pipeline triggers a automated sweep, dropping child task rows immediately to avoid orphaned structural remnants in your database tables.

ARCHITECTURE DIAGRAM

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/51b964bf-e405-4ea6-a807-0f07637fb997" />

DATABASE SCHEMA / ER DIAGRAM

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/a99ab7f1-814d-454e-a15b-9fe22d40fffc" />

---

## 2. API Documentation

All application route contexts require a valid JSON Web Token passed inside the HTTP request headers layer.

### Authentication Header Requirement
```http
Authorization: Bearer <your_supabase_jwt_token>
Content-Type: application/json
Endpoints Ledger
A. Projects Scope
GET /api/projects

Description: Retrieves all project scopes owned by the authenticated request user context.

Response (200 OK):

JSON
[
  {
    "id": "p101-uuid",
    "name": "Core Engine",
    "description": "Primary backend microservices routing engine",
    "user_id": "user-uuid-999"
  }
]
POST /api/projects

Description: Provisions a new standalone project workspace container.

Payload Specification:

JSON
{
  "name": "Frontend Dashboard",
  "description": "Client facing telemetry viewport layout"
}
Response (201 Created): Returns the newly appended project row database object.

DELETE /api/projects/:id

Description: Drops a project layout frame along with all its children records via database cascade structures.

Response (200 OK): {"message": "Project dropped successfully"}

B. Tasks Operations Matrix
GET /api/projects/:id/tasks

Description: Pulls all operational task nodes tied to a specific project identifier.

Response (200 OK):

JSON
[
  {
    "id": "t202-uuid",
    "project_id": "p101-uuid",
    "title": "Fix API Router Guard Loop",
    "priority": "High",
    "status": "Pending",
    "user_id": "user-uuid-999"
  }
]
POST /api/tasks

Description: Spawns a new task operational record. Accommodates inline tag extraction models (#high, #mid, #low).

Payload Specification:

JSON
{
  "title": "Refactor auth hook engine",
  "project_id": "p101-uuid",
  "priority": "High",
  "status": "Pending"
}
Response (201 Created): Returns the generated task row map.

PUT /api/tasks/:id

Description: Alters task metrics dynamically (such as toggling progress status state between Pending and Completed).

Payload Specification: {"status": "Completed"}

Response (200 OK): Updates the row records safely.

3. System Architecture & Setup Guide
Core Tech Stack
Frontend Client Workspace: React (Vite environment Context), CSS3 Variables architecture.

Middleware Core Engine: Node.js, Express REST Framework routing.

Data Tier & Identity Ledger: Supabase, PostgreSQL Cluster infrastructure, Native JWT validation.

