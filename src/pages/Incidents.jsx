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

import "./Incidents.css";

function Incidents() {
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
    incidents,
    setIncidents,
  ] = useState([]);

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    drivers,
    setDrivers,
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
    monthFilter,
    setMonthFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] = useState(20);

  const [
    searchWord,
    setSearchWord,
  ] = useState("");

  const [
    searchOn,
    setSearchOn,
  ] = useState("Any");

  const [
    editingIncident,
    setEditingIncident,
  ] = useState(null);

  const [
    editForm,
    setEditForm,
  ] = useState({
    vehicleId: "",
    driverId: "",
    incidentDate: "",
    location: "",
    incidentType: "",
    description: "",
    estimatedCost: "",
    actualCost: "",
    policeReportNo: "",
    insuranceClaimNo: "",
    status: "Open",
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
     LOAD INCIDENTS
  ========================= */

  const loadIncidents =
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
              "http://localhost:5000/api/incidents",
              {
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
                "Unable to load incidents"
            );

            return;
          }

          setIncidents(
            data.incidents ||
              []
          );
        } catch (
          err
        ) {
          console.error(
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

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/vehicles",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            response.ok
          ) {
            setVehicles(
              data.vehicles ||
                []
            );
          }
        } catch (
          err
        ) {
          console.error(
            err
          );
        }
      },
      [
        token,
      ]
    );

  /* =========================
     LOAD DRIVERS
  ========================= */

  const loadDrivers =
    useCallback(
      async () => {
        if (
          !token
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/drivers",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            response.ok
          ) {
            setDrivers(
              data.drivers ||
                []
            );
          }
        } catch (
          err
        ) {
          console.error(
            err
          );
        }
      },
      [
        token,
      ]
    );

  useEffect(
    () => {
      loadIncidents();
      loadVehicles();
      loadDrivers();
    },
    [
      loadIncidents,
      loadVehicles,
      loadDrivers,
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
      } else {
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
     HELPERS
  ========================= */

  const dateOnly = (
    value
  ) => {
    if (
      !value
    ) {
      return "";
    }

    return String(
      value
    ).slice(
      0,
      10
    );
  };

  const incidentId = (
    id
  ) =>
    `INC-${String(
      id
    ).padStart(
      5,
      "0"
    )}`;

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (
    incident
  ) => {
    setEditingIncident(
      incident
    );

    setEditForm({
      vehicleId:
        incident.vehicle_id,

      driverId:
        incident.driver_id ||
        "",

      incidentDate:
        dateOnly(
          incident.incident_date
        ),

      location:
        incident.location ||
        "",

      incidentType:
        incident.incident_type ||
        "",

      description:
        incident.description ||
        "",

      estimatedCost:
        incident.estimated_cost ??
        "",

      actualCost:
        incident.actual_cost ??
        "",

      policeReportNo:
        incident.police_report_no ||
        "",

      insuranceClaimNo:
        incident.insurance_claim_no ||
        "",

      status:
        incident.status ||
        "Open",
    });

    setError(
      ""
    );

    setSuccess(
      ""
    );
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

  const handleUpdate =
    async (
      e
    ) => {
      e.preventDefault();

      setError(
        ""
      );

      setSuccess(
        ""
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/incidents/${editingIncident.id}`,
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
              "Unable to update incident"
          );

          return;
        }

        setSuccess(
          "Incident updated successfully"
        );

        setEditingIncident(
          null
        );

        await loadIncidents();
      } catch (
        err
      ) {
        console.error(
          err
        );

        setError(
          "Unable to connect to server"
        );
      }
    };

  /* =========================
     DELETE
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      incident
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const code =
        incidentId(
          incident.id
        );

      const vehicle =
        `${incident.registration_no || ""}${
          incident.vehicle_name
            ? ` - ${incident.vehicle_name}`
            : ""
        }`;

      const driver =
        incident.driver_name ||
        "No Driver / Unknown";

      const estimated =
        Number(
          incident.estimated_cost ||
            0
        ).toLocaleString();

      const actual =
        Number(
          incident.actual_cost ||
            0
        ).toLocaleString();

      const confirmed =
        window.confirm(
          `Delete ${code}?\n\n` +
          `${incident.incident_type || ""}\n` +
          `${vehicle}\n` +
          `Driver: ${driver}\n` +
          `Estimated Cost: Rs. ${estimated}\n` +
          `Actual Cost: Rs. ${actual}\n\n` +
          "This incident will be permanently deleted.\n" +
          "Vehicle History, incident totals and Reports will update.\n\n" +
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
        incident.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/incidents/${incident.id}`,
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
            "Only Administrator can delete incidents"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete incident"
          );

          return;
        }

        setSuccess(
          `${code} deleted successfully`
        );

        if (
          editingIncident?.id ===
          incident.id
        ) {
          setEditingIncident(
            null
          );
        }

        await loadIncidents();
      } catch (
        err
      ) {
        console.error(
          "Incident delete error:",
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
        return [
          "All",

          ...new Set(
            incidents
              .map(
                (
                  incident
                ) =>
                  incident.location
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        incidents,
      ]
    );

  const months =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            incidents
              .map(
                (
                  incident
                ) =>
                  incident.incident_date
                    ? String(
                        incident.incident_date
                      ).slice(
                        0,
                        7
                      )
                    : null
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        incidents,
      ]
    );

  const filteredIncidents =
    useMemo(
      () => {
        let result = [
          ...incidents,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                incident
              ) =>
                incident.location ===
                locationFilter
            );
        }

        if (
          monthFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                incident
              ) =>
                String(
                  incident.incident_date
                ).slice(
                  0,
                  7
                ) ===
                monthFilter
            );
        }

        if (
          statusFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                incident
              ) =>
                incident.status ===
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
                incident
              ) => {
                const id =
                  incidentId(
                    incident.id
                  ).toLowerCase();

                const vehicle =
                  `${incident.registration_no || ""} ${incident.vehicle_name || ""}`.toLowerCase();

                const driver =
                  `${incident.driver_code || ""} ${incident.driver_name || ""}`.toLowerCase();

                const type =
                  String(
                    incident.incident_type ||
                      ""
                  ).toLowerCase();

                if (
                  searchOn ===
                  "Incident ID"
                ) {
                  return id.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Vehicle"
                ) {
                  return vehicle.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Driver"
                ) {
                  return driver.includes(
                    word
                  );
                }

                return (
                  id.includes(
                    word
                  ) ||
                  vehicle.includes(
                    word
                  ) ||
                  driver.includes(
                    word
                  ) ||
                  type.includes(
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
        incidents,
        locationFilter,
        monthFilter,
        statusFilter,
        recordsPerPage,
        searchWord,
        searchOn,
      ]
    );

  return (
    <div className="incidents-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="incidents-sidebar">

     <div className="incidents-welcome">

  <div className="incidents-profile-avatar">
    {userInitials}
  </div>

  <div className="incidents-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>
        <div className="incidents-menu">

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
                  "Incidents"
                    ? "incidents-menu-btn active"
                    : "incidents-menu-btn"
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
          className="incidents-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="incidents-content">

        <div className="incidents-header">

          <h1>
            Incidents / Accidents
          </h1>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="incidents-filters">

          <div className="incidents-filter-field">

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

          <div className="incidents-filter-field">

            <label>
              Month
            </label>

            <select
              value={
                monthFilter
              }
              onChange={(
                e
              ) =>
                setMonthFilter(
                  e.target.value
                )
              }
            >

              {months.map(
                (
                  month
                ) => (

                  <option
                    key={
                      month
                    }
                    value={
                      month
                    }
                  >
                    {
                      month
                    }
                  </option>

                )
              )}

            </select>

          </div>

          <div className="incidents-filter-field">

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

              <option value="Open">
                Open
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

          </div>

          <div className="incidents-filter-field">

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

          <div className="incidents-filter-field">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search incident..."
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

          <div className="incidents-filter-field">

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

              <option value="Incident ID">
                Incident ID
              </option>

              <option value="Vehicle">
                Vehicle
              </option>

              <option value="Driver">
                Driver
              </option>

            </select>

          </div>

        </div>

        {/* =========================
            ADD
        ========================= */}

        {role !==
          "Viewer" && (

          <div className="incidents-actions">

            <button
              className="incidents-add-btn"
              onClick={() =>
                navigate(
                  "/add-incident"
                )
              }
            >
              + ADD INCIDENT
            </button>

          </div>

        )}

        {/* =========================
            MESSAGES
        ========================= */}

        {error && (

          <div className="incidents-error">
            {
              error
            }
          </div>

        )}

        {success && (

          <div className="incidents-success">
            {
              success
            }
          </div>

        )}

        {/* =========================
            TABLE
        ========================= */}

        <div className="incidents-table-wrapper">

          <table className="incidents-table">

            <thead>

              <tr>

                <th>
                  Incident
                </th>

                <th>
                  Vehicle
                </th>

                <th>
                  Driver
                </th>

                <th>
                  Estimated Cost
                </th>

                <th>
                  Status
                </th>

                {role !==
                  "Viewer" && (

                  <th>
                    Action
                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="incidents-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 5
                        : 6
                    }
                  >
                    Loading incidents...
                  </td>

                </tr>

              ) : filteredIncidents.length ===
                0 ? (

                <tr className="incidents-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 5
                        : 6
                    }
                  >
                    No incidents found.
                  </td>

                </tr>

              ) : (

                filteredIncidents.map(
                  (
                    incident
                  ) => (

                    <tr
                      key={
                        incident.id
                      }
                    >

                      <td>

                        <strong>
                          {incidentId(
                            incident.id
                          )}
                        </strong>

                        <br />

                        <small>
                          {
                            incident.incident_type
                          }
                          {" • "}
                          {dateOnly(
                            incident.incident_date
                          )}
                        </small>

                      </td>

                      <td>

                        <strong>
                          {
                            incident.registration_no
                          }
                        </strong>

                        <br />

                        {
                          incident.vehicle_name
                        }

                      </td>

                      <td>

                        {incident.driver_name ? (

                          <>

                            <strong>
                              {
                                incident.driver_name
                              }
                            </strong>

                            <br />

                            <small>
                              {
                                incident.driver_code
                              }
                            </small>

                          </>

                        ) : (
                          "--"
                        )}

                      </td>

                      <td>
                        {Number(
                          incident.estimated_cost ||
                            0
                        ).toLocaleString()}
                      </td>

                      <td>

                        <span
                          className={`incident-status ${String(
                            incident.status ||
                              ""
                          )
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            incident.status
                          }
                        </span>

                      </td>

                      {role !==
                        "Viewer" && (

                        <td>

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              gap:
                                "6px",

                              flexWrap:
                                "wrap",
                            }}
                          >

                            <button
                              type="button"
                              className="incident-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  incident
                                )
                              }
                            >
                              Edit
                            </button>

                            {role ===
                              "Administrator" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    incident
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  incident.id
                                }
                                style={{
                                  border:
                                    "1px solid #a83232",

                                  background:
                                    deletingId ===
                                    incident.id
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
                                    incident.id
                                      ? "not-allowed"
                                      : "pointer",

                                  opacity:
                                    deletingId ===
                                    incident.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {deletingId ===
                                incident.id
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

        {/* =========================
            EDIT INCIDENT
        ========================= */}

        {editingIncident && (

          <div className="incident-edit-box">

            <h3>
              Edit Incident{" "}
              {incidentId(
                editingIncident.id
              )}
            </h3>

            <form
              onSubmit={
                handleUpdate
              }
            >

              <div className="incident-edit-grid">

                <div>

                  <label>
                    Vehicle
                  </label>

                  <select
                    name="vehicleId"
                    value={
                      editForm.vehicleId
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  >

                    {vehicles.map(
                      (
                        vehicle
                      ) => (

                        <option
                          key={
                            vehicle.id
                          }
                          value={
                            vehicle.id
                          }
                        >
                          {
                            vehicle.registration_no
                          }{" "}
                          -{" "}
                          {
                            vehicle.vehicle_name
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label>
                    Driver
                  </label>

                  <select
                    name="driverId"
                    value={
                      editForm.driverId
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="">
                      No Driver / Unknown
                    </option>

                    {drivers.map(
                      (
                        driver
                      ) => (

                        <option
                          key={
                            driver.id
                          }
                          value={
                            driver.id
                          }
                        >
                          {
                            driver.driver_code
                          }{" "}
                          -{" "}
                          {
                            driver.driver_name
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label>
                    Incident Date
                  </label>

                  <input
                    type="date"
                    name="incidentDate"
                    value={
                      editForm.incidentDate
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
                    name="location"
                    value={
                      editForm.location
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Incident Type
                  </label>

                  <select
                    name="incidentType"
                    value={
                      editForm.incidentType
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  >

                    <option value="Accident">
                      Accident
                    </option>

                    <option value="Vehicle Damage">
                      Vehicle Damage
                    </option>

                    <option value="Breakdown">
                      Breakdown
                    </option>

                    <option value="Theft">
                      Theft
                    </option>

                    <option value="Traffic Violation">
                      Traffic Violation
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                <div>

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      editForm.status
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="Open">
                      Open
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

                <div>

                  <label>
                    Estimated Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="estimatedCost"
                    value={
                      editForm.estimatedCost
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Actual Cost
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="actualCost"
                    value={
                      editForm.actualCost
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Police Report No.
                  </label>

                  <input
                    name="policeReportNo"
                    value={
                      editForm.policeReportNo
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Insurance Claim No.
                  </label>

                  <input
                    name="insuranceClaimNo"
                    value={
                      editForm.insuranceClaimNo
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div className="incident-edit-full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      editForm.description
                    }
                    onChange={
                      handleEditChange
                    }
                    rows="4"
                  />

                </div>

              </div>

              <div className="incident-edit-actions">

                <button
                  type="submit"
                  className="incident-save-btn"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="incident-cancel-btn"
                  onClick={() =>
                    setEditingIncident(
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

export default Incidents;