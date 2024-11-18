const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample data
let todos = [
    { id: 1, task: "Learn Node.js", completed: false, priority: "medium" },
    { id: 2, task: "Build a REST API", completed: false, priority: "medium" }
];

/* Question 1: Add a "Priority" Field to the To-Do API */

// Updated GET /todos to include "priority"
app.get('/todos', (req, res) => {
    const { completed } = req.query;

    if (completed !== undefined) {
        const isCompleted = completed === 'true';
        const filteredTodos = todos.filter(todo => todo.completed === isCompleted);
        return res.json(filteredTodos);
    }

    res.json(todos);
});

// Updated POST /todos to include "priority" field
app.post('/todos', (req, res) => {
    const { task, priority = "medium" } = req.body;

    if (!task) {
        return res.status(400).json({ error: "Task is required" });
    }

    const newTodo = {
        id: todos.length + 1,
        task,
        completed: false,
        priority
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// PUT /todos/:id - Update an existing to-do item
app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).send("To-Do item not found");
    }

    const { task, completed, priority } = req.body;
    todo.task = task || todo.task;
    todo.completed = completed !== undefined ? completed : todo.completed;
    todo.priority = priority || todo.priority;

    res.json(todo);
});

/*
Question 2: Implement a "Complete All" Endpoint
*/

// PUT /todos/complete-all - Mark all to-do items as completed
app.put('/todos/complete-all', (req, res) => {
    todos = todos.map(todo => ({ ...todo, completed: true }));
    res.status(200).json({ message: "All to-do items marked as completed" });
});

/*
Question 3: Filter To-Do Items by Completion Status
This is already included in the updated GET /todos implementation */

// DELETE /todos/:id - Delete a to-do item
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).send("To-Do item not found");
    }

    todos.splice(index, 1);
    res.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
