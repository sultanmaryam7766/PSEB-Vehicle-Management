import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import NotificationBell from "../components/NotificationBell";

import {
  useNavigate,
} from "react-router-dom";

import "./Vehicles.css";

function Vehicles() {
  const navigate =
    useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  const role =
    user?.role;

  const token =
    localStorage.getItem(
      "token"
    );
const userName =
  user?.name ||
  "User";

const userInitials =
  userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    locationFilter,
    setLocationFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    searchWord,
    setSearchWord,
  ] = useState("");

  const [
    searchOn,
    setSearchOn,
  ] = useState("Any");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] = useState(20);

  const [
    editingVehicle,
    setEditingVehicle,
  ] = useState(null);

  const [
    editForm,
    setEditForm,
  ] = useState({
    registrationNo: "",
    vehicleName: "",
    location: "",
    odometer: "",
  });

  /* =========================
     AUTH
  ========================= */

  useEffect(
    () => {
      if (
        !user
      ) {
        navigate(
          "/"
        );
      }
    },
    [
      navigate,
      user,
    ]
  );

  /* =========================
     LOAD VEHICLES
  ========================= */

  const loadVehicles =
    useCallback(
      async () => {
        if (
          !token
        ) {
          return;
        }

        setLoading(
          true
        );

        setError(
          ""
        );

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/vehicles",
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            response.status ===
            401
          ) {
            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            navigate(
              "/"
            );

            return;
          }

          if (
            !response.ok
          ) {
            setError(
              data.message ||
                "Unable to load vehicles"
            );

            return;
          }

          setVehicles(
            data.vehicles ||
              []
          );
        } catch (
          err
        ) {
          console.error(
            "Load vehicles error:",
            err
          );

          setError(
            "Unable to connect to server"
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        navigate,
        token,
      ]
    );

  useEffect(
    () => {
      loadVehicles();
    },
    [
      loadVehicles,
    ]
  );

  /* =========================
     MENU
  ========================= */

  const menuItems = [
    {
      name:
        "Dashboard",
    },

    {
      name:
        "Vehicles",
      path:
        "/vehicles",
    },

    {
      name:
        "Vehicle History",
      path:
        "/vehicle-history",
    },

    {
      name:
        "Drivers",
      path:
        "/drivers",
    },

    {
      name:
        "Trips",
      path:
        "/trips",
    },

    {
      name:
        "Fuel",
      path:
        "/fuel",
    },

    {
      name:
        "Maintenance",
      path:
        "/maintenance",
    },

    {
      name:
        "Documents",
      path:
        "/documents",
    },

    {
      name:
        "Incidents",
      path:
        "/incidents",
    },

    {
      name:
        "Expenses",
      path:
        "/expenses",
    },

    {
      name:
        "Reports",
      path:
        "/reports",
    },
  ];

  if (
    role ===
    "Administrator"
  ) {
    menuItems.push(
      {
        name:
          "Users & Roles",
        path:
          "/users-roles",
      },

      {
        name:
          "Audit Log",
        path:
          "/audit-log",
      }
    );
  }

  const handleDashboard =
    () => {
      if (
        role ===
        "Administrator"
      ) {
        navigate(
          "/admin-dashboard"
        );
      } else if (
        role ===
        "Operator"
      ) {
        navigate(
          "/operator-dashboard"
        );
      } else if (
        role ===
        "Viewer"
      ) {
        navigate(
          "/viewer-dashboard"
        );
      }
    };

  const handleMenuClick = (
    item
  ) => {
    if (
      item.name ===
      "Dashboard"
    ) {
      handleDashboard();
      return;
    }

    navigate(
      item.path
    );
  };

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/"
      );
    };

  /* =========================
     EDIT VEHICLE
  ========================= */

  const handleEditClick = (
    vehicle
  ) => {
    setError(
      ""
    );

    setSuccess(
      ""
    );

    setEditingVehicle(
      vehicle
    );

    setEditForm({
      registrationNo:
        vehicle.registration_no,

      vehicleName:
        vehicle.vehicle_name,

      location:
        vehicle.location ||
        "",

      odometer:
        vehicle.odometer ??
        0,
    });
  };

  const handleEditChange = (
    e
  ) => {
    const {
      name,
      value,
    } =
      e.target;

    setEditForm(
      (
        prev
      ) => ({
        ...prev,

        [name]:
          value,
      })
    );
  };

  const handleUpdateVehicle =
    async (
      e
    ) => {
      e.preventDefault();

      if (
        !editingVehicle
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/vehicles/${editingVehicle.id}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  editForm
                ),
            }
          );

        const data =
          await response.json();

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate(
            "/"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to update vehicle"
          );

          return;
        }

        setSuccess(
          "Vehicle updated successfully"
        );

        setEditingVehicle(
          null
        );

        await loadVehicles();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Update vehicle error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      }
    };

  /* =========================
     STATUS CHANGE
  ========================= */

  const handleStatusChange =
    async (
      vehicle
    ) => {
      const newStatus =
        vehicle.status ===
        "Active"
          ? "Inactive"
          : "Active";

      const confirmed =
        window.confirm(
          `Change ${vehicle.registration_no} to ${newStatus}?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/vehicles/${vehicle.id}/status`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  status:
                    newStatus,
                }),
            }
          );

        const data =
          await response.json();

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate(
            "/"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to update vehicle status"
          );

          return;
        }

        setSuccess(
          data.message
        );

        await loadVehicles();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Status change error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      }
    };

  /* =========================
     DELETE VEHICLE
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      vehicle
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete vehicle ${vehicle.registration_no}?\n\n` +
          `${vehicle.vehicle_name || ""}\n\n` +
          "A vehicle can only be permanently deleted if it has NO linked Trips, Fuel, Maintenance, Documents, Incidents or Expenses.\n\n" +
          "If historical records exist, deletion will be blocked and you should set the vehicle to Inactive instead.\n\n" +
          "Do you want to continue?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      setDeletingId(
        vehicle.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/vehicles/${vehicle.id}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate(
            "/"
          );

          return;
        }

        if (
          response.status ===
          403
        ) {
          setError(
            "Only Administrator can delete vehicles"
          );

          return;
        }

        if (
          response.status ===
          409
        ) {
          setError(
            data.message ||
              "This vehicle has linked history and cannot be deleted. Set it to Inactive instead."
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete vehicle"
          );

          return;
        }

        setSuccess(
          `${vehicle.registration_no} deleted successfully`
        );

        if (
          editingVehicle?.id ===
          vehicle.id
        ) {
          setEditingVehicle(
            null
          );
        }

        await loadVehicles();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Delete vehicle error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================
     FILTERS
  ========================= */

  const locations =
    useMemo(
      () => {
        const uniqueLocations =
          vehicles
            .map(
              (
                vehicle
              ) =>
                vehicle.location
            )
            .filter(
              Boolean
            );

        return [
          "All",

          ...new Set(
            uniqueLocations
          ),
        ];
      },
      [
        vehicles,
      ]
    );

  const filteredVehicles =
    useMemo(
      () => {
        let result = [
          ...vehicles,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                vehicle
              ) =>
                vehicle.location ===
                locationFilter
            );
        }

        if (
          statusFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                vehicle
              ) =>
                vehicle.status ===
                statusFilter
            );
        }

        const word =
          searchWord
            .trim()
            .toLowerCase();

        if (
          word
        ) {
          result =
            result.filter(
              (
                vehicle
              ) => {
                const registration =
                  vehicle.registration_no
                    ?.toLowerCase() ||
                  "";

                const vehicleName =
                  vehicle.vehicle_name
                    ?.toLowerCase() ||
                  "";

                if (
                  searchOn ===
                  "Registration No."
                ) {
                  return registration.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Vehicle"
                ) {
                  return vehicleName.includes(
                    word
                  );
                }

                return (
                  registration.includes(
                    word
                  ) ||
                  vehicleName.includes(
                    word
                  )
                );
              }
            );
        }

        return result.slice(
          0,
          Number(
            recordsPerPage
          )
        );
      },
      [
        vehicles,
        locationFilter,
        statusFilter,
        searchWord,
        searchOn,
        recordsPerPage,
      ]
    );

  if (
    !user
  ) {
    return null;
  }

  return (
    <div className="vehicles-page">

      {/* SIDEBAR */}

      <aside className="vehicles-sidebar">

      <div className="vehicles-welcome">

  <div className="vehicles-profile-avatar">
    {userInitials}
  </div>

  <div className="vehicles-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>
        <div className="vehicles-menu">

          {menuItems.map(
            (
              item
            ) => (

              <button
                key={
                  item.name
                }
                className={
                  item.name ===
                  "Vehicles"
                    ? "vehicles-menu-btn active"
                    : "vehicles-menu-btn"
                }
                onClick={() =>
                  handleMenuClick(
                    item
                  )
                }
              >
                {
                  item.name
                }
              </button>

            )
          )}

        </div>

        <button
          className="vehicles-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* CONTENT */}

      <main className="vehicles-content">

        <div className="vehicles-header">

          <h1>
            Vehicles
          </h1>

        </div>

        {role !==
          "Viewer" && (

          <div className="vehicles-actions">

            <button
              className="vehicles-add-btn"
              onClick={() =>
                navigate(
                  "/add-vehicle"
                )
              }
            >
              + ADD VEHICLE
            </button>

          </div>

        )}

        {/* FILTERS */}

        <div className="vehicles-filters">

          <div className="filter-field">

            <label>
              Location
            </label>

            <select
              value={
                locationFilter
              }
              onChange={(
                e
              ) =>
                setLocationFilter(
                  e.target.value
                )
              }
            >

              {locations.map(
                (
                  location
                ) => (

                  <option
                    key={
                      location
                    }
                    value={
                      location
                    }
                  >
                    {
                      location
                    }
                  </option>

                )
              )}

            </select>

          </div>

          <div className="filter-field">

            <label>
              Month
            </label>

            <select disabled>

              <option>
                All
              </option>

            </select>

          </div>

          <div className="filter-field">

            <label>
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(
                e
              ) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

          <div className="filter-field small">

            <label>
              Records / page
            </label>

            <select
              value={
                recordsPerPage
              }
              onChange={(
                e
              ) =>
                setRecordsPerPage(
                  e.target.value
                )
              }
            >

              <option value="20">
                20
              </option>

              <option value="50">
                50
              </option>

              <option value="100">
                100
              </option>

            </select>

          </div>

          <div className="filter-field search">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search vehicle..."
              value={
                searchWord
              }
              onChange={(
                e
              ) =>
                setSearchWord(
                  e.target.value
                )
              }
            />

          </div>

          <div className="filter-field">

            <label>
              Search On
            </label>

            <select
              value={
                searchOn
              }
              onChange={(
                e
              ) =>
                setSearchOn(
                  e.target.value
                )
              }
            >

              <option value="Any">
                Any
              </option>

              <option value="Registration No.">
                Registration No.
              </option>

              <option value="Vehicle">
                Vehicle
              </option>

            </select>

          </div>

        </div>

        {/* MESSAGES */}

        {error && (

          <div className="vehicles-error">
            {
              error
            }
          </div>

        )}

        {success && (

          <div className="vehicles-success">
            {
              success
            }
          </div>

        )}

        {/* TABLE */}

        <div className="vehicles-table-wrapper">

          <table className="vehicles-table">

            <thead>

              <tr>

                <th>
                  Reg No.
                </th>

                <th>
                  Vehicle
                </th>

                <th>
                  Trips
                </th>

                <th>
                  Odometer
                </th>

                <th>
                  Status
                </th>

                {role !==
                  "Viewer" && (

                  <th>
                    Actions
                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 5
                        : 6
                    }
                  >
                    Loading vehicles...
                  </td>

                </tr>

              ) : filteredVehicles.length ===
                0 ? (

                <tr className="empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 5
                        : 6
                    }
                  >
                    No vehicle records found.
                  </td>

                </tr>

              ) : (

                filteredVehicles.map(
                  (
                    vehicle
                  ) => (

                    <tr
                      key={
                        vehicle.id
                      }
                    >

                      <td>
                        {
                          vehicle.registration_no
                        }
                      </td>

                      <td>
                        {
                          vehicle.vehicle_name
                        }
                      </td>

                      <td>

                        <strong>
                          {
                            Number(
                              vehicle.completed_trips
                            ) ||
                            0
                          }
                        </strong>

                      </td>

                      <td>
                        {
                          vehicle.odometer ??
                          0
                        }
                      </td>

                      <td>

                        <span
                          className={
                            vehicle.status ===
                            "Active"
                              ? "vehicle-status active"
                              : "vehicle-status inactive"
                          }
                        >
                          {
                            vehicle.status
                          }
                        </span>

                      </td>

                      {role !==
                        "Viewer" && (

                        <td>

                          <div className="vehicle-row-actions">

                            <button
                              type="button"
                              className="vehicle-edit-btn"
                              onClick={() =>
                                handleEditClick(
                                  vehicle
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="vehicle-status-btn"
                              onClick={() =>
                                handleStatusChange(
                                  vehicle
                                )
                              }
                            >
                              {vehicle.status ===
                              "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            {role ===
                              "Administrator" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    vehicle
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  vehicle.id
                                }
                                style={{
                                  border:
                                    "1px solid #a83232",

                                  background:
                                    deletingId ===
                                    vehicle.id
                                      ? "#eeeeee"
                                      : "#ffffff",

                                  color:
                                    "#a83232",

                                  borderRadius:
                                    "4px",

                                  padding:
                                    "6px 10px",

                                  fontSize:
                                    "11px",

                                  fontWeight:
                                    "700",

                                  cursor:
                                    deletingId ===
                                    vehicle.id
                                      ? "not-allowed"
                                      : "pointer",

                                  opacity:
                                    deletingId ===
                                    vehicle.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {deletingId ===
                                vehicle.id
                                  ? "DELETING..."
                                  : "DELETE"}
                              </button>

                            )}

                          </div>

                        </td>

                      )}

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* EDIT VEHICLE */}

        {editingVehicle && (

          <div className="vehicle-edit-box">

            <h3>
              Edit Vehicle
            </h3>

            <form
              onSubmit={
                handleUpdateVehicle
              }
            >

              <div className="vehicle-edit-grid">

                <div>

                  <label>
                    Registration No.
                  </label>

                  <input
                    type="text"
                    name="registrationNo"
                    value={
                      editForm.registrationNo
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Vehicle
                  </label>

                  <input
                    type="text"
                    name="vehicleName"
                    value={
                      editForm.vehicleName
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={
                      editForm.location
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Odometer
                  </label>

                  <input
                    type="number"
                    name="odometer"
                    min="0"
                    value={
                      editForm.odometer
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

              </div>

              <div className="vehicle-edit-actions">

                <button
                  type="submit"
                  className="vehicle-save-btn"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="vehicle-cancel-btn"
                  onClick={() =>
                    setEditingVehicle(
                      null
                    )
                  }
                >
                  CANCEL
                </button>

              </div>

            </form>

          </div>

        )}

      </main>

    </div>
  );
}

export default Vehicles;