import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import ViewerDashboard from "./pages/ViewerDashboard";

import Vehicles from "./pages/Vehicles";
import AddVehicle from "./pages/AddVehicle";
import VehicleHistory from "./pages/VehicleHistory";
import VehicleDetail from "./pages/VehicleDetail";

import Drivers from "./pages/Drivers";
import AddDriver from "./pages/AddDriver";

import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import CompleteTrip from "./pages/CompleteTrip";

import Fuel from "./pages/Fuel";
import AddFuel from "./pages/AddFuel";

import Maintenance from "./pages/Maintenance";
import AddMaintenance from "./pages/AddMaintenance";

import Documents from "./pages/Documents";
import AddDocument from "./pages/AddDocument";

import Incidents from "./pages/Incidents";
import AddIncident from "./pages/AddIncident";

import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";

import Reports from "./pages/Reports";

import UsersRoles from "./pages/UsersRoles";
import AddUser from "./pages/AddUser";
import AuditLog from "./pages/AuditLog";

function App() {
  const allRoles = [
    "Administrator",
    "Operator",
    "Viewer",
  ];

  const operationalRoles = [
    "Administrator",
    "Operator",
  ];

  const adminOnly = [
    "Administrator",
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* DASHBOARDS */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={adminOnly}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Operator"]}
            >
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/viewer-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Viewer"]}
            >
              <ViewerDashboard />
            </ProtectedRoute>
          }
        />

        {/* VEHICLES */}

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Vehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-vehicle"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicle-history"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <VehicleHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicle-detail"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <VehicleDetail />
            </ProtectedRoute>
          }
        />

        {/* DRIVERS */}

        <Route
          path="/drivers"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Drivers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-driver"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddDriver />
            </ProtectedRoute>
          }
        />

        {/* TRIPS */}

        <Route
          path="/trips"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Trips />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <CreateTrip />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complete-trip"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <CompleteTrip />
            </ProtectedRoute>
          }
        />

        {/* FUEL */}

        <Route
          path="/fuel"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Fuel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-fuel"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddFuel />
            </ProtectedRoute>
          }
        />

        {/* MAINTENANCE */}

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Maintenance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-maintenance"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddMaintenance />
            </ProtectedRoute>
          }
        />

        {/* DOCUMENTS */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Documents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-document"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddDocument />
            </ProtectedRoute>
          }
        />

        {/* INCIDENTS */}

        <Route
          path="/incidents"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Incidents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-incident"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddIncident />
            </ProtectedRoute>
          }
        />

        {/* EXPENSES */}

        <Route
          path="/expenses"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-expense"
          element={
            <ProtectedRoute
              allowedRoles={operationalRoles}
            >
              <AddExpense />
            </ProtectedRoute>
          }
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ONLY */}

        <Route
          path="/users-roles"
          element={
            <ProtectedRoute
              allowedRoles={adminOnly}
            >
              <UsersRoles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-user"
          element={
            <ProtectedRoute
              allowedRoles={adminOnly}
            >
              <AddUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-log"
          element={
            <ProtectedRoute
              allowedRoles={adminOnly}
            >
              <AuditLog />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <ProtectedRoute
              allowedRoles={allRoles}
            >
              <RoleRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function RoleRedirect() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (
    user?.role === "Administrator"
  ) {
    return (
      <Navigate
        to="/admin-dashboard"
        replace
      />
    );
  }

  if (
    user?.role === "Operator"
  ) {
    return (
      <Navigate
        to="/operator-dashboard"
        replace
      />
    );
  }

  if (
    user?.role === "Viewer"
  ) {
    return (
      <Navigate
        to="/viewer-dashboard"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/"
      replace
    />
  );
}

export default App;