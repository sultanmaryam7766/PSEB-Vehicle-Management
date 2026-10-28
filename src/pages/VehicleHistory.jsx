import {
  useEffect,
  useMemo,
  useState,
} from "react";
import NotificationBell from "../components/NotificationBell";
import {
  useNavigate,
} from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./VehicleHistory.css";

function VehicleHistory() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role;

  const token =
    localStorage.getItem("token");
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
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState("");

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] = useState(null);

  const [period, setPeriod] =
    useState("this-month");

  const [
    recordType,
    setRecordType,
  ] = useState("All Records");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] = useState(20);

  const [
    customFrom,
    setCustomFrom,
  ] = useState(null);

  const [
    customTo,
    setCustomTo,
  ] = useState(null);

  const [
    historyData,
    setHistoryData,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [
    navigate,
    user,
  ]);

  useEffect(() => {
    const loadVehicles =
      async () => {
        if (!token) {
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
            response.status === 401
          ) {
            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            navigate("/");
            return;
          }

          if (!response.ok) {
            setError(
              data.message ||
                "Unable to load vehicles"
            );

            return;
          }

          const vehicleList =
            data.vehicles || [];

          setVehicles(
            vehicleList
          );

          /*
            If no vehicle has been
            selected yet, select the
            first one in dropdown only.
            History will load after
            Search is pressed.
          */

          if (
            vehicleList.length > 0
          ) {
            setSelectedVehicleId(
              (previous) =>
                previous ||
                String(
                  vehicleList[0].id
                )
            );
          }
        } catch (err) {
          console.error(
            "Load vehicles error:",
            err
          );

          setError(
            "Unable to connect to server"
          );
        }
      };

    loadVehicles();
  }, [
    token,
    navigate,
  ]);

  const menuItems = [
    {
      name: "Dashboard",
    },
    {
      name: "Vehicles",
      path: "/vehicles",
    },
    {
      name: "Vehicle History",
      path: "/vehicle-history",
    },
    {
      name: "Drivers",
      path: "/drivers",
    },
    {
      name: "Trips",
      path: "/trips",
    },
    {
      name: "Fuel",
      path: "/fuel",
    },
    {
      name: "Maintenance",
      path: "/maintenance",
    },
    {
      name: "Documents",
      path: "/documents",
    },
    {
      name: "Incidents",
      path: "/incidents",
    },
    {
      name: "Expenses",
      path: "/expenses",
    },
    {
      name: "Reports",
      path: "/reports",
    },
  ];

  if (
    role === "Administrator"
  ) {
    menuItems.push(
      {
        name: "Users & Roles",
        path: "/users-roles",
      },
      {
        name: "Audit Log",
        path: "/audit-log",
      }
    );
  }

  const handleDashboard = () => {
    if (
      role === "Administrator"
    ) {
      navigate(
        "/admin-dashboard"
      );
    } else if (
      role === "Operator"
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
      item.name === "Dashboard"
    ) {
      handleDashboard();
      return;
    }

    navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/");
  };

  const formatApiDate = (
    date
  ) => {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDateRange = () => {
    const today = new Date();

    let from =
      new Date(today);

    let to =
      new Date(today);

    if (
      period === "today"
    ) {
      return {
        from,
        to,
      };
    }

    if (
      period === "this-week"
    ) {
      const day =
        today.getDay();

      const difference =
        day === 0
          ? 6
          : day - 1;

      from.setDate(
        today.getDate() -
          difference
      );

      return {
        from,
        to,
      };
    }

    if (
      period === "this-month"
    ) {
      from = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      return {
        from,
        to,
      };
    }

    if (
      period === "last-month"
    ) {
      from = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      to = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );

      return {
        from,
        to,
      };
    }

    if (
      period ===
      "last-3-months"
    ) {
      from = new Date(
        today.getFullYear(),
        today.getMonth() - 2,
        1
      );

      return {
        from,
        to,
      };
    }

    if (
      period === "this-year"
    ) {
      from = new Date(
        today.getFullYear(),
        0,
        1
      );

      return {
        from,
        to,
      };
    }

    if (
      period === "custom"
    ) {
      return {
        from:
          customFrom,
        to:
          customTo,
      };
    }

    return {
      from,
      to,
    };
  };

  const handleSearch =
    async () => {
      setError("");

      if (
        !selectedVehicleId
      ) {
        setError(
          "Please select a vehicle"
        );
        return;
      }

      const vehicle =
        vehicles.find(
          (item) =>
            String(item.id) ===
            String(
              selectedVehicleId
            )
        );

      if (!vehicle) {
        setError(
          "Selected vehicle was not found"
        );
        return;
      }

      const range =
        getDateRange();

      if (
        !range.from ||
        !range.to
      ) {
        setError(
          "Please select custom From and To dates"
        );
        return;
      }

      if (
        range.to <
        range.from
      ) {
        setError(
          "To Date cannot be earlier than From Date"
        );
        return;
      }

      setSelectedVehicle(
        vehicle
      );

      setLoading(true);

      try {
        const fromDate =
          formatApiDate(
            range.from
          );

        const toDate =
          formatApiDate(
            range.to
          );

        const response =
          await fetch(
            `http://localhost:5000/api/vehicle-history/${vehicle.id}?fromDate=${fromDate}&toDate=${toDate}`,
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
          response.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/");
          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load history"
          );

          return;
        }

        setHistoryData(
          data
        );
      } catch (err) {
        console.error(
          "Vehicle history error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

  const filteredRecords =
    useMemo(() => {
      if (
        !historyData
      ) {
        return [];
      }

      let result = [
        ...(historyData.records ||
          []),
      ];

      if (
        recordType !==
        "All Records"
      ) {
        result =
          result.filter(
            (item) =>
              item.type ===
              recordType
          );
      }

      return result.slice(
        0,
        Number(
          recordsPerPage
        )
      );
    }, [
      historyData,
      recordType,
      recordsPerPage,
    ]);

  const formatNumber = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      undefined,
      {
        maximumFractionDigits:
          2,
      }
    );

  const dateOnly = (
    value
  ) =>
    value
      ? String(value).slice(
          0,
          10
        )
      : "--";

  if (!user) {
    return null;
  }

  return (
    <div className="history-page">

      <aside className="history-sidebar">

    <div className="history-welcome">

  <div className="history-profile-avatar">
    {userInitials}
  </div>

  <div className="history-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="history-menu">

          {menuItems.map(
            (item) => (

              <button
                key={
                  item.name
                }
                className={
                  item.name ===
                  "Vehicle History"
                    ? "history-menu-btn active"
                    : "history-menu-btn"
                }
                onClick={() =>
                  handleMenuClick(
                    item
                  )
                }
              >
                {item.name}
              </button>

            )
          )}

        </div>

        <button
          className="history-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      <main className="history-content">

        <div className="history-header">

          <h1>
            Vehicle History
          </h1>

        </div>

        <div className="history-filters">

          <div className="history-filter-field search-main">

            <label>
              Vehicle
            </label>

            <select
              value={
                selectedVehicleId
              }
              onChange={(e) => {
                setSelectedVehicleId(
                  e.target.value
                );

                setError("");
              }}
            >

              {vehicles.length ===
              0 ? (

                <option value="">
                  No vehicles available
                </option>

              ) : (

                vehicles.map(
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
                )

              )}

            </select>

          </div>

          <div className="history-filter-field">

            <label>
              Period
            </label>

            <select
              value={
                period
              }
              onChange={(e) =>
                setPeriod(
                  e.target.value
                )
              }
            >

              <option value="today">
                Today
              </option>

              <option value="this-week">
                This Week
              </option>

              <option value="this-month">
                This Month
              </option>

              <option value="last-month">
                Last Month
              </option>

              <option value="last-3-months">
                Last 3 Months
              </option>

              <option value="this-year">
                This Year
              </option>

              <option value="custom">
                Custom Date Range
              </option>

            </select>

          </div>

          <div className="history-filter-field">

            <label>
              Record Type
            </label>

            <select
              value={
                recordType
              }
              onChange={(e) =>
                setRecordType(
                  e.target.value
                )
              }
            >

              <option value="All Records">
                All Records
              </option>

              <option value="Trips">
                Trips
              </option>

              <option value="Fuel">
                Fuel
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Incidents">
                Incidents
              </option>

              <option value="Expenses">
                Expenses
              </option>

              <option value="Documents">
                Documents
              </option>

            </select>

          </div>

          <div className="history-filter-field">

            <label>
              Records / page
            </label>

            <select
              value={
                recordsPerPage
              }
              onChange={(e) =>
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

          <button
            className="history-search-btn"
            onClick={
              handleSearch
            }
            disabled={
              loading ||
              !selectedVehicleId
            }
          >
            {loading
              ? "LOADING..."
              : "SEARCH"}
          </button>

        </div>

        {period ===
          "custom" && (

          <div className="history-custom-dates">

            <div>

              <label>
                From Date
              </label>

              <DatePicker
                selected={
                  customFrom
                }
                onChange={(date) =>
                  setCustomFrom(
                    date
                  )
                }
                selectsStart
                startDate={
                  customFrom
                }
                endDate={
                  customTo
                }
                maxDate={
                  customTo ||
                  null
                }
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                scrollableYearDropdown
                dateFormat="dd/MM/yyyy"
                placeholderText="Select From Date"
              />

            </div>

            <div>

              <label>
                To Date
              </label>

              <DatePicker
                selected={
                  customTo
                }
                onChange={(date) =>
                  setCustomTo(
                    date
                  )
                }
                selectsEnd
                startDate={
                  customFrom
                }
                endDate={
                  customTo
                }
                minDate={
                  customFrom ||
                  null
                }
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                scrollableYearDropdown
                dateFormat="dd/MM/yyyy"
                placeholderText="Select To Date"
              />

            </div>

          </div>

        )}

        {error && (

          <div className="history-error">
            {error}
          </div>

        )}

        <div className="history-summary">

          <div className="history-vehicle-title">

            <h2>
              {selectedVehicle
                ? `${selectedVehicle.registration_no} - ${selectedVehicle.vehicle_name}`
                : "Vehicle Summary"}
            </h2>

            {selectedVehicle && (

              <p>
                Location:{" "}
                {
                  selectedVehicle.location ||
                  "--"
                }{" "}
                • Current Odometer:{" "}
                {
                  selectedVehicle.odometer ??
                  0
                }{" "}
                km
              </p>

            )}

          </div>

          <div className="history-stats">

            <div className="history-stat-card">

              <span>
                Trips
              </span>

              <strong>
                {historyData
                  ? historyData
                      .summary.trips
                  : "--"}
              </strong>

            </div>

            <div className="history-stat-card">

              <span>
                Distance
              </span>

              <strong>
                {historyData
                  ? `${formatNumber(
                      historyData
                        .summary
                        .distance
                    )} km`
                  : "--"}
              </strong>

            </div>

            <div className="history-stat-card">

              <span>
                Fuel
              </span>

              <strong>
                {historyData
                  ? `${formatNumber(
                      historyData
                        .summary
                        .fuel
                    )} L`
                  : "--"}
              </strong>

            </div>

            <div className="history-stat-card">

              <span>
                Fuel Cost
              </span>

              <strong>
                {historyData
                  ? formatNumber(
                      historyData
                        .summary
                        .fuelCost
                    )
                  : "--"}
              </strong>

            </div>

            <div className="history-stat-card">

              <span>
                Mileage
              </span>

              <strong>
                {historyData
                  ? `${formatNumber(
                      historyData
                        .summary
                        .mileage
                    )} km/L`
                  : "--"}
              </strong>

            </div>

            <div className="history-stat-card">

              <span>
                Total Cost
              </span>

              <strong>
                {historyData
                  ? formatNumber(
                      historyData
                        .summary
                        .totalCost
                    )
                  : "--"}
              </strong>

            </div>

          </div>

        </div>

        <div className="history-table-wrapper">

          <table className="history-table">

            <thead>

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Type
                </th>

                <th>
                  Driver / Ref
                </th>

                <th>
                  Details
                </th>

                <th>
                  Odometer / Cost
                </th>

              </tr>

            </thead>

            <tbody>

              {!historyData ? (

                <tr className="history-empty-row">

                  <td colSpan="5">
                    Select a vehicle and click Search.
                  </td>

                </tr>

              ) : filteredRecords.length ===
                0 ? (

                <tr className="history-empty-row">

                  <td colSpan="5">
                    No history records found for this period.
                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (
                    record
                  ) => (

                    <tr
                      key={
                        record.id
                      }
                    >

                      <td>
                        {dateOnly(
                          record.date
                        )}
                      </td>

                      <td>

                        <span className="history-record-type">
                          {
                            record.type
                          }
                        </span>

                      </td>

                      <td>
                        {
                          record.driverRef ||
                          "--"
                        }
                      </td>

                      <td>
                        {
                          record.details ||
                          "--"
                        }
                      </td>

                      <td>
                        {
                          record.odometerCost ||
                          "--"
                        }
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default VehicleHistory;