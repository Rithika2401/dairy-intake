# Production Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide provides step-by-step instructions for deploying the **Dairy Intelligent Document Intake & Decision Hub** to **Render** (Backend API & MySQL) and **Vercel** (React SPA Frontend).

---

## 1. Prerequisites & Prepared Configuration Files

The project has already been configured with deployment manifests:
- **`render.yaml`**: Blueprint for Render backend web service with `/api/v1/health` health checks.
- **`frontend/vercel.json`**: SPA routing rewrite rules for Vercel to ensure React Router paths don't 404 on refresh.
- **Git Repository**: Initialized locally with clean commit history.

---

## 2. Deploying the Backend to Render

### Option A: Via GitHub Connection (Recommended)

1. **Push Code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/dairy-intake-hub.git
   git branch -M main
   git push -u origin main
   ```

2. **Create Render Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
   - Connect your GitHub repository `dairy-intake-hub`.
   - Set **Root Directory**: `backend`
   - Set **Runtime**: `Node`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`

3. **Add MySQL Database on Render / Aiven / Railway**:
   - Create a MySQL instance on Render or an external cloud MySQL provider (e.g. Aiven, Railway, PlanetScale).
   - Note the Database Host, Port, User, Password, and DB Name.
   - Run initial schema migration against the cloud database:
     ```bash
     cd backend
     DB_HOST=<your-cloud-host> DB_USER=<user> DB_PASSWORD=<password> DB_NAME=dairy_hub npm run migrate
     DB_HOST=<your-cloud-host> DB_USER=<user> DB_PASSWORD=<password> DB_NAME=dairy_hub npm run seed
     ```

4. **Configure Backend Environment Variables on Render**:
   In the Render dashboard under **Environment**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `DB_HOST` = `<your-cloud-mysql-host>`
   - `DB_PORT` = `3306`
   - `DB_NAME` = `dairy_hub`
   - `DB_USER` = `<your-cloud-mysql-user>`
   - `DB_PASSWORD` = `<your-cloud-mysql-password>`
   - `JWT_SECRET` = `<generate-secure-random-secret>`
   - `JWT_EXPIRES_IN` = `8h`
   - `GEMINI_API_KEY` = `<your-google-gemini-api-key>`
   - `UPLOAD_DIR` = `./uploads`

5. **Verify Backend Deployment**:
   Once deployed, test your Render URL:
   `https://<your-render-backend-name>.onrender.com/api/v1/health`

---

## 3. Deploying the Frontend to Vercel

### Option A: Via Vercel CLI (Direct Command)

Run from your terminal:

```bash
cd frontend
npx vercel --prod
```

Follow the CLI prompts:
- **Set up and deploy?**: `y`
- **Which scope?**: Choose your Vercel account
- **Link to existing project?**: `n`
- **Project name**: `dairy-intake-hub-frontend`
- **In which directory is your code located?**: `./`

### Option B: Via Vercel Web Dashboard

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `dairy-intake-hub`.
4. Set **Root Directory**: `frontend`
5. Framework Preset: **Vite**
6. Environment Variables:
   - **`VITE_API_BASE_URL`**: `https://<your-render-backend-name>.onrender.com/api/v1`
7. Click **Deploy**.

---

## 4. Verification & Post-Deployment Testing

1. Open your Vercel URL: `https://<your-vercel-app>.vercel.app`
2. Test Login:
   - Email: `reviewer@dairycoop.com`
   - Password: `Password123!`
3. Verify Dashboard stats load live data from your Render API.
4. Test Document Upload, AI Extraction, and Case Decision workflows.
