const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend/public'));
const dataDir = path.join(__dirname, 'data');
const productsFile = path.join(dataDir, 'products.json');
const ordersFile = path.join(dataDir, 'orders.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const usersFile = path.join(dataDir, 'users.json');

function readJSON(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, userId: user.id, role: user.role });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { username, password, email } = req.body;
    const users = readJSON(usersFile);
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const newUser = { id: Date.now(), username, password, email, role: 'admin' };
    users.push(newUser);
    writeJSON(usersFile, users);
    res.json({ success: true, userId: newUser.id });
});

app.get('/api/products', (req, res) => {
    const products = readJSON(productsFile);
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const products = readJSON(productsFile);
    const product = products.find(p => p.id == req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.post('/api/products', (req, res) => {
    const products = readJSON(productsFile);
    const newProduct = { id: Date.now(), ...req.body, createdAt: new Date() };
    products.push(newProduct);
    writeJSON(productsFile, products);
    res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
    let products = readJSON(productsFile);
    const index = products.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        writeJSON(productsFile, products);
        res.json({ success: true, product: products[index] });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    let products = readJSON(productsFile);
    const index = products.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        products.splice(index, 1);
        writeJSON(productsFile, products);
        res.json({ success: true, message: 'Product deleted' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.get('/api/categories', (req, res) => {
    const categories = readJSON(categoriesFile);
    res.json(categories);
});

app.post('/api/categories', (req, res) => {
    const categories = readJSON(categoriesFile);
    const newCategory = { id: Date.now(), ...req.body };
    categories.push(newCategory);
    writeJSON(categoriesFile, categories);
    res.json({ success: true, category: newCategory });
});

app.put('/api/categories/:id', (req, res) => {
    let categories = readJSON(categoriesFile);
    const index = categories.findIndex(c => c.id == req.params.id);
    if (index !== -1) {
        categories[index] = { ...categories[index], ...req.body };
        writeJSON(categoriesFile, categories);
        res.json({ success: true, category: categories[index] });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    let categories = readJSON(categoriesFile);
    const index = categories.findIndex(c => c.id == req.params.id);
    if (index !== -1) {
        categories.splice(index, 1);
        writeJSON(categoriesFile, categories);
        res.json({ success: true, message: 'Category deleted' });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

app.get('/api/orders', (req, res) => {
    const orders = readJSON(ordersFile);
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const orders = readJSON(ordersFile);
    const newOrder = { id: Date.now(), ...req.body, createdAt: new Date(), status: 'pending' };
    orders.push(newOrder);
    writeJSON(ordersFile, orders);
    res.json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
    let orders = readJSON(ordersFile);
    const index = orders.findIndex(o => o.id == req.params.id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...req.body };
        writeJSON(ordersFile, orders);
        res.json({ success: true, order: orders[index] });
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

app.listen(PORT, () => {
    console.log(`LUMINA Backend running on http://localhost:${PORT}`);
});
