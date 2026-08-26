import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const request = async (url, options) => {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const loadTasks = async () => {
    try {
      setTasks(await request(API));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");

    try {
      setError("");

      if (editing) {
        const task = await request(`${API}/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, completed: editing.completed }),
        });
        setTasks(tasks.map((t) => (t._id === task._id ? task : t)));
      } else {
        const task = await request(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setTasks([task, ...tasks]);
      }

      setForm({ title: "", description: "" });
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await request(`${API}/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (task) => {
    try {
      const updated = await request(`${API}/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });
      setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (task) => {
    setEditing(task);
    setForm({ title: task.title, description: task.description });
    setError("");
  };

  const cancel = () => {
    setEditing(null);
    setForm({ title: "", description: "" });
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
          <h2>{editing ? "Edit Task" : "Add New Task"}</h2>

          <form onSubmit={submit}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Task description"
              rows="4"
            />
            <button className="primary-btn">
              {editing ? "Save Task" : "+ Add Task"}
            </button>
            {editing && (
              <button type="button" className="cancel-btn" onClick={cancel}>
                Cancel
              </button>
            )}
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
            <div className="empty-state">Loading tasks...</div>
          ) : !tasks.length ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Add your first task to get started.</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <article className="task-card" key={task._id}>
                  <div className="task-top">
                    <span className={`status ${task.completed ? "completed" : "pending"}`}>
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
                    <button className="complete-btn" onClick={() => toggle(task)}>
                      {task.completed ? "Mark Pending" : "Mark Complete"}
                    </button>
                    <button className="edit-btn" onClick={() => edit(task)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => remove(task._id)}>
                      Delete
                    </button>
                  </div>
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