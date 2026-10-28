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

import "./Expenses.css";

function Expenses() {
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
    expenses,
    setExpenses,
  ] =
    useState([]);

  const [
    vehicles,
    setVehicles,
  ] =
    useState([]);

  const [
    trips,
    setTrips,
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
    deletingId,
    setDeletingId,
  ] =
    useState(null);

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
    categoryFilter,
    setCategoryFilter,
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

  const [
    editingExpense,
    setEditingExpense,
  ] =
    useState(null);

  const [
    editForm,
    setEditForm,
  ] =
    useState({
      vehicleId: "",
      tripId: "",
      expenseDate: "",
      category: "",
      description: "",
      amount: "",
      vendor: "",
      referenceNo: "",
      remarks: "",
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
     LOAD EXPENSES
  ========================= */

  const loadExpenses =
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
              "http://localhost:5000/api/expenses",
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
                "Unable to load expenses"
            );

            return;
          }

          setExpenses(
            data.expenses ||
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
     LOAD TRIPS
  ========================= */

  const loadTrips =
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
              "http://localhost:5000/api/trips",
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
            setTrips(
              data.trips ||
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
      loadExpenses();
      loadVehicles();
      loadTrips();
    },
    [
      loadExpenses,
      loadVehicles,
      loadTrips,
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

  const expenseId = (
    id
  ) =>
    `EXP-${String(
      id
    ).padStart(
      5,
      "0"
    )}`;

  const tripId = (
    id
  ) => {
    if (
      !id
    ) {
      return "--";
    }

    return `TRIP-${String(
      id
    ).padStart(
      5,
      "0"
    )}`;
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (
    expense
  ) => {
    setEditingExpense(
      expense
    );

    setEditForm({
      vehicleId:
        expense.vehicle_id,

      tripId:
        expense.trip_id ||
        "",

      expenseDate:
        dateOnly(
          expense.expense_date
        ),

      category:
        expense.category ||
        "",

      description:
        expense.description ||
        "",

      amount:
        expense.amount ??
        "",

      vendor:
        expense.vendor ||
        "",

      referenceNo:
        expense.reference_no ||
        "",

      remarks:
        expense.remarks ||
        "",
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
            `http://localhost:5000/api/expenses/${editingExpense.id}`,
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
              "Unable to update expense"
          );

          return;
        }

        setSuccess(
          "Expense updated successfully"
        );

        setEditingExpense(
          null
        );

        await loadExpenses();
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
      expense
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const code =
        expenseId(
          expense.id
        );

      const vehicle =
        `${expense.registration_no || ""}${
          expense.vehicle_name
            ? ` - ${expense.vehicle_name}`
            : ""
        }`;

      const linkedTrip =
        expense.trip_id
          ? tripId(
              expense.trip_id
            )
          : "No Linked Trip";

      const amount =
        Number(
          expense.amount ||
            0
        ).toLocaleString(
          undefined,
          {
            minimumFractionDigits:
              2,

            maximumFractionDigits:
              2,
          }
        );

      const confirmed =
        window.confirm(
          `Delete ${code}?\n\n` +
          `${vehicle}\n` +
          `Category: ${expense.category || "--"}\n` +
          `Trip: ${linkedTrip}\n` +
          `Amount: Rs. ${amount}\n\n` +
          "This expense will be permanently deleted.\n" +
          "Vehicle History, Reports and total cost calculations will update.\n\n" +
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
        expense.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/expenses/${expense.id}`,
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
            "Only Administrator can delete expenses"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete expense"
          );

          return;
        }

        setSuccess(
          `${code} deleted successfully`
        );

        if (
          editingExpense?.id ===
          expense.id
        ) {
          setEditingExpense(
            null
          );
        }

        await loadExpenses();
      } catch (
        err
      ) {
        console.error(
          "Expense delete error:",
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
     FILTER DATA
  ========================= */

  const locations =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            expenses
              .map(
                (
                  expense
                ) =>
                  expense.location
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        expenses,
      ]
    );

  const months =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            expenses
              .map(
                (
                  expense
                ) =>
                  expense.expense_date
                    ? String(
                        expense.expense_date
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
        expenses,
      ]
    );

  const filteredExpenses =
    useMemo(
      () => {
        let result = [
          ...expenses,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                expense
              ) =>
                expense.location ===
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
                expense
              ) =>
                String(
                  expense.expense_date
                ).slice(
                  0,
                  7
                ) ===
                monthFilter
            );
        }

        if (
          categoryFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                expense
              ) =>
                expense.category ===
                categoryFilter
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
                expense
              ) => {
                const vehicle =
                  `${expense.registration_no || ""} ${expense.vehicle_name || ""}`.toLowerCase();

                const category =
                  String(
                    expense.category ||
                      ""
                  ).toLowerCase();

                const description =
                  String(
                    expense.description ||
                      ""
                  ).toLowerCase();

                const vendor =
                  String(
                    expense.vendor ||
                      ""
                  ).toLowerCase();

                const id =
                  expenseId(
                    expense.id
                  ).toLowerCase();

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
                  "Category"
                ) {
                  return category.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Description"
                ) {
                  return description.includes(
                    word
                  );
                }

                return (
                  vehicle.includes(
                    word
                  ) ||
                  category.includes(
                    word
                  ) ||
                  description.includes(
                    word
                  ) ||
                  vendor.includes(
                    word
                  ) ||
                  id.includes(
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
        expenses,
        locationFilter,
        monthFilter,
        categoryFilter,
        recordsPerPage,
        searchWord,
        searchOn,
      ]
    );

  return (
    <div className="expenses-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="expenses-sidebar">

      <div className="expenses-welcome">

  <div className="expenses-profile-avatar">
    {userInitials}
  </div>

  <div className="expenses-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="expenses-menu">

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
                  "Expenses"
                    ? "expenses-menu-btn active"
                    : "expenses-menu-btn"
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
          className="expenses-logout"
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

      <main className="expenses-content">

        <div className="expenses-header">

          <h1>
            Expenses
          </h1>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="expenses-filters">

          <div className="expenses-filter-field">

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

          <div className="expenses-filter-field">

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

          <div className="expenses-filter-field">

            <label>
              Category
            </label>

            <select
              value={
                categoryFilter
              }
              onChange={(
                e
              ) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Fuel">
                Fuel
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Repair">
                Repair
              </option>

              <option value="Insurance">
                Insurance
              </option>

              <option value="Tax">
                Tax
              </option>

              <option value="Toll">
                Toll
              </option>

              <option value="Parking">
                Parking
              </option>

              <option value="Registration / Permit">
                Registration / Permit
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          <div className="expenses-filter-field">

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

          <div className="expenses-filter-field">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search expense..."
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

          <div className="expenses-filter-field">

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

              <option value="Vehicle">
                Vehicle
              </option>

              <option value="Category">
                Category
              </option>

              <option value="Description">
                Description
              </option>

            </select>

          </div>

        </div>

        {/* =========================
            ADD EXPENSE
        ========================= */}

        {role !==
          "Viewer" && (

          <div className="expenses-actions">

            <button
              className="expenses-add-btn"
              onClick={() =>
                navigate(
                  "/add-expense"
                )
              }
            >
              + ADD EXPENSE
            </button>

          </div>

        )}

        {/* =========================
            MESSAGES
        ========================= */}

        {error && (

          <div className="expenses-error">
            {
              error
            }
          </div>

        )}

        {success && (

          <div className="expenses-success">
            {
              success
            }
          </div>

        )}

        {/* =========================
            TABLE
        ========================= */}

        <div className="expenses-table-wrapper">

          <table className="expenses-table">

            <thead>

              <tr>

                <th>
                  Expense
                </th>

                <th>
                  Date
                </th>

                <th>
                  Vehicle
                </th>

                <th>
                  Category
                </th>

                <th>
                  Description
                </th>

                <th>
                  Trip
                </th>

                <th>
                  Amount
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

                <tr className="expenses-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 7
                        : 8
                    }
                  >
                    Loading expenses...
                  </td>

                </tr>

              ) : filteredExpenses.length ===
                0 ? (

                <tr className="expenses-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 7
                        : 8
                    }
                  >
                    No expenses found.
                  </td>

                </tr>

              ) : (

                filteredExpenses.map(
                  (
                    expense
                  ) => (

                    <tr
                      key={
                        expense.id
                      }
                    >

                      <td>

                        <strong>
                          {expenseId(
                            expense.id
                          )}
                        </strong>

                        {expense.vendor && (

                          <>

                            <br />

                            <small>
                              {
                                expense.vendor
                              }
                            </small>

                          </>

                        )}

                      </td>

                      <td>
                        {dateOnly(
                          expense.expense_date
                        )}
                      </td>

                      <td>

                        <strong>
                          {
                            expense.registration_no
                          }
                        </strong>

                        <br />

                        {
                          expense.vehicle_name
                        }

                      </td>

                      <td>

                        <span className="expense-category">
                          {
                            expense.category
                          }
                        </span>

                      </td>

                      <td>
                        {
                          expense.description ||
                          "--"
                        }
                      </td>

                      <td>
                        {tripId(
                          expense.trip_id
                        )}
                      </td>

                      <td>

                        <strong>
                          {Number(
                            expense.amount ||
                              0
                          ).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits:
                                2,

                              maximumFractionDigits:
                                2,
                            }
                          )}
                        </strong>

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
                              className="expense-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  expense
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
                                    expense
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  expense.id
                                }
                                style={{
                                  border:
                                    "1px solid #a83232",

                                  background:
                                    deletingId ===
                                    expense.id
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
                                    expense.id
                                      ? "not-allowed"
                                      : "pointer",

                                  opacity:
                                    deletingId ===
                                    expense.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {deletingId ===
                                expense.id
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
            EDIT EXPENSE
        ========================= */}

        {editingExpense && (

          <div className="expense-edit-box">

            <h3>
              Edit Expense{" "}
              {expenseId(
                editingExpense.id
              )}
            </h3>

            <form
              onSubmit={
                handleUpdate
              }
            >

              <div className="expense-edit-grid">

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
                    Trip
                  </label>

                  <select
                    name="tripId"
                    value={
                      editForm.tripId
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    <option value="">
                      No Linked Trip
                    </option>

                    {trips.map(
                      (
                        trip
                      ) => (

                        <option
                          key={
                            trip.id
                          }
                          value={
                            trip.id
                          }
                        >
                          TRIP-
                          {String(
                            trip.id
                          ).padStart(
                            5,
                            "0"
                          )}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label>
                    Expense Date
                  </label>

                  <input
                    type="date"
                    name="expenseDate"
                    value={
                      editForm.expenseDate
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      editForm.category
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  >

                    <option value="Fuel">
                      Fuel
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                    <option value="Repair">
                      Repair
                    </option>

                    <option value="Insurance">
                      Insurance
                    </option>

                    <option value="Tax">
                      Tax
                    </option>

                    <option value="Toll">
                      Toll
                    </option>

                    <option value="Parking">
                      Parking
                    </option>

                    <option value="Registration / Permit">
                      Registration / Permit
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                <div>

                  <label>
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    value={
                      editForm.amount
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Vendor
                  </label>

                  <input
                    name="vendor"
                    value={
                      editForm.vendor
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Reference No.
                  </label>

                  <input
                    name="referenceNo"
                    value={
                      editForm.referenceNo
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Description
                  </label>

                  <input
                    name="description"
                    value={
                      editForm.description
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div className="expense-edit-full">

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
                    rows="4"
                  />

                </div>

              </div>

              <div className="expense-edit-actions">

                <button
                  type="submit"
                  className="expense-save-btn"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="expense-cancel-btn"
                  onClick={() =>
                    setEditingExpense(
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

export default Expenses;