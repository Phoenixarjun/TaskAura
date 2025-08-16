# Vercel Environment Variables Setup

## Step 1: Delete All Existing Environment Variables

1. Go to https://vercel.com/naresh-b-as-projects/taskaura/settings/environment-variables
2. Delete ALL existing environment variables

## Step 2: Add New Environment Variables

For each variable below, click "Add New" and set it for **Production**, **Preview**, and **Development**:

### Database Configuration

```
Name: MONGODB_URI
Value: mongodb+srv://Naresh:d0Zch35lT9YCIPiF@cluster0.wkpgkoa.mongodb.net/taskaura?retryWrites=true&w=majority
```

### JWT Configuration

```
Name: JWT_SECRET
Value: taskaura-super-secret-jwt-key-2024-production-ready

Name: JWT_EXPIRES_IN
Value: 7d
```

### Node Environment

```
Name: NODE_ENV
Value: production
```

### Server Configuration

```
Name: PORT
Value: 4000
```

### Rate Limiting Configuration

```
Name: RATE_LIMIT_WINDOW_MS
Value: 900000

Name: RATE_LIMIT_MAX_REQUESTS
Value: 100
```

### Frontend API URL (Optional - for reference)

```
Name: VITE_API_URL
Value: https://taskaura.vercel.app
```

## Step 3: Redeploy

After adding all environment variables, redeploy the application:

```bash
vercel --prod
```

## Step 4: Test

Test the endpoints:

- https://taskaura.vercel.app/test-basic
- https://taskaura.vercel.app/api/auth/login

## Important Notes:

- Make sure NODE_ENV is set to "production" (not "development")
- Make sure JWT_SECRET is the strong value (not the default weak one)
- All variables should be set for Production, Preview, AND Development environments
- After setting variables, you MUST redeploy for changes to take effect
