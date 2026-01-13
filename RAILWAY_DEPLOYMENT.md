# SecBank CBS V2 - Railway Deployment Guide
# SecBank CBS V2 - Railway 部署指南

This guide will walk you through deploying SecBank CBS V2 on Railway step by step.

本指南将一步一步教您如何在Railway上部署SecBank CBS V2。

---

## Prerequisites / 前提条件

- GitHub account (already have: ✅)
- Railway account (https://railway.app)
- Your domain name (optional but recommended)

---

## Step 1: Create Railway Account / 第1步：创建Railway账户

1. Go to **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with your **GitHub account** (recommended for easy deployment)

---

1. 访问 **https://railway.app**
2. 点击 **"Login"** 或 **"Start a New Project"**
3. 使用您的 **GitHub账户** 登录（推荐，便于部署）

---

## Step 2: Create New Project / 第2步：创建新项目

1. Click **"New Project"** button
2. Select **"Empty Project"**
3. Your project will be created with a random name (you can rename it later)

---

1. 点击 **"New Project"** 按钮
2. 选择 **"Empty Project"**
3. 项目将以随机名称创建（稍后可以重命名）

---

## Step 3: Add PostgreSQL Database / 第3步：添加PostgreSQL数据库

1. In your project, click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait for the database to be provisioned (about 30 seconds)
5. Click on the PostgreSQL service to see connection details

---

1. 在项目中，点击 **"+ New"** 按钮
2. 选择 **"Database"**
3. 选择 **"Add PostgreSQL"**
4. 等待数据库配置完成（约30秒）
5. 点击PostgreSQL服务查看连接详情

**Important: Copy these values / 重要：复制这些值:**
- `DATABASE_URL`
- `PGUSER`
- `PGPASSWORD`
- `PGHOST`
- `PGPORT`
- `PGDATABASE`

---

## Step 4: Deploy Backend Service / 第4步：部署后端服务

1. Click **"+ New"** button again
2. Select **"GitHub Repo"**
3. Find and select **"sting88sting-crypto/secbank-cbs-v3"**
4. When asked for root directory, enter: **`secbank-cbs-backend`**
5. Wait for deployment to start

---

1. 再次点击 **"+ New"** 按钮
2. 选择 **"GitHub Repo"**
3. 找到并选择 **"sting88sting-crypto/secbank-cbs-v3"**
4. 当询问根目录时，输入：**`secbank-cbs-backend`**
5. 等待部署开始

### Configure Backend Environment Variables / 配置后端环境变量

1. Click on the backend service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

| Variable / 变量 | Value / 值 |
|----------------|-----------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (click "Add Reference") |
| `PGUSER` | `${{Postgres.PGUSER}}` |
| `PGPASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `JWT_SECRET` | (generate a random 64-character string) |
| `PORT` | `8080` |

**To generate JWT_SECRET / 生成JWT_SECRET:**
```
openssl rand -base64 48
```
Or use: `SecBankCBSV2ProductionJWTSecretKey2024ChangeThisToYourOwnSecureKey!`

4. Click **"Deploy"** to redeploy with new variables

---

## Step 5: Deploy Frontend Service / 第5步：部署前端服务

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Select the same repo **"sting88sting-crypto/secbank-cbs-v3"**
4. When asked for root directory, enter: **`secbank-cbs-frontend`**

### Configure Frontend Environment Variables / 配置前端环境变量

1. Click on the frontend service
2. Go to **"Variables"** tab
3. Add these variables:

| Variable / 变量 | Value / 值 |
|----------------|-----------|
| `BACKEND_URL` | `${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080` |
| `VITE_API_URL` | `/api/v1` |
| `VITE_USE_MOCK_API` | `false` |

4. Click **"Deploy"** to redeploy

---

## Step 6: Generate Domain / 第6步：生成域名

### For Backend / 后端:
1. Click on backend service
2. Go to **"Settings"** tab
3. Under **"Networking"**, click **"Generate Domain"**
4. Copy the generated URL (e.g., `secbank-backend-xxx.up.railway.app`)

### For Frontend / 前端:
1. Click on frontend service
2. Go to **"Settings"** tab
3. Under **"Networking"**, click **"Generate Domain"**
4. This will be your main access URL!

---

## Step 7: Connect Custom Domain (Optional) / 第7步：连接自定义域名（可选）

If you have your own domain:

1. Click on frontend service
2. Go to **"Settings"** → **"Networking"**
3. Click **"+ Custom Domain"**
4. Enter your domain (e.g., `cbs.yourdomain.com`)
5. Add the CNAME record to your DNS:
   - Type: `CNAME`
   - Name: `cbs` (or your subdomain)
   - Value: (Railway will provide this)

---

## Step 8: Initialize Database / 第8步：初始化数据库

The database tables will be created automatically when the backend starts (thanks to `ddl-auto: update`).

To add initial data, you can:

1. Connect to Railway PostgreSQL using the connection details
2. Run the SQL script from `database/schema_administration.sql`

**Using Railway CLI / 使用Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to your project
railway link

# Open PostgreSQL shell
railway connect postgres
```

Then run:
```sql
-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, email, full_name, status, created_at, updated_at)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin@secbank.ph', 'System Administrator', 'ACTIVE', NOW(), NOW());
```

---

## Step 9: Test Your Deployment / 第9步：测试部署

1. Open your frontend URL in browser
2. You should see the login page
3. Login with:
   - Username: `admin`
   - Password: `admin123`

---

## Troubleshooting / 故障排除

### Backend won't start / 后端无法启动
- Check **"Deployments"** tab for error logs
- Verify DATABASE_URL is correctly set
- Make sure PostgreSQL service is running

### Frontend shows blank page / 前端显示空白
- Check browser console for errors
- Verify BACKEND_URL is correct
- Check if backend is healthy

### Database connection failed / 数据库连接失败
- Verify all PG* variables are set
- Check if PostgreSQL service is running
- Try redeploying the backend

---

## Cost Estimation / 费用估算

Railway offers:
- **Free tier**: $5 credit/month (enough for testing)
- **Hobby plan**: $5/month (recommended for production)
- **Pro plan**: $20/month (for larger workloads)

Estimated monthly cost for SecBank CBS:
- PostgreSQL: ~$5-10
- Backend: ~$5-10
- Frontend: ~$2-5
- **Total: ~$12-25/month**

---

## Support / 支持

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/sting88sting-crypto/secbank-cbs-v3/issues

---

**Congratulations! Your SecBank CBS V2 is now live! 🎉**
**恭喜！您的SecBank CBS V2现已上线！🎉**
