const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Connection
MONGODB_URI=mongodb+srv://Naresh:d0Zch35lT9YCIPiF@cluster0.wkpgkoa.mongodb.net/taskaura?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=4000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📁 Location:', envPath);
  console.log('🔧 You can now start the server with: npm start');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  console.log('📝 Please manually create a .env file in the backend directory with the following content:');
  console.log('');
  console.log(envContent);
} 