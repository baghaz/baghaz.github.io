let db = null;

// Memuat sql.js dengan WebAssembly
window.initializeDB = async function () {
    try {
        // Memuat sql.js (WASM) secara dinamis
        const SQL = await loadSQLJS();

        // Ambil file SQLite dari GitHub Pages (file statis)
        const response = await fetch('https://github.com/baghaz/baghaz.github.io/tree/a2a5a1cb63577a6e53d3be5df8ff2a2e6e3d361c/db/coebegueDB.sqlite');  // Sesuaikan URL dengan lokasi file SQLite kamu
        if (!response.ok) throw new Error('Failed to fetch the database file');

        const arrayBuffer = await response.arrayBuffer();
        const uInt8Array = new Uint8Array(arrayBuffer);
        db = new SQL.Database(uInt8Array);

        console.log('Database loaded from GitHub Pages static file');

        // Fetch and display categories
        displayCategories();

        // Fetch and display products
        displayProducts();

    } catch (error) {
        console.error('Error initializing database:', error);
        alert('Failed to initialize database from file.');
    }
};

// Fungsi untuk memuat sql.js dari CDN (WebAssembly)
window.loadSQLJS = async function () {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js";  // Menggunakan sql-wasm.js
        script.onload = () => {
            resolve(window.SQL);
        };
        script.onerror = () => {
            reject(new Error('Failed to load sql-wasm.js'));
        };
        document.head.appendChild(script);
    });
}

// Fungsi untuk menampilkan kategori
window.displayCategories = async function () {
    const categoriesTableBody = document.getElementById("categoriesTable").getElementsByTagName("tbody")[0];

    const categories = db.exec('SELECT * FROM categories');
    if (categories.length > 0) {
        categories[0].values.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            categoriesTableBody.appendChild(tr);
        });
    } else {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = 'No categories available';
        tr.appendChild(td);
        categoriesTableBody.appendChild(tr);
    }
};

// Fungsi untuk menampilkan produk
window.displayProducts = async function () {
    const productsTableBody = document.getElementById("productsTable").getElementsByTagName("tbody")[0];

    const products = db.exec('SELECT * FROM products');
    if (products.length > 0) {
        products[0].values.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            productsTableBody.appendChild(tr);
        });
    } else {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.textContent = 'No products available';
        tr.appendChild(td);
        productsTableBody.appendChild(tr);
    }
};

// Initialize the database when the page is loaded
window.onload = initializeDB;
