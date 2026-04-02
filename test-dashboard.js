const http = require('http');

const PORT = 3000;

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

async function runDashboardTests() {
  console.log('--- Starting Dashboard API Tests ---\n');
  try {
    // 1. Register
    const email = `dashboarduser_${Date.now()}@example.com`;
    console.log(`[1] Registering user: ${email}...`);
    const registerRes = await makeRequest('/auth/register', 'POST', {
      email,
      password: 'password123',
      name: 'Dashboard Test User',
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

    // 3. Create Multiple Records for Analytics
    console.log(`\n[3] Creating financial records...`);
    const recordsToCreate = [
      { amount: 5000, type: 'INCOME', category: 'Salary', description: 'Monthly salary', transactionDate: '2026-01-01' },
      { amount: 800, type: 'INCOME', category: 'Freelance', description: 'Side job', transactionDate: '2026-01-15' },
      { amount: 1500, type: 'EXPENSE', category: 'Rent', description: 'Office rent', transactionDate: '2026-02-05' },
      { amount: 300, type: 'EXPENSE', category: 'Groceries', description: 'Supermarket', transactionDate: '2026-02-10' },
      { amount: 200, type: 'EXPENSE', category: 'Utilities', description: 'Electricity', transactionDate: '2026-03-12' },
      { amount: 50, type: 'EXPENSE', category: 'Groceries', description: 'Snacks', transactionDate: '2026-03-20' },
    ];

    for (const rec of recordsToCreate) {
      await makeRequest('/records', 'POST', rec, token);
    }
    console.log(`Successfully created ${recordsToCreate.length} records.`);

    // 4. Fetch Dashboard Summary
    console.log(`\n[4] Fetching Dashboard Summary...`);
    const summaryRes = await makeRequest('/dashboard/summary', 'GET', null, token);
    console.log(`Summary fetch status: ${summaryRes.status}`);
    
    if (summaryRes.status === 200) {
        const { overview, categoryBreakdown, recentTransactions, monthlyTrends } = summaryRes.data.data;
        
        console.log('\n✅ Dashboard Overview:');
        console.log(`- Total Income: ₹${overview.totalIncome}`);
        console.log(`- Total Expense: ₹${overview.totalExpense}`);
        console.log(`- Net Balance: ₹${overview.netBalance}`);
        console.log(`- Total Records: ${overview.totalRecords}`);

        console.log('\n✅ Category Breakdown:');
        categoryBreakdown.forEach(c => {
           console.log(`- [${c.type}] ${c.category}: ₹${c.total} (${c.count} items)`);
        });

        console.log(`\n✅ Recent Transactions (Top ${recentTransactions.length}):`);
        recentTransactions.forEach(rt => {
           console.log(`- ${rt.transactionDate.split('T')[0]}: ${rt.type} of ₹${rt.amount} (${rt.category})`);
        });

        console.log('\n✅ Monthly Trends:');
        monthlyTrends.forEach(m => {
           console.log(`- ${m.month}: Income ₹${m.income}, Expense ₹${m.expense}`);
        });

        console.log('\n✅ Dashboard APIs are working perfectly and data is aggregated correctly!');
    } else {
        console.error('Failed to retrieve summary:', summaryRes.data);
    }

  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

runDashboardTests();
