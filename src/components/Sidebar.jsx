import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-welcome">
        Welcome User!
      </div>

      <nav className="sidebar-nav">
        {role === "Administrator" && (
          <button onClick={() => navigate("/admin-dashboard")}>
            Dashboard
          </button>
        )}

        {role === "Operator" && (
          <button onClick={() => navigate("/operator-dashboard")}>
            Dashboard
          </button>
        )}

        {role === "Viewer" && (
          <button onClick={() => navigate("/viewer-dashboard")}>
            Dashboard
          </button>
        )}

        <button onClick={() => navigate("/vehicles")}>
          Vehicles
        </button>

        <button onClick={() => navigate("/vehicle-history")}>
          Vehicle History
        </button>

        <button onClick={() => navigate("/drivers")}>
          Drivers
        </button>

        <button onClick={() => navigate("/trips")}>
          Trips
        </button>

        <button onClick={() => navigate("/fuel")}>
          Fuel
        </button>

        <button onClick={() => navigate("/maintenance")}>
          Maintenance
        </button>

        <button onClick={() => navigate("/documents")}>
          Documents
        </button>

        <button onClick={() => navigate("/incidents")}>
          Incidents
        </button>

        <button onClick={() => navigate("/expenses")}>
          Expenses
        </button>

        <button onClick={() => navigate("/reports")}>
          Reports
        </button>

        {role === "Administrator" && (
          <>
            <button onClick={() => navigate("/users-roles")}>
              Users & Roles
            </button>

            <button onClick={() => navigate("/audit-log")}>
              Audit Log
            </button>
          </>
        )}
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;