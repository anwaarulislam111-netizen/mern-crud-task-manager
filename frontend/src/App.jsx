import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://mern-crud-task-manager-production.up.railway.app";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      setTasks((prevTasks) => [data, ...prevTasks]);
      setTitle("");
      setDescription("");
    } catch (error) {
      setError(error.message);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setError("");
  };

  const updateTask = async (id) => {
    if (!editTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setError("");

      const currentTask = tasks.find((task) => task._id === id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          completed: currentTask?.completed || false,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || "Failed to update task");
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === id ? updatedTask : task
        )
      );

      setEditingTask(null);
      setEditTitle("");
      setEditDescription("");
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleTask = async (task) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || "Failed to update task");
      }

      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item._id === task._id ? updatedTask : item
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">MERN STACK</p>
          <h1>Task Manager</h1>
          <p className="subtitle">
            Manage your tasks with React, Express & MongoDB.
          </p>
        </div>

        <div className="task-count">
          <strong>{tasks.length}</strong>
          <span>Total Tasks</span>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <main>
        <section className="form-card">
          <h2>Add New Task</h2>

          <form onSubmit={addTask}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows="4"
            />

            <button className="primary-btn" type="submit">
              + Add Task
            </button>
          </form>
        </section>

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <h2>Your Tasks</h2>
              <p>Stay organized and keep your work moving.</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No tasks yet</h3>
              <p>Add your first task to get started.</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <article className="task-card" key={task._id}>
                  {editingTask === task._id ? (
                    <div className="edit-form">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title"
                      />

                      <textarea
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                        rows="4"
                        placeholder="Task description"
                      />

                      <div className="button-row">
                        <button
                          className="save-btn"
                          onClick={() => updateTask(task._id)}
                        >
                          Save
                        </button>

                        <button
                          className="cancel-btn"
                          onClick={() => setEditingTask(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="task-top">
                        <span
                          className={`status ${
                            task.completed ? "completed" : "pending"
                          }`}
                        >
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <h3 className={task.completed ? "done-title" : ""}>
                        {task.title}
                      </h3>

                      <p className="task-description">
                        {task.description || "No description provided."}
                      </p>

                      <div className="button-row">
                        <button
                          className="complete-btn"
                          onClick={() => toggleTask(task)}
                        >
                          {task.completed
                            ? "Mark Pending"
                            : "Mark Complete"}
                        </button>

                        <button
                          className="edit-btn"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;