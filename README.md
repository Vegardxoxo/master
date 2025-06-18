
# Project Setup Guide

## 📦 Package Manager Setup

This project uses **PNPM**. To get started:

### 1. Install the latest version of PNPM globally:

   ```bash
   npm install -g pnpm@latest-10
   ```

### 2. Install dependencies:

   ```bash
   pnpm install
   ```

---

## 🔐 Personal Access Token Setup

To generate reports and push changes directly to GitHub repositories, you need a Personal Access Token with write permissions.

### 1. Go to https://github.com/settings/personal-access-tokens and generate a fine-grained access token.
### 2. Make sure it has repository write access for the repositories you intend to use.
### 3. Store the token in a `.env` or `.env.local` file at the root of the project.

Example:

```env
SUPER_TOKEN=XXX
```

---

## 🛢️ PostgreSQL Database Setup

This project uses PostgreSQL to store data locally.

### 1. Install PostgreSQL

Download PostgreSQL from:
[https://www.postgresql.org/download/](https://www.postgresql.org/download/)

During installation:
- Create a user (commonly named `postgres`)
- Set a password and remember it

### 2. Create a Database

After installation, open a terminal or pgAdmin and run:

```sql
CREATE DATABASE your_database_name;
```

### 3. Configure Environment Variable

In your `.env` file, add:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/your_database_name
```

Replace `your_password` and `your_database_name` with your actual credentials.

---

## 🧬 Prisma Setup

### 1. Install Prisma

```bash
pnpm install prisma --save-dev
pnpm dlx prisma
```

### 2. Generate Prisma Client

```bash
pnpm dlx prisma generate
```

## 🤖 Ollama + DeepSeek Model Setup

This project uses a locally hosted LLM for commit message evaluation.

### 1. Install Ollama

Follow the instructions here: [https://ollama.com/download](https://ollama.com/download)

### 2. Install Open WebUI (optional but recommended)

Use [Open WebUI](https://github.com/open-webui/open-webui) for a better interface:
### 3. Download the DeepSeek R1 1.5B model

### 4. Create a custom model called `commit-message-analyzer`

Paste in the prompt as found in the appendix in the thesis.

