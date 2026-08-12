import app from './app';
import { Server } from 'http';

const TEST_PORT = 5001;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

// Helper for making requests using native fetch
async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return {
    status: response.status,
    data,
  };
}

async function runTests() {
  console.log('\n--- 🧪 Starting End-to-End API Integration Tests ---\n');

  // Test 1: Welcome Route
  console.log('Test 1: GET Welcome Route...');
  const welcomeRes = await request('/');
  console.log(`Status: ${welcomeRes.status}, Response:`, JSON.stringify(welcomeRes.data), '\n');

  // Generate unique emails for registration
  const timestamp = Date.now();
  const userEmail = `user_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;

  // Test 2: Register User
  console.log('Test 2: Register regular User...');
  const regUserRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'John Doe',
      email: userEmail,
      password: 'password123',
      role: 'USER',
    },
  });
  console.log(`Status: ${regUserRes.status}, Success: ${regUserRes.data.success}, Message: ${regUserRes.data.message}\n`);

  // Test 3: Register Admin
  console.log('Test 3: Register Admin...');
  const regAdminRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'System Admin',
      email: adminEmail,
      password: 'adminpassword',
      role: 'ADMIN',
    },
  });
  console.log(`Status: ${regAdminRes.status}, Success: ${regAdminRes.data.success}, Message: ${regAdminRes.data.message}\n`);

  // Test 4: Login User & Admin
  console.log('Test 4: Logging in both accounts...');
  const loginUserRes = await request('/auth/login', {
    method: 'POST',
    body: { email: userEmail, password: 'password123' },
  });
  const userToken = loginUserRes.data.data.token;
  console.log(`User Logged In! Token: ${userToken.substring(0, 15)}...`);

  const loginAdminRes = await request('/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: 'adminpassword' },
  });
  const adminToken = loginAdminRes.data.data.token;
  console.log(`Admin Logged In! Token: ${adminToken.substring(0, 15)}...\n`);

  // Auth Headers
  const userHeaders = { Authorization: `Bearer ${userToken}` };
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Test 5: Fetch Profile
  console.log('Test 5: GET User /me...');
  const profileRes = await request('/users/me', { headers: userHeaders });
  console.log(`Status: ${profileRes.status}, User ID: ${profileRes.data.data.id}, Name: ${profileRes.data.data.name}\n`);

  // Test 6: Create Category (Admin authorized)
  console.log('Test 6: Create Category (Admin)...');
  const catRes = await request('/categories', {
    method: 'POST',
    headers: adminHeaders,
    body: { name: `Electronics_${timestamp}` },
  });
  const categoryId = catRes.data.data.id;
  console.log(`Status: ${catRes.status}, Category ID: ${categoryId}\n`);

  // Test 7: Create Category (Unauthorized check)
  console.log('Test 7: Create Category (Unauthorized user check)...');
  const unauthorizedCatRes = await request('/categories', {
    method: 'POST',
    headers: userHeaders,
    body: { name: `ShouldFail_${timestamp}` },
  });
  console.log(`Status: ${unauthorizedCatRes.status} (Expected 403), Success: ${unauthorizedCatRes.data.success}\n`);

  // Test 8: Create Product (Admin)
  console.log('Test 8: Create Product (Admin)...');
  const prodRes = await request('/products', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Wireless Headphones',
      description: 'Noise cancelling Bluetooth headphones',
      price: 199.99,
      stock: 50,
      categoryId: categoryId,
    },
  });
  const productId = prodRes.data.data.id;
  console.log(`Status: ${prodRes.status}, Product ID: ${productId}, Stock: ${prodRes.data.data.stock}\n`);

  // Test 9: Get Products (Public)
  console.log('Test 9: GET /products (Public)...');
  const getProdsRes = await request('/products');
  console.log(`Status: ${getProdsRes.status}, Products found: ${getProdsRes.data.data.length}\n`);

  // Test 10: Create Review (User)
  console.log('Test 10: Submit Product Review (User)...');
  const revRes = await request('/reviews', {
    method: 'POST',
    headers: userHeaders,
    body: {
      rating: 5,
      comment: 'Excellent sound quality and long battery life!',
      productId: productId,
    },
  });
  const reviewId = revRes.data.data.id;
  console.log(`Status: ${revRes.status}, Review ID: ${reviewId}, Rating: ${revRes.data.data.rating}\n`);

  // Test 11: Create Order & Verify Stock Decrement
  console.log('Test 11: Create Order for 3 items (User)...');
  const orderRes = await request('/orders', {
    method: 'POST',
    headers: userHeaders,
    body: {
      productId: productId,
      quantity: 3,
    },
  });
  const orderId = orderRes.data.data.id;
  console.log(`Status: ${orderRes.status}, Order ID: ${orderId}, Total Price: ${orderRes.data.data.totalPrice}`);
  
  // Verify product stock is now 47 (50 - 3)
  const checkProductStock = await request(`/products/${productId}`);
  console.log(`Verified Product Stock is now: ${checkProductStock.data.data.stock} (Expected 47)\n`);

  // Test 12: Cancel Order & Verify Stock Restoration (Admin status update to CANCELLED)
  console.log('Test 12: Admin cancels order to test stock restoration...');
  const cancelOrderRes = await request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: { status: 'CANCELLED' },
  });
  console.log(`Status: ${cancelOrderRes.status}, New Status: ${cancelOrderRes.data.data.status}`);
  
  // Verify product stock is restored to 50
  const checkProductStockRestored = await request(`/products/${productId}`);
  console.log(`Verified Product Stock is restored to: ${checkProductStockRestored.data.data.stock} (Expected 50)\n`);

  // Test 13: Soft Delete Product (Admin)
  console.log('Test 13: Soft Delete Product (Admin)...');
  const delProdRes = await request(`/products/${productId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  console.log(`Status: ${delProdRes.status}, isDeleted: ${delProdRes.data.data.isDeleted}`);

  // Verify product is no longer returned in public products list
  const getProdsAfterDeleteRes = await request('/products');
  const found = getProdsAfterDeleteRes.data.data.some((p: any) => p.id === productId);
  console.log(`Product present in listing after soft delete: ${found} (Expected false)\n`);

  console.log('--- 🎉 All Tests Executed. Review the logs above for correctness. ---');
}

// Start Server on test port
let server: Server;
try {
  server = app.listen(TEST_PORT, async () => {
    console.log(`Test Server running on port ${TEST_PORT}...`);
    try {
      await runTests();
    } catch (err) {
      console.error('Test Execution Error:', err);
    } finally {
      console.log('Shutting down Test Server...');
      server.close();
    }
  });
} catch (error) {
  console.error('Failed to start test server:', error);
}
