const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Helper function to read from db.json
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { products: [] };
    }
};

// Helper function to write to db.json
const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// GET all products
app.get('/products', (req, res) => {
    const db = readDB();
    res.json(db.products);
});

// GET product by ID
app.get('/products/:id', (req, res) => {
    const db = readDB();
    
    const product = db.products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

// POST new product
app.post('/products', async (req, res) => {
    const { image ,description  , name , price} = req.body
    
    if(!image || !description  || !name ||  !price ){
        return res.status(400).json({message:"image , description , name , price majburiy"});
    }
    const db = readDB();
    const newProduct = {
        id: db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
        ...req.body
    };
    db.products.push(newProduct);
    writeDB(db);
    res.status(201).json(newProduct);
});

// PUT update product
app.put('/products/:id', (req, res) => {
    const db = readDB();
    const index = db.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Product not found' });

    db.products[index] = { ...db.products[index], ...req.body, id: parseInt(req.params.id) };
    writeDB(db);
    res.json(db.products[index]);
});

// DELETE product
app.delete('/products/:id', (req, res) => {
    const db = readDB();
    const index = db.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Product not found' });

    const deletedProduct = db.products.splice(index, 1);
    writeDB(db);
    res.json({
        message:"Product o'chirildi",
        data:deletedProduct[0]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
