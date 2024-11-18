const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// SQLite database setup
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Create the todos table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                priority TEXT DEFAULT 'medium'
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    }
});

/* Question 1: Add a "Priority" Field to the To-Do API */

// GET
app.get('/todos', (req, res) => {
    const { completed } = req.query;
    let query = 'SELECT * FROM todos';
    const params = [];

    if (completed !== undefined) {
        query += ' WHERE completed = ?';
        params.push(completed === 'true' ? 1 : 0);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// POST
app.post('/todos', (req, res) => {
    const { task, priority = "medium" } = req.body;

    if (!task) {
        return res.status(400).json({ error: "Task is required" });
    }

    db.run('INSERT INTO todos (task, completed, priority) VALUES (?, ?, ?)', [task, 0, priority], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, task, completed: false, priority });
        }
    });
});

// PUT - Update an existing to-do item
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task, completed, priority } = req.body;

    db.run(
        `UPDATE todos SET 
            task = COALESCE(?, task), 
            completed = COALESCE(?, completed), 
            priority = COALESCE(?, priority) 
        WHERE id = ?`,
        [task, completed !== undefined ? completed : null, priority, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: "To-Do item not found" });
            } else {
                res.json({ id, task, completed, priority });
            }
        }
    );
});

/* Question 2: Implement a "Complete All" Endpoint */

// PUT - Mark all to-do items as completed
app.put('/todos/complete-all', (req, res) => {
    db.run('UPDATE todos SET completed = 1', [], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: "All to-do items marked as completed" });
        }
    });
});

/* Question 3: Filter To-Do Items by Completion Status
   This functionality is already included in the GET /todos endpoint above. */

// DELETE - Delete a to-do item
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: "To-Do item not found" });
        } else {
            res.status(204).send();
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
