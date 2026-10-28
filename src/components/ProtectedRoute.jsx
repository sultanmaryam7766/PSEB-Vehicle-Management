import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!token || !user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      user.role
    )
  ) {
    if (
      user.role ===
      "Administrator"
    ) {
      return (
        <Navigate
          to="/admin-dashboard"
          replace
        />
      );
    }

    if (
      user.role ===
      "Operator"
    ) {
      return (
        <Navigate
          to="/operator-dashboard"
          replace
        />
      );
    }

    if (
      user.role ===
      "Viewer"
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

  return children;
}

export default ProtectedRoute;