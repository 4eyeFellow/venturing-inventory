const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
   origin: '*',
   credentials: true
}));

app.use(express.json());
app.use(express.static('public')); // Serve your HTML file from 'public' folder

// PostgreSQL connection - works with both local and Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'crew2024'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'venturing_inventory'}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully!');
  }
});

// ============== EQUIPMENT ENDPOINTS ==============

// Get all equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.item_name as "itemName",
        e.item_number as "itemNumber",
        e.category,
        e.description,
        e.quantity,
        e.condition,
        e.purchase_date as "purchaseDate",
        e.purchase_price as "purchasePrice",
        e.location,
        e.requires_inspection as "requiresInspection",
        e.last_inspection_date as "lastInspection",
        e.notes,
        e.quantity - COALESCE(SUM(CASE WHEN c.status = 'OUT' THEN c.quantity_checked_out ELSE 0 END), 0) as available
      FROM equipment e
      LEFT JOIN checkouts c ON e.id = c.equipment_id AND c.status = 'OUT'
      GROUP BY e.id
      ORDER BY e.category, e.item_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// Get single equipment item
app.get('/api/equipment/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM equipment WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// Add new equipment
app.post('/api/equipment', async (req, res) => {
  const {
    itemName,
    itemNumber,
    category,
    description,
    quantity,
    condition,
    purchasePrice,
    location,
    requiresInspection,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO equipment 
        (item_name, item_number, category, description, quantity, condition, 
         purchase_date, purchase_price, location, requires_inspection, notes)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, $10)
      RETURNING *`,
      [itemName, itemNumber, category, description, quantity, condition, 
       purchasePrice, location, requiresInspection, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding equipment:', err);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Item number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add equipment' });
    }
  }
});

// Update equipment
app.put('/api/equipment/:id', async (req, res) => {
  const { item_name, item_number, condition, location, notes, lastInspection } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE equipment 
       SET item_name = COALESCE($1, item_name),
           item_number = COALESCE($2, item_number),
           condition = COALESCE($3, condition),
           location = COALESCE($4, location),
           notes = COALESCE($5, notes),
           last_inspection_date = COALESCE($6, last_inspection_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [item_name, item_number, condition, location, notes, lastInspection, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating equipment:', err);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// Delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
  try {
    // Check if equipment is currently checked out
    const checkoutCheck = await pool.query(
      'SELECT id FROM checkouts WHERE equipment_id = $1 AND status = \'OUT\'',
      [req.params.id]
    );
    
    if (checkoutCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete equipment that is currently checked out. Please return it first.' 
      });
    }

    // Check if equipment has any checkout history
    const historyCheck = await pool.query(
      'SELECT COUNT(*) as count FROM checkouts WHERE equipment_id = $1',
      [req.params.id]
    );

    if (parseInt(historyCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete equipment with checkout history. Consider marking it as "Retired" instead.' 
      });
    }
    
    const result = await pool.query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Error deleting equipment:', err);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// Get checkout history for specific equipment
app.get('/api/equipment/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT 
                c.*,
                e.item_name,
                e.item_number
             FROM checkouts c
             JOIN equipment e ON c.equipment_id = e.id
             WHERE c.equipment_id = $1
             ORDER BY c.checkout_date DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching checkout history:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============== CHECKOUT ENDPOINTS ==============

// Get all active checkouts
app.get('/api/checkouts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.equipment_id as "equipmentId",
        e.item_name as "itemName",
        e.item_number as "itemNumber",
        c.checked_out_by as "checkedOutBy",
        c.checkout_date as "checkoutDate",
        c.expected_return_date as "returnDate",
        c.quantity_checked_out as "quantity",
        c.event_trip_name as "event",
        c.checked_out_by_adult as "approvedBy",
        c.condition_out as "conditionOut",
        c.status
      FROM checkouts c
      JOIN equipment e ON c.equipment_id = e.id
      WHERE c.status = 'OUT'
      ORDER BY c.expected_return_date
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching checkouts:', err);
    res.status(500).json({ error: 'Failed to fetch checkouts' });
  }
});

// Create new checkout
app.post('/api/checkouts', async (req, res) => {
  const {
    equipmentId,
    checkedOutBy,
    eventName,
    returnDate,
    quantity,
    approvedBy
  } = req.body;

  try {
    // Check if enough equipment is available
    const equipmentCheck = await pool.query(`
      SELECT 
        e.quantity,
        e.quantity - COALESCE(SUM(CASE WHEN c.status = 'OUT' THEN c.quantity_checked_out ELSE 0 END), 0) as available,
        e.condition
      FROM equipment e
      LEFT JOIN checkouts c ON e.id = c.equipment_id AND c.status = 'OUT'
      WHERE e.id = $1
      GROUP BY e.id
    `, [equipmentId]);

    if (equipmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const available = equipmentCheck.rows[0].available;
    if (available < quantity) {
      return res.status(400).json({ 
        error: `Only ${available} items available for checkout` 
      });
    }

    const result = await pool.query(
      `INSERT INTO checkouts 
        (equipment_id, checked_out_by, checkout_date, expected_return_date, 
         quantity_checked_out, event_trip_name, condition_out, checked_out_by_adult, status)
      VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, 'OUT')
      RETURNING *`,
      [equipmentId, checkedOutBy, returnDate, quantity, eventName, 
       equipmentCheck.rows[0].condition, approvedBy]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating checkout:', err);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

// Return equipment
app.put('/api/checkouts/:id/return', async (req, res) => {
  const { conditionIn, notes } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE checkouts
       SET status = 'RETURNED',
           actual_return_date = CURRENT_DATE,
           condition_in = $1,
           return_notes = $2
       WHERE id = $3 AND status = 'OUT'
       RETURNING *`,
      [conditionIn, notes, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checkout not found or already returned' });
    }

    // Update equipment condition if it changed
    if (conditionIn) {
      await pool.query(
        'UPDATE equipment SET condition = $1 WHERE id = $2',
        [conditionIn, result.rows[0].equipment_id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error returning equipment:', err);
    res.status(500).json({ error: 'Failed to return equipment' });
  }
});

// ============== MAINTENANCE ENDPOINTS ==============

// Get equipment needing attention
app.get('/api/maintenance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        item_name as "itemName",
        item_number as "itemNumber",
        category,
        condition,
        last_inspection_date as "lastInspection",
        requires_inspection as "requiresInspection",
        location,
        notes,
        CASE 
          WHEN condition IN ('Needs Repair', 'Retired') THEN 'Replace/Repair'
          WHEN requires_inspection = TRUE AND last_inspection_date IS NULL THEN 'Never Inspected'
          WHEN requires_inspection = TRUE AND last_inspection_date < CURRENT_DATE - INTERVAL '180 days' THEN 'Inspection Overdue'
          ELSE 'Check Needed'
        END as "actionNeeded"
      FROM equipment
      WHERE condition IN ('Needs Repair', 'Fair', 'Retired')
         OR (requires_inspection = TRUE 
             AND (last_inspection_date IS NULL 
                  OR last_inspection_date < CURRENT_DATE - INTERVAL '180 days'))
      ORDER BY 
        CASE 
          WHEN condition = 'Needs Repair' THEN 1
          WHEN condition = 'Retired' THEN 2
          WHEN requires_inspection = TRUE AND last_inspection_date IS NULL THEN 3
          ELSE 4
        END,
        item_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching maintenance items:', err);
    res.status(500).json({ error: 'Failed to fetch maintenance items' });
  }
});

// Add maintenance log entry
app.post('/api/maintenance', async (req, res) => {
  const {
    equipmentId,
    maintenanceType,
    performedBy,
    issueDescription,
    actionTaken,
    cost,
    conditionBefore,
    conditionAfter
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO maintenance_log 
        (equipment_id, maintenance_date, maintenance_type, performed_by,
         issue_description, action_taken, cost, condition_before, condition_after)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [equipmentId, maintenanceType, performedBy, issueDescription, 
       actionTaken, cost, conditionBefore, conditionAfter]
    );

    // Update equipment condition and inspection date
    if (conditionAfter) {
      await pool.query(
        `UPDATE equipment 
         SET condition = $1,
             last_inspection_date = CASE WHEN $2 = 'Inspection' THEN CURRENT_DATE ELSE last_inspection_date END
         WHERE id = $3`,
        [conditionAfter, maintenanceType, equipmentId]
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding maintenance log:', err);
    res.status(500).json({ error: 'Failed to add maintenance log' });
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