async function testAPI() {
  const url = document.getElementById('apiUrl').value.trim();
  const schemaInput = document.getElementById('schemaKeys').value.trim();

  // Hide previous results
  document.getElementById('results').style.display = 'none';
  document.getElementById('errorBox').style.display = 'none';

  // Basic validation
  if (!url) {
    showError('Please enter an API URL.');
    return;
  }

  // Parse expected keys
  const expectedKeys = schemaInput
    ? schemaInput.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  try {
    // Call our Python backend
    const response = await fetch('http://127.0.0.1:5000/test-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, expected_keys: expectedKeys })
    });

    const data = await response.json();

    if (data.error) {
      showError(data.error);
      return;
    }

    // Show results section
    document.getElementById('results').style.display = 'block';

    // Status Code
    const statusCode = data.status_code;
    document.getElementById('statusCode').textContent = statusCode;
    const statusCard = document.getElementById('statusCard');
    statusCard.className = 'card ' + (statusCode === 200 ? 'pass' : 'fail');

    // Response Time
    document.getElementById('responseTime').textContent = data.response_time_ms + ' ms';
    const timeCard = document.getElementById('timeCard');
    timeCard.className = 'card ' + (data.response_time_ms < 500 ? 'pass' : 'fail');

    // Schema Validation
    if (data.schema_results && data.schema_results.length > 0) {
      document.getElementById('schemaSection').style.display = 'block';
      const tableBody = document.getElementById('schemaTable');
      tableBody.innerHTML = '';

      data.schema_results.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.key}</td>
          <td class="${item.found ? 'pass-tag' : 'fail-tag'}">
            ${item.found ? '✅ Found' : '❌ Missing'}
          </td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      document.getElementById('schemaSection').style.display = 'none';
    }

    // Raw JSON Output
    document.getElementById('jsonOutput').textContent =
      JSON.stringify(data.json_data, null, 2);

  } catch (err) {
    showError('Could not connect to backend. Make sure app.py is running.');
  }
}

function showError(msg) {
  document.getElementById('errorBox').style.display = 'block';
  document.getElementById('errorMsg').textContent = '⚠️ ' + msg;
}