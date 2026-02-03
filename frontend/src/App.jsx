import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function normalizeIncidents(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.incidents)) return payload.incidents;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (payload._embedded && Array.isArray(payload._embedded.items))
    return payload._embedded.items;
  return [];
}

function getIncidentTitle(incident) {
  return formatValue(
    incident.title ||
      incident.label ||
      incident.name ||
      `Incident ${incident.id || incident.uuid || incident.nid || ""}`.trim(),
  );
}

function formatValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (typeof value === "object") {
    if ("value" in value) return formatValue(value.value);
    if ("label" in value) return formatValue(value.label);
    return JSON.stringify(value);
  }
  return String(value);
}

function formatDateTime(value) {
  if (!value) return "";
  const date =
    typeof value === "number"
      ? new Date(value * 1000)
      : new Date(String(value));
  if (Number.isNaN(date.getTime())) return formatValue(value);
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

function toTimestamp(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value * 1000;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getIncidentId(incident) {
  return formatValue(
    incident.id || incident.uuid || incident.nid || incident.title || "",
  );
}

function getIncidentTimestamp(incident) {
  return (
    incident.incidentTime ||
    incident.incident_time ||
    incident.created ||
    incident.date ||
    null
  );
}

function IncidentDetail({ incidents, status, error }) {
  const { id } = useParams();
  const selectedIncident = useMemo(() => {
    if (!id) return null;
    return incidents.find((incident) => getIncidentId(incident) === id);
  }, [id, incidents]);

  return (
    <section className="detail full">
      <div className="section-head">
        <h2>Incident detail</h2>
        <Link className="back-link" to="/">
          Back to list
        </Link>
      </div>

      {status === "loading" && <span className="badge">Loading…</span>}
      {status === "error" && <span className="badge error">Error</span>}
      {error && <p className="error-message">{error}</p>}

      {selectedIncident ? (
        <div className="card">
          <h3>{getIncidentTitle(selectedIncident)}</h3>
          <p className="detail-time">
            {formatValue(
              formatDateTime(getIncidentTimestamp(selectedIncident)),
            )}
          </p>
          <div className="detail-body">
            <p>
              {formatValue(
                selectedIncident.description ||
                  selectedIncident.field_description ||
                  selectedIncident.body ||
                  "No description provided.",
              )}
            </p>
          </div>
          {selectedIncident.place && (
            <div className="detail-body">
              <p>
                <strong>Place:</strong>{" "}
                {formatValue(selectedIncident.place.latitude)}{" "}
                {formatValue(selectedIncident.place.longitude)}
              </p>
            </div>
          )}
          {Array.isArray(selectedIncident.persons) &&
            selectedIncident.persons.length > 0 && (
              <div className="detail-body">
                <p>
                  <strong>Persons:</strong>{" "}
                  {selectedIncident.persons
                    .map((person) =>
                      formatValue(
                        `${person.givenName || ""} ${person.familyName || ""}`.trim(),
                      ),
                    )
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          {Array.isArray(selectedIncident.photos) &&
            selectedIncident.photos.length > 0 && (
              <div className="detail-body">
                <p>
                  <strong>Photos:</strong>{" "}
                  {selectedIncident.photos.map((photo) => (
                    <a
                      key={photo.id || photo.uuid || photo.url}
                      href={photo.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {photo.alt || "Photo"}
                    </a>
                  ))}
                </p>
              </div>
            )}
        </div>
      ) : (
        <div className="card empty">Incident not found.</div>
      )}
    </section>
  );
}

function IncidentTable({ incidents, status, error }) {
  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      const aTime = toTimestamp(getIncidentTimestamp(a));
      const bTime = toTimestamp(getIncidentTimestamp(b));
      return bTime - aTime;
    });
  }, [incidents]);

  return (
    <section className="list full">
      <div className="section-head">
        <h2>Incidents</h2>
        {status === "loading" && <span className="badge">Loading…</span>}
        {status === "error" && <span className="badge error">Error</span>}
      </div>

      {error && <p className="error-message">{error}</p>}

      <table className="incidents-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Persons</th>
            <th>Place</th>
          </tr>
        </thead>
        <tbody>
          {sortedIncidents.map((incident) => {
            const id = getIncidentId(incident);
            const persons = Array.isArray(incident.persons)
              ? incident.persons
                  .map((person) =>
                    formatValue(
                      `${person.givenName || ""} ${person.familyName || ""}`.trim(),
                    ),
                  )
                  .filter(Boolean)
                  .join(", ")
              : "";
            const place =
              incident.place &&
              `${formatValue(incident.place.latitude)} ${formatValue(
                incident.place.longitude,
              )}`.trim();

            return (
              <tr key={id}>
                <td>
                  {formatValue(formatDateTime(getIncidentTimestamp(incident)))}
                </td>
                <td>
                  <Link to={`/incident/${id}`}>
                    {getIncidentTitle(incident)}
                  </Link>
                </td>
                <td>{persons || "—"}</td>
                <td>{place || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadIncidents() {
      setStatus("loading");
      setError("");

      try {
        const response = await fetch(`${API_BASE}/incidents`);
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const data = await response.json();
        if (cancelled) return;
        const normalized = normalizeIncidents(data);
        setIncidents(normalized);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to load incidents.");
        setStatus("error");
      }
    }

    loadIncidents();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Incident Reports</h1>
        </div>
        <div className="meta">
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{incidents.length}</span>
          </div>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <IncidentTable
                incidents={incidents}
                status={status}
                error={error}
              />
            }
          />
          <Route
            path="/incident/:id"
            element={
              <IncidentDetail
                incidents={incidents}
                status={status}
                error={error}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export function ErrorFallback({ error, info }) {
  // TODO; only the error, not the whole page
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="kicker">React Error Boundary</p>
          <h1>Something went wrong</h1>
          <p className="subtitle">
            Check the details below to pinpoint the failing render.
          </p>
        </div>
      </header>
      <main className="content">
        <section className="detail">
          <div className="card">
            <h3>{error?.message || "Unknown error"}</h3>
            {info?.componentStack && (
              <pre className="json">{info.componentStack}</pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
