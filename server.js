const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ============== MIDDLEWARE ==============
// CORS - Allow all origins for development and production
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from public directory if it exists
const publicDir = path.join(__dirname, 'public');
if (require('fs').existsSync(publicDir)) {
    app.use(express.static(publicDir));
} else {
    // If no public folder, serve from root
    app.use(express.static(__dirname));
}

// ============== DATABASE CONNECTION ==============
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.stack);
    } else {
        console.log('✅ Connected to database');
        release();
    }
});

// ============== API ROUTES ==============

// Get all equipment with optional filters
app.get('/api/equipment', async (req, res) => {
    try {
        const { category, condition, available } = req.query;
        let query = 'SELECT * FROM equipment WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (condition) {
            query += ` AND condition = $${paramCount}`;
            params.push(condition);
            paramCount++;
        }

        if (available === 'true') {
            query += ` AND available > 0`;
        }

        query += ' ORDER BY item_name';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});

// Get single equipment by ID
app.get('/api/equipment/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});

// Add new equipment
app.post('/api/equipment', async (req, res) => {
    try {
        const {
            item_name,
            item_number,
            category,
            description,
            quantity,
            condition,
            purchase_price,
            location,
            requires_inspection
        } = req.body;

        const result = await pool.query(
            `INSERT INTO equipment 
            (item_name, item_number, category, description, quantity, available, condition, 
             purchase_price, location, requires_inspection, purchase_date)
            VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, CURRENT_DATE)
            RETURNING *`,
            [item_name, item_number, category, description || null, quantity, condition,
             purchase_price || null, location || null, requires_inspection || false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding equipment:', error);
        res.status(500).json({ error: 'Failed to add equipment' });
    }
});

// Update equipment
app.put('/api/equipment/:id', async (req, res) => {
    try {
        const { condition, location, last_inspection, notes } = req.body;

        const result = await pool.query(
            `UPDATE equipment 
            SET condition = $1, location = $2, last_inspection = $3, notes = $4
            WHERE id = $5
            RETURNING *`,
            [condition, location, last_inspection, notes, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ error: 'Failed to update equipment' });
    }
});

// Delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ error: 'Failed to delete equipment' });
    }
});

// Get equipment history
app.get('/api/equipment/:id/history', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM checkouts 
            WHERE equipment_id = $1 
            ORDER BY checkout_date DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get all checkouts
app.get('/api/checkouts', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT c.*, e.item_name as "itemName", e.item_number
            FROM checkouts c
            JOIN equipment e ON c.equipment_id = e.id
        `;

        if (status && status !== 'all') {
            query += ' WHERE c.status = $1';
            const result = await pool.query(query + ' ORDER BY c.checkout_date DESC', [status]);
            return res.json(result.rows);
        }

        const result = await pool.query(query + ' ORDER BY c.checkout_date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching checkouts:', error);
        res.status(500).json({ error: 'Failed to fetch checkouts' });
    }
});

// Create checkout
app.post('/api/checkouts', async (req, res) => {
    try {
        const {
            equipment_id,
            quantity_out,
            checked_out_by,
            event_name,
            checkout_date,
            return_date
        } = req.body;

        const result = await pool.query(
            `INSERT INTO checkouts 
            (equipment_id, quantity_out, checked_out_by, event_name, checkout_date, return_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING *`,
            [equipment_id, quantity_out, checked_out_by, event_name, checkout_date, return_date]
        );

        // Update equipment availability
        await pool.query(
            'UPDATE equipment SET available = available - $1 WHERE id = $2',
            [quantity_out, equipment_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating checkout:', error);
        res.status(500).json({ error: 'Failed to create checkout' });
    }
});

// Return equipment
app.put('/api/checkouts/:id/return', async (req, res) => {
    try {
        const { actual_return_date, return_condition } = req.body;

        // Get checkout info
        const checkout = await pool.query('SELECT * FROM checkouts WHERE id = $1', [req.params.id]);
        if (checkout.rows.length === 0) {
            return res.status(404).json({ error: 'Checkout not found' });
        }

        // Update checkout
        const result = await pool.query(
            `UPDATE checkouts 
            SET status = 'returned', actual_return_date = $1, return_condition = $2
            WHERE id = $3
            RETURNING *`,
            [actual_return_date, return_condition, req.params.id]
        );

        // Return quantity to equipment
        await pool.query(
            'UPDATE equipment SET available = available + $1 WHERE id = $2',
            [checkout.rows[0].quantity_out, checkout.rows[0].equipment_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error returning equipment:', error);
        res.status(500).json({ error: 'Failed to return equipment' });
    }
});

// ============== SKU MANAGEMENT ROUTES ==============

// Get all SKUs
app.get('/api/skus', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM skus ORDER BY item_name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching SKUs:', error);
        res.status(500).json({ error: 'Failed to fetch SKUs' });
    }
});

// Add new SKU
app.post('/api/skus', async (req, res) => {
    try {
        const { item_name, sku_number } = req.body;

        const result = await pool.query(
            'INSERT INTO skus (item_name, sku_number) VALUES ($1, $2) RETURNING *',
            [item_name, sku_number]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding SKU:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'SKU number already exists' });
        } else {
            res.status(500).json({ error: 'Failed to add SKU' });
        }
    }
});

// Delete SKU
app.delete('/api/skus/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM skus WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'SKU not found' });
        }

        res.json({ message: 'SKU deleted successfully' });
    } catch (error) {
        console.error('Error deleting SKU:', error);
        res.status(500).json({ error: 'Failed to delete SKU' });
    }
});

// ============== SERVE FRONTEND ==============
// Serve index.html for all non-API routes
app.get('*', (req, res) => {
    // Try public folder first, then root
    const publicPath = path.join(__dirname, 'public', 'index.html');
    const rootPath = path.join(__dirname, 'index.html');
    
    // Check if file exists in public folder
    if (require('fs').existsSync(publicPath)) {
        res.sendFile(publicPath);
    } else if (require('fs').existsSync(rootPath)) {
        res.sendFile(rootPath);
    } else {
        res.status(404).send('index.html not found. Please make sure it exists in either the root or public folder.');
    }
});

// ============== START SERVER ==============
app.listen(port, '0.0.0.0', () => {
    console.log(`
==========================================
🏕️  Venturing Inventory Server Running!
==========================================

Server: http://localhost:${port}
Environment: ${process.env.NODE_ENV || 'development'}

Open your browser to http://localhost:${port}
==========================================
    `);
});