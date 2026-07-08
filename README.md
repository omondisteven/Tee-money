<!-- README.md Content -->
<h1 align="center">
  <br>
  💰 TeeMoney - Personal Finance Manager
  <br>
</h1>

<h4 align="center">Smart Financial Management at Your Fingertips</h4>

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js" alt="Next.js">
  </a>
  <a href="https://www.prisma.io/">
    <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  </a>
</p>

<p align="center">
  <a href="#-about-teemoney">About</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## 📱 About TeeMoney

**TeeMoney** is a modern, mobile-responsive personal finance management application built with Next.js. It helps you track your income, expenses, budgets, and financial goals with an intuitive and beautiful interface.

The project is live on GitHub: [https://github.com/omondisteven/Tee-money](https://github.com/omondisteven/Tee-money)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **💰 All-in-one Money Tracker** | Record income and daily expenses by category for accurate financial insights |
| **📊 Budget Planner & Tracker** | Set spending limits, monitor budgets, and view progress with charts & graphs |
| **🎯 Savings & Goal Planner** | Track savings growth, set financial goals, and stay motivated |
| **📈 Cash Flow Manager** | Understand your income vs. expenses to improve financial health |
| **⚡ Quick Expense Tracker** | Log daily spending in seconds with a clean, user-friendly interface |
| **🔐 Secure Authentication** | JWT-based authentication with bcrypt password hashing |
| **📱 Mobile-First Design** | Optimized for mobile devices with a responsive layout |

---

## 🚀 Tech Stack

<details>
<summary><b>Frontend</b></summary>

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and graphs
- **React Icons** - Beautiful icon library
</details>

<details>
<summary><b>Backend</b></summary>

- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
</details>

<details>
<summary><b>Libraries & Tools</b></summary>

- **React Hook Form** - Form handling
- **React Toastify** - Toast notifications
- **Zod** - Schema validation
- **React Responsive** - Responsive design utilities
</details>

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/omondisteven/Tee-money.git
   cd Tee-money

2. **Install dependencies**
   ```bash
   npm install

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local

4. *Then edit .env.local with your credentials:*
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/teemoney"
   JWT_SECRET="your-super-secret-jwt-key"

5. **Set up the database**
   ```bash
# Create the database
   createdb teemoney
   
# Push the schema
   npx prisma db push

# Generate Prisma client
  npx prisma generate

# (Optional) Seed the database
  npm run db:seed

6. **Run the development server**
   ```bash
   npm run dev

6. **Open the application**
   Visit http://localhost:3000

**🤝 Contributing**
