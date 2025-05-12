(() => {
  const status = document.getElementById('status');
  const sqlInput = document.getElementById('sql-input');
  const runBtn = document.getElementById('run-query');
  const resultDiv = document.getElementById('result');
  const fileInput = document.getElementById('db-file');

  let db = null;
  let SQL = null;

  // Load sql.js library
  status.textContent = 'Loading sql.js...';
  initSqlJs({
    locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/' + file
  }).then(SQLLib => {
    SQL = SQLLib;
    status.textContent = 'sql.js loaded. Please select a SQLite database file.';
    fileInput.disabled = false;
  }).catch(e => {
    status.textContent = 'Failed to load sql.js: ' + e.message;
    fileInput.disabled = true;
    sqlInput.disabled = true;
    runBtn.disabled = true;
  });

  // Handle file selection
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    status.textContent = 'Reading database file...';
    sqlInput.value = '';
    resultDiv.textContent = '';
    sqlInput.disabled = true;
    runBtn.disabled = true;
    reader.onload = function() {
      try {
        const Uints = new Uint8Array(reader.result);
        db = new SQL.Database(Uints);
        status.textContent = `Database loaded: ${file.name}`;
        sqlInput.disabled = false;
        runBtn.disabled = false;
        sqlInput.focus();
      } catch (err) {
        status.textContent = 'Error loading database: ' + err.message;
        db = null;
        sqlInput.disabled = true;
        runBtn.disabled = true;
      }
    };
    reader.onerror = function() {
      status.textContent = 'Error reading file.';
      db = null;
      sqlInput.disabled = true;
      runBtn.disabled = true;
    };
    reader.readAsArrayBuffer(file);
  });

  // Run query handler
  runBtn.addEventListener('click', () => {
    if (!db) return;
    const query = sqlInput.value.trim();
    resultDiv.textContent = '';
    if (!query) {
      status.textContent = 'Please enter a SQL query.';
      return;
    }
    try {
      const results = db.exec(query);
      if (results.length === 0) {
        resultDiv.textContent = 'Query executed successfully. No rows returned.';
      } else {
        // Render results as a table
        const table = document.createElement('table');
        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        results[0].columns.forEach(col => {
          const th = document.createElement('th');
          th.textContent = col;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        results[0].values.forEach(row => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell === null ? 'NULL' : cell;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        resultDiv.appendChild(table);
      }
      status.textContent = 'Query run successfully.';
    } catch (err) {
      status.textContent = 'SQL Error: ' + err.message;
      resultDiv.textContent = '';
    }
  });

  // Allow pressing Enter with Ctrl+Enter or Shift+Enter to run query on textarea
  sqlInput.addEventListener('keydown', e => {
    if ((e.key === 'Enter' && (e.ctrlKey || e.shiftKey))) {
      e.preventDefault();
      runBtn.click();
    }
  });
})();

