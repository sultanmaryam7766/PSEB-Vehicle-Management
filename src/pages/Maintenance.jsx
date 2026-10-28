import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import NotificationBell from "../components/NotificationBell";

import "./Maintenance.css";

function Maintenance() {
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
    records,
    setRecords,
  ] =
    useState([]);

  const [
    vehicles,
    setVehicles,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    locationFilter,
    setLocationFilter,
  ] =
    useState("All");

  const [
    monthFilter,
    setMonthFilter,
  ] =
    useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("All");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] =
    useState(20);

  const [
    searchWord,
    setSearchWord,
  ] =
    useState("");

  const [
    searchOn,
    setSearchOn,
  ] =
    useState("Any");

  /* =========================
     EDIT STATE
  ========================= */

  const [
    editingRecord,
    setEditingRecord,
  ] =
    useState(null);

  const [
    editSaving,
    setEditSaving,
  ] =
    useState(false);

  /* =========================
     DELETE STATE
  ========================= */

  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);

  const [
    editForm,
    setEditForm,
  ] =
    useState({
      vehicleId: "",
      maintenanceDate: "",
      serviceType: "",
      vendor: "",
      odometer: "",
      cost: "",
      nextServiceOdometer: "",
      remarks: "",
      status: "Scheduled",
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
     LOAD MAINTENANCE
  ========================= */

  const loadRecords =
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
              "http://localhost:5000/api/maintenance",
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
                "Unable to load maintenance records"
            );

            return;
          }

          setRecords(
            data.maintenanceRecords ||
              []
          );
        } catch (
          err
        ) {
          console.error(
            "Maintenance load error:",
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
            "Vehicle load error:",
            err
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
      loadRecords();
      loadVehicles();
    },
    [
      loadRecords,
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

  const displayDate = (
    value
  ) => {
    if (
      !value
    ) {
      return "--";
    }

    const date =
      dateOnly(
        value
      );

    const [
      year,
      month,
      day,
    ] =
      date.split(
        "-"
      );

    if (
      !year ||
      !month ||
      !day
    ) {
      return date;
    }

    return `${day}/${month}/${year}`;
  };

  const isOilChange = (
    value
  ) => {
    return String(
      value ||
        ""
    )
      .trim()
      .toLowerCase() ===
      "oil change";
  };

  const formatNumber = (
    value
  ) => {
    return Number(
      value ||
        0
    ).toLocaleString();
  };

  /* =========================
     NEXT SERVICE STATUS
  ========================= */

  const getNextServiceStatus = (
    record
  ) => {
    if (
      record.status !==
        "Completed" ||
      record.next_service_odometer ===
        null ||
      record.next_service_odometer ===
        undefined ||
      record.next_service_odometer ===
        ""
    ) {
      return {
        type:
          "none",

        text:
          "--",
      };
    }

    const nextOdometer =
      Number(
        record.next_service_odometer
      );

    const currentOdometer =
      Number(
        record.current_vehicle_odometer ??
          0
      );

    if (
      Number.isNaN(
        nextOdometer
      ) ||
      Number.isNaN(
        currentOdometer
      )
    ) {
      return {
        type:
          "none",

        text:
          "--",
      };
    }

    const remaining =
      nextOdometer -
      currentOdometer;

    if (
      remaining <
      0
    ) {
      return {
        type:
          "overdue",

        text:
          `${formatNumber(
            Math.abs(
              remaining
            )
          )} km Overdue`,
      };
    }

    if (
      remaining ===
      0
    ) {
      return {
        type:
          "due",

        text:
          "Due Now",
      };
    }

    if (
      remaining <=
      500
    ) {
      return {
        type:
          "soon",

        text:
          `${formatNumber(
            remaining
          )} km remaining`,
      };
    }

    return {
      type:
        "normal",

      text:
        `${formatNumber(
          remaining
        )} km remaining`,
    };
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (
    record
  ) => {
    setEditingRecord(
      record
    );

    setEditForm({
      vehicleId:
        String(
          record.vehicle_id
        ),

      maintenanceDate:
        dateOnly(
          record.maintenance_date
        ),

      serviceType:
        record.service_type ||
        "",

      vendor:
        record.vendor ||
        "",

      odometer:
        record.odometer ??
        "",

      cost:
        record.cost ??
        "",

      nextServiceOdometer:
        record.next_service_odometer ??
        "",

      remarks:
        record.remarks ||
        "",

      status:
        record.status ||
        "Scheduled",
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
        previous
      ) => ({
        ...previous,

        [name]:
          value,
      })
    );
  };

  const handleServiceChange =
    (
      e
    ) => {
      const value =
        e.target.value;

      setEditForm(
        (
          previous
        ) => ({
          ...previous,

          serviceType:
            value,

          nextServiceOdometer:
            isOilChange(
              value
            )
              ? ""
              : previous.nextServiceOdometer,
        })
      );
    };

  const handleStatusChange =
    (
      e
    ) => {
      const value =
        e.target.value;

      setEditForm(
        (
          previous
        ) => ({
          ...previous,

          status:
            value,

          nextServiceOdometer:
            value !==
            "Completed"
              ? ""
              : previous.nextServiceOdometer,
        })
      );
    };

  const handleUpdate =
    async (
      e
    ) => {
      e.preventDefault();

      if (
        !editingRecord
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      setEditSaving(
        true
      );

      try {
        const payload = {
          vehicleId:
            editForm.vehicleId,

          maintenanceDate:
            editForm.maintenanceDate,

          serviceType:
            editForm.serviceType,

          vendor:
            editForm.vendor,

          odometer:
            editForm.odometer,

          cost:
            editForm.cost,

          nextServiceOdometer:
            isOilChange(
              editForm.serviceType
            )
              ? ""
              : editForm.nextServiceOdometer,

          remarks:
            editForm.remarks,

          status:
            editForm.status,
        };

        const response =
          await fetch(
            `http://localhost:5000/api/maintenance/${editingRecord.id}`,
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
                  payload
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
              "Unable to update maintenance record"
          );

          return;
        }

        let message =
          "Maintenance record updated successfully";

        if (
          editForm.status ===
            "Completed" &&
          isOilChange(
            editForm.serviceType
          )
        ) {
          const calculated =
            Number(
              editForm.odometer
            ) +
            5000;

          message =
            `Maintenance completed. Next oil change due at ${formatNumber(
              calculated
            )} km.`;
        }

        setSuccess(
          message
        );

        setEditingRecord(
          null
        );

        await loadRecords();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Maintenance update error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setEditSaving(
          false
        );
      }
    };

  /* =========================
     DELETE
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      record
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const jobId =
        `JOB-${String(
          record.id
        ).padStart(
          5,
          "0"
        )}`;

      const vehicle =
        `${record.registration_no || ""}${record.vehicle_name ? ` - ${record.vehicle_name}` : ""}`;

      const confirmed =
        window.confirm(
          `Delete ${jobId}?\n\n` +
          `${vehicle}\n` +
          `${record.service_type || ""}\n\n` +
          "This maintenance record will be permanently deleted.\n" +
          "Maintenance history, reports and service notifications may change.\n\n" +
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
        record.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/maintenance/${record.id}`,
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
            "Only Administrator can delete maintenance records"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete maintenance record"
          );

          return;
        }

        setSuccess(
          `${jobId} deleted successfully`
        );

        await loadRecords();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Maintenance delete error:",
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
            records
              .map(
                (
                  record
                ) =>
                  record.location
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        records,
      ]
    );

  const months =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            records
              .map(
                (
                  record
                ) =>
                  record.maintenance_date
                    ? String(
                        record.maintenance_date
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
        records,
      ]
    );

  const filteredRecords =
    useMemo(
      () => {
        let result = [
          ...records,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                record
              ) =>
                record.location ===
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
                record
              ) =>
                String(
                  record.maintenance_date
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
                record
              ) =>
                record.status ===
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
                record
              ) => {
                const jobId =
                  `job-${record.id}`.toLowerCase();

                const vehicle =
                  `${record.registration_no || ""} ${record.vehicle_name || ""}`.toLowerCase();

                const service =
                  String(
                    record.service_type ||
                      ""
                  ).toLowerCase();

                const vendor =
                  String(
                    record.vendor ||
                      ""
                  ).toLowerCase();

                if (
                  searchOn ===
                  "Job ID"
                ) {
                  return jobId.includes(
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
                  "Service"
                ) {
                  return service.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Vendor"
                ) {
                  return vendor.includes(
                    word
                  );
                }

                return (
                  jobId.includes(
                    word
                  ) ||
                  vehicle.includes(
                    word
                  ) ||
                  service.includes(
                    word
                  ) ||
                  vendor.includes(
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
        records,
        locationFilter,
        monthFilter,
        statusFilter,
        recordsPerPage,
        searchWord,
        searchOn,
      ]
    );

  return (
    <div className="maintenance-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="maintenance-sidebar">

       <div className="maintenance-welcome">

  <div className="maintenance-profile-avatar">
    {userInitials}
  </div>

  <div className="maintenance-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="maintenance-menu">

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
                  "Maintenance"
                    ? "maintenance-menu-btn active"
                    : "maintenance-menu-btn"
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
          className="maintenance-logout"
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

      <main className="maintenance-content">

        <div className="maintenance-header">

          <h1>
            Maintenance
          </h1>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="maintenance-filters">

          <div className="maintenance-filter-field">

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

          <div className="maintenance-filter-field">

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

          <div className="maintenance-filter-field">

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

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

          </div>

          <div className="maintenance-filter-field">

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

          <div className="maintenance-filter-field search">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search maintenance..."
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

          <div className="maintenance-filter-field">

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

              <option value="Job ID">
                Job ID
              </option>

              <option value="Vehicle">
                Vehicle
              </option>

              <option value="Service">
                Service
              </option>

              <option value="Vendor">
                Vendor
              </option>

            </select>

          </div>

        </div>

        {role !==
          "Viewer" && (

          <div className="maintenance-actions">

            <button
              className="maintenance-add-btn"
              onClick={() =>
                navigate(
                  "/add-maintenance"
                )
              }
            >
              + ADD MAINTENANCE
            </button>

          </div>

        )}

        {success && (

          <div className="maintenance-success">
            {
              success
            }
          </div>

        )}

        {error && (

          <div className="maintenance-error">
            {
              error
            }
          </div>

        )}

        {/* =========================
            TABLE
        ========================= */}

        <div className="maintenance-table-wrapper">

          <table className="maintenance-table">

            <thead>

              <tr>

                <th>
                  Job ID
                </th>

                <th>
                  Date
                </th>

                <th>
                  Vehicle
                </th>

                <th>
                  Service
                </th>

                <th>
                  Odometer
                </th>

                <th>
                  Next Service
                </th>

                <th>
                  Cost
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

                <tr className="maintenance-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 8
                        : 9
                    }
                  >
                    Loading maintenance records...
                  </td>

                </tr>

              ) : filteredRecords.length ===
                0 ? (

                <tr className="maintenance-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 8
                        : 9
                    }
                  >
                    No maintenance records found.
                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (
                    record
                  ) => {
                    const serviceStatus =
                      getNextServiceStatus(
                        record
                      );

                    return (

                      <tr
                        key={
                          record.id
                        }
                      >

                        <td>
                          JOB-
                          {String(
                            record.id
                          ).padStart(
                            5,
                            "0"
                          )}
                        </td>

                        <td>
                          {displayDate(
                            record.maintenance_date
                          )}
                        </td>

                        <td>

                          <strong>
                            {
                              record.registration_no
                            }
                          </strong>

                          <br />

                          {
                            record.vehicle_name
                          }

                        </td>

                        <td>
                          {
                            record.service_type
                          }
                        </td>

                        <td>
                          {formatNumber(
                            record.odometer
                          )}{" "}
                          km
                        </td>

                        <td>

                          {record.status !==
                          "Completed" ? (

                            <span className="maintenance-next-na">
                              --
                            </span>

                          ) : record.next_service_odometer ? (

                            <div className="maintenance-next-service">

                              <strong>
                                {formatNumber(
                                  record.next_service_odometer
                                )}{" "}
                                km
                              </strong>

                              {serviceStatus.type ===
                              "overdue" ? (

                                <span className="maintenance-due-text">
                                  {
                                    serviceStatus.text
                                  }
                                </span>

                              ) : serviceStatus.type ===
                                "due" ? (

                                <span className="maintenance-due-text">
                                  Due Now
                                </span>

                              ) : serviceStatus.type ===
                                "soon" ? (

                                <span className="maintenance-due-text">
                                  {
                                    serviceStatus.text
                                  }
                                </span>

                              ) : (

                                <span>
                                  {
                                    serviceStatus.text
                                  }
                                </span>

                              )}

                            </div>

                          ) : (

                            <span className="maintenance-next-na">
                              --
                            </span>

                          )}

                        </td>

                        <td>
                          Rs.{" "}
                          {Number(
                            record.cost ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td>

                          <span
                            className={`maintenance-status ${String(
                              record.status ||
                                ""
                            )
                              .toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >
                            {
                              record.status
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
                                className="maintenance-edit-btn"
                                onClick={() =>
                                  handleEdit(
                                    record
                                  )
                                }
                              >
                                EDIT
                              </button>

                              {role ===
                                "Administrator" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      record
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    record.id
                                  }
                                  style={{
                                    border:
                                      "1px solid #a83232",

                                    background:
                                      deletingId ===
                                      record.id
                                        ? "#eeeeee"
                                        : "#ffffff",

                                    color:
                                      "#a83232",

                                    borderRadius:
                                      "4px",

                                    padding:
                                      "6px 9px",

                                    fontSize:
                                      "11px",

                                    fontWeight:
                                      "700",

                                    cursor:
                                      deletingId ===
                                      record.id
                                        ? "not-allowed"
                                        : "pointer",

                                    opacity:
                                      deletingId ===
                                      record.id
                                        ? 0.6
                                        : 1,
                                  }}
                                >
                                  {deletingId ===
                                  record.id
                                    ? "DELETING..."
                                    : "DELETE"}
                                </button>

                              )}

                            </div>

                          </td>

                        )}

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* =========================
            EDIT MODAL
        ========================= */}

        {editingRecord && (

          <div className="maintenance-edit-overlay">

            <div className="maintenance-edit-modal">

              <div className="maintenance-edit-header">

                <div>

                  <h2>
                    Edit Maintenance
                  </h2>

                  <span>
                    JOB-
                    {String(
                      editingRecord.id
                    ).padStart(
                      5,
                      "0"
                    )}
                  </span>

                </div>

                <button
                  type="button"
                  className="maintenance-edit-close"
                  onClick={() =>
                    setEditingRecord(
                      null
                    )
                  }
                >
                  ×
                </button>

              </div>

              <form
                className="maintenance-edit-form"
                onSubmit={
                  handleUpdate
                }
              >

                <div className="maintenance-edit-grid">

                  <div className="maintenance-edit-field">

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

                      <option value="">
                        Select Vehicle
                      </option>

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

                  <div className="maintenance-edit-field">

                    <label>
                      Maintenance Date
                    </label>

                    <input
                      type="date"
                      name="maintenanceDate"
                      value={
                        editForm.maintenanceDate
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />

                  </div>

                  <div className="maintenance-edit-field">

                    <label>
                      Service Type
                    </label>

                    <input
                      type="text"
                      name="serviceType"
                      value={
                        editForm.serviceType
                      }
                      onChange={
                        handleServiceChange
                      }
                      placeholder="e.g. Oil Change"
                      required
                    />

                  </div>

                  <div className="maintenance-edit-field">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        editForm.status
                      }
                      onChange={
                        handleStatusChange
                      }
                      required
                    >

                      <option value="Scheduled">
                        Scheduled
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                    </select>

                  </div>

                  <div className="maintenance-edit-field">

                    <label>
                      Vendor / Workshop
                    </label>

                    <input
                      type="text"
                      name="vendor"
                      value={
                        editForm.vendor
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                  <div className="maintenance-edit-field">

                    <label>
                      Service Odometer
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="odometer"
                      value={
                        editForm.odometer
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />

                  </div>

                  <div className="maintenance-edit-field">

                    <label>
                      Cost
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="cost"
                      value={
                        editForm.cost
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                  {editForm.status ===
                    "Completed" &&
                    !isOilChange(
                      editForm.serviceType
                    ) && (

                      <div className="maintenance-edit-field">

                        <label>
                          Next Service Odometer
                        </label>

                        <input
                          type="number"
                          min="0"
                          name="nextServiceOdometer"
                          value={
                            editForm.nextServiceOdometer
                          }
                          onChange={
                            handleEditChange
                          }
                          placeholder="Optional"
                        />

                      </div>

                    )}

                  {editForm.status ===
                    "Completed" &&
                    isOilChange(
                      editForm.serviceType
                    ) && (

                      <div className="maintenance-auto-box">

                        <span>
                          Automatic Next Oil Change
                        </span>

                        <strong>
                          {editForm.odometer
                            ? `${formatNumber(
                                Number(
                                  editForm.odometer
                                ) +
                                  5000
                              )} km`
                            : "--"}
                        </strong>

                        <small>
                          Oil Change automatically repeats after 5,000 km.
                        </small>

                      </div>

                    )}

                  <div className="maintenance-edit-field maintenance-edit-full">

                    <label>
                      Remarks
                    </label>

                    <textarea
                      name="remarks"
                      value={
                        editForm.remarks
                      }
                      onChange={
                        handleEditChange
                      }
                      rows="3"
                    />

                  </div>

                </div>

                <div className="maintenance-edit-note">

                  {editForm.status ===
                    "Scheduled" &&
                    "Scheduled means maintenance is planned but has not been completed yet."}

                  {editForm.status ===
                    "In Progress" &&
                    "Maintenance work is currently being carried out."}

                  {editForm.status ===
                    "Completed" &&
                    isOilChange(
                      editForm.serviceType
                    ) &&
                    "When you save this Oil Change as Completed, the system will automatically set the next Oil Change after 5,000 km."}

                  {editForm.status ===
                    "Completed" &&
                    !isOilChange(
                      editForm.serviceType
                    ) &&
                    "Maintenance is complete. You may optionally enter the next service odometer for this service."}

                </div>

                <div className="maintenance-edit-actions">

                  <button
                    type="button"
                    className="maintenance-edit-cancel"
                    onClick={() =>
                      setEditingRecord(
                        null
                      )
                    }
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    className="maintenance-edit-save"
                    disabled={
                      editSaving
                    }
                  >
                    {editSaving
                      ? "SAVING..."
                      : "SAVE CHANGES"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default Maintenance;