import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    projectId: "",
    type: "général",
    priority: "normale",
    status: "todo",
  });

  // Charger projets + tâches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectsRes, tasksRes] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/tasks`),
        ]);

        if (!projectsRes.ok || !tasksRes.ok) {
          throw new Error("Erreur récupération données");
        }

        const projectsData = await projectsRes.json();
        const tasksData = await tasksRes.json();

        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données depuis le backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.projectId) {
      setError("Le titre et le projet sont obligatoires.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          projectId: Number(form.projectId),
          type: form.type,
          priority: form.priority,
          status: form.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur création tâche");
      }

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);

      setForm({
        title: "",
        projectId: "",
        type: "général",
        priority: "normale",
        status: "todo",
      });
    } catch (err) {
      console.error(err);
      setError("Impossible de créer la tâche.");
    }
  };

  return (
    <div className="app-container">
      <h1>DevOps Tasks Board - Render</h1>

      <p style={{ color: "#9da7b3" }}>
        Mini application pédagogique pour suivre les tâches DevOps / DevSecOps
        d&apos;un projet.
      </p>

      <div className="api-box">
        <strong>Backend API :</strong> <code>{API_URL}</code>
      </div>

      {loading && <p>Chargement des données...</p>}
      {error && <p className="error">{error}</p>}

      {/* FORMULAIRE */}
      <section className="card" style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <h2>Ajouter une nouvelle tâche</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Titre de la tâche</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex : Ajouter un test d'intégration"
            />
          </div>

          <div>
            <label>Projet</label>
            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner un projet --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
            }}
          >
            <div>
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="général">Général</option>
                <option value="ci/cd">CI/CD</option>
                <option value="sécurité">Sécurité</option>
                <option value="infra">Infra</option>
              </select>
            </div>

            <div>
              <label>Priorité</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="basse">Basse</option>
              </select>
            </div>

            <div>
              <label>Statut</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="todo">À faire</option>
                <option value="doing">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>
          </div>

          <button type="submit">Ajouter la tâche</button>
        </form>
      </section>

      {/* LISTE */}
      <section className="card">
        <h2>Liste des tâches</h2>

        {tasks.length === 0 ? (
          <p>Aucune tâche pour le moment.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);

              return (
                <li key={task.id} className="task-card">
                  <div className="task-header">
                    <span className="task-title">{task.title}</span>

                    <span className={`badge ${task.status}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="task-meta">
                    Projet :{" "}
                    <strong>
                      {project ? project.name : `#${task.projectId}`}
                    </strong>
                  </div>

                  <div className="task-meta">
                    Type : {task.type} — Priorité : {task.priority}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
