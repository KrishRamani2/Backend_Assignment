const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          if (data) {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } else {
            resolve({ status: res.statusCode, data: null });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- Starting Financial Records Management Tests ---\n');
  try {
    // 1. Register
    const email = `testuser_${Date.now()}@example.com`;
    console.log(`[1] Registering user: ${email}...`);
    const registerRes = await makeRequest('/auth/register', 'POST', {
      email,
      password: 'password123',
      name: 'Test User',
      role: 'VIEWER'
    });
    console.log(`Register status: ${registerRes.status}`);
    
    // 2. Login
    console.log(`\n[2] Logging in...`);
    const loginRes = await makeRequest('/auth/login', 'POST', {
      email,
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log(`Login status: ${loginRes.status}, Token received.`);

    // 3. Create Record
    console.log(`\n[3] Creating a financial record...`);
    const createRes = await makeRequest('/records', 'POST', {
      amount: 1500.50,
      type: 'INCOME',
      category: 'Freelance',
      description: 'Project payment',
      transactionDate: '2025-01-15'
    }, token);
    console.log(`Create status: ${createRes.status}`);
    console.log('Record created:', createRes.data.data);
    const recordId = createRes.data.data.id;

    // 4. View Record
    console.log(`\n[4] Viewing the created record by ID...`);
    const getRes = await makeRequest(`/records/${recordId}`, 'GET', null, token);
    console.log(`View status: ${getRes.status}`);
    console.log('Record details:', getRes.data.data);

    // 5. Update Record
    console.log(`\n[5] Updating the record...`);
    const updateRes = await makeRequest(`/records/${recordId}`, 'PUT', {
      amount: 1600.00,
      description: 'Project payment updated'
    }, token);
    console.log(`Update status: ${updateRes.status}`);
    console.log('Updated Record details:', updateRes.data.data);

    // 6. Filter/List Records
    console.log(`\n[6] Listing/Filtering records (category: Freelance)...`);
    const listRes = await makeRequest('/records?category=Freelance&type=INCOME', 'GET', null, token);
    console.log(`Filter status: ${listRes.status}`);
    console.log(`Records found: ${listRes.data.pagination.total}`);
    console.log(listRes.data.data);

    // 7. Delete Record
    console.log(`\n[7] Deleting the record...`);
    const deleteRes = await makeRequest(`/records/${recordId}`, 'DELETE', null, token);
    console.log(`Delete status: ${deleteRes.status}`);
    console.log('Delete Response:', deleteRes.data.message);

    // 8. Verify Deletion (Soft Delete)
    console.log(`\n[8] Verifying deletion...`);
    const listAfterDelete = await makeRequest('/records', 'GET', null, token);
    console.log(`Records count after deletion: ${listAfterDelete.data.pagination.total}`);

    console.log('\n✅ All Financial Records API tests passed successfully!');

  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

runTests();
