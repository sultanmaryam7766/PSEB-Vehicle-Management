import {
  useEffect,
  useState,
} from "react";
import NotificationBell from "../components/NotificationBell";
import {
  useNavigate,
} from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "./Reports.css";

function Reports() {
  const navigate =
    useNavigate();

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
    fromDate,
    setFromDate,
  ] = useState(null);

  const [
    toDate,
    setToDate,
  ] = useState(null);

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] = useState("");

  const [
    reportData,
    setReportData,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate, user]);

  useEffect(() => {
    const loadVehicles =
      async () => {
        if (!token) return;

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

          if (response.ok) {
            setVehicles(
              data.vehicles || []
            );
          }
        } catch (err) {
          console.error(err);
        }
      };

    loadVehicles();
  }, [token]);

  const menuItems = [
    { name: "Dashboard" },

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

  const formatNumber = (
    value,
    decimals = 2
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      undefined,
      {
        minimumFractionDigits:
          decimals,

        maximumFractionDigits:
          decimals,
      }
    );
  };

  const formatDateForApi = (
    date
  ) => {
    if (!date) return "";

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

  const dateOnly = (value) => {
    if (!value) return "--";

    return String(value).slice(
      0,
      10
    );
  };

  const generateReport =
    async () => {
      setError("");

      if (
        !fromDate ||
        !toDate
      ) {
        setError(
          "Please select From Date and To Date"
        );
        return;
      }

      if (
        toDate < fromDate
      ) {
        setError(
          "To Date cannot be earlier than From Date"
        );
        return;
      }

      setLoading(true);

      try {
        const from =
          formatDateForApi(
            fromDate
          );

        const to =
          formatDateForApi(
            toDate
          );

        const params =
          new URLSearchParams({
            fromDate: from,
            toDate: to,
          });

        if (selectedVehicle) {
          params.append(
            "vehicleId",
            selectedVehicle
          );
        }

        const response =
          await fetch(
            `http://localhost:5000/api/reports/vehicle-summary?${params.toString()}`,
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
              "Unable to generate report"
          );
          return;
        }

        setReportData(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

  const handlePrint = () => {
    if (!reportData) {
      setError(
        "Generate report first"
      );
      return;
    }

    window.print();
  };

  const handlePDF = () => {
    if (!reportData) {
      setError(
        "Generate report first"
      );
      return;
    }

    const doc =
      new jsPDF();

    const summary =
      reportData.summary;

    const from =
      formatDateForApi(
        fromDate
      );

    const to =
      formatDateForApi(
        toDate
      );

    doc.setFontSize(18);

    doc.text(
      "PSEB Vehicle Management Report",
      14,
      18
    );

    doc.setFontSize(10);

    doc.text(
      `Period: ${from} to ${to}`,
      14,
      26
    );

    const vehicleName =
      selectedVehicle
        ? vehicles.find(
            (vehicle) =>
              String(
                vehicle.id
              ) ===
              String(
                selectedVehicle
              )
          )
        : null;

    doc.text(
      `Vehicle: ${
        vehicleName
          ? `${vehicleName.registration_no} - ${vehicleName.vehicle_name}`
          : "All Vehicles"
      }`,
      14,
      32
    );

    autoTable(doc, {
      startY: 40,

      head: [
        [
          "Summary",
          "Value",
        ],
      ],

      body: [
        [
          "Trips",
          summary.totalTrips,
        ],

        [
          "Distance",
          `${formatNumber(
            summary.totalDistance
          )} km`,
        ],

        [
          "Fuel Liters",
          formatNumber(
            summary.totalFuelLiters
          ),
        ],

        [
          "Fuel Cost",
          formatNumber(
            summary.totalFuelCost
          ),
        ],

        [
          "Mileage",
          `${formatNumber(
            summary.mileage
          )} km/L`,
        ],

        [
          "Maintenance Cost",
          formatNumber(
            summary.totalMaintenanceCost
          ),
        ],

        [
          "Incidents",
          summary.totalIncidents,
        ],

        [
          "Incident Cost",
          formatNumber(
            summary.totalIncidentCost
          ),
        ],

        [
          "Other Expenses",
          formatNumber(
            summary.totalOtherExpenses
          ),
        ],

        [
          "Total Cost",
          formatNumber(
            summary.totalCost
          ),
        ],
      ],
    });

    autoTable(doc, {
      startY:
        doc.lastAutoTable
          .finalY + 10,

      head: [
        [
          "Trip",
          "Vehicle",
          "Date",
          "Driver",
          "Distance",
        ],
      ],

      body:
        reportData.trips.map(
          (trip) => [
            `TRIP-${String(
              trip.id
            ).padStart(
              5,
              "0"
            )}`,

            trip.registration_no,

            dateOnly(
              trip.start_datetime
            ),

            trip.driver_name ||
              "--",

            formatNumber(
              trip.distance
            ),
          ]
        ),
    });

    doc.save(
      `PSEB_Report_${from}_${to}.pdf`
    );
  };

  const handleExcel = () => {
    if (!reportData) {
      setError(
        "Generate report first"
      );
      return;
    }

    const workbook =
      XLSX.utils.book_new();

    const summary =
      reportData.summary;

    const from =
      formatDateForApi(
        fromDate
      );

    const to =
      formatDateForApi(
        toDate
      );

    const summarySheet =
      XLSX.utils.json_to_sheet([
        {
          Report:
            "PSEB Vehicle Management",

          From: from,

          To: to,

          Trips:
            summary.totalTrips,

          DistanceKM:
            summary.totalDistance,

          FuelLiters:
            summary.totalFuelLiters,

          FuelCost:
            summary.totalFuelCost,

          Mileage:
            summary.mileage,

          MaintenanceCost:
            summary.totalMaintenanceCost,

          Incidents:
            summary.totalIncidents,

          IncidentCost:
            summary.totalIncidentCost,

          OtherExpenses:
            summary.totalOtherExpenses,

          TotalCost:
            summary.totalCost,
        },
      ]);

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );

    const tripSheet =
      XLSX.utils.json_to_sheet(
        reportData.trips.map(
          (trip) => ({
            TripID:
              `TRIP-${String(
                trip.id
              ).padStart(
                5,
                "0"
              )}`,

            Date:
              dateOnly(
                trip.start_datetime
              ),

            Vehicle:
              trip.registration_no,

            Driver:
              trip.driver_name ||
              "",

            From:
              trip.from_location,

            Destination:
              trip.destination,

            Distance:
              Number(
                trip.distance || 0
              ),

            Status:
              trip.status,
          })
        )
      );

    XLSX.utils.book_append_sheet(
      workbook,
      tripSheet,
      "Trips"
    );

    const fuelSheet =
      XLSX.utils.json_to_sheet(
        reportData.fuel.map(
          (item) => ({
            Date:
              dateOnly(
                item.fuel_date
              ),

            Vehicle:
              item.registration_no,

            Liters:
              Number(
                item.liters || 0
              ),

            Cost:
              Number(
                item.amount || 0
              ),

            Odometer:
              item.odometer,

            Vendor:
              item.station_vendor ||
              "",
          })
        )
      );

    XLSX.utils.book_append_sheet(
      workbook,
      fuelSheet,
      "Fuel"
    );

    const maintenanceSheet =
      XLSX.utils.json_to_sheet(
        reportData.maintenance.map(
          (item) => ({
            Date:
              dateOnly(
                item.maintenance_date
              ),

            Vehicle:
              item.registration_no,

            Service:
              item.service_type,

            Vendor:
              item.vendor || "",

            Cost:
              Number(
                item.cost || 0
              ),

            Status:
              item.status,
          })
        )
      );

    XLSX.utils.book_append_sheet(
      workbook,
      maintenanceSheet,
      "Maintenance"
    );

    const incidentSheet =
      XLSX.utils.json_to_sheet(
        reportData.incidents.map(
          (item) => ({
            IncidentID:
              `INC-${String(
                item.id
              ).padStart(
                5,
                "0"
              )}`,

            Date:
              dateOnly(
                item.incident_date
              ),

            Vehicle:
              item.registration_no,

            Type:
              item.incident_type,

            Location:
              item.location,

            EstimatedCost:
              Number(
                item.estimated_cost ||
                  0
              ),

            ActualCost:
              Number(
                item.actual_cost ||
                  0
              ),

            Status:
              item.status,
          })
        )
      );

    XLSX.utils.book_append_sheet(
      workbook,
      incidentSheet,
      "Incidents"
    );

    const expenseSheet =
      XLSX.utils.json_to_sheet(
        reportData.expenses.map(
          (item) => ({
            ExpenseID:
              `EXP-${String(
                item.id
              ).padStart(
                5,
                "0"
              )}`,

            Date:
              dateOnly(
                item.expense_date
              ),

            Vehicle:
              item.registration_no,

            Category:
              item.category,

            Description:
              item.description ||
              "",

            Vendor:
              item.vendor || "",

            Amount:
              Number(
                item.amount || 0
              ),
          })
        )
      );

    XLSX.utils.book_append_sheet(
      workbook,
      expenseSheet,
      "Expenses"
    );

    XLSX.writeFile(
      workbook,
      `PSEB_Report_${from}_${to}.xlsx`
    );
  };

  return (
    <div className="reports-page">
      <aside className="reports-sidebar no-print">
     <div className="reports-welcome">

  <div className="reports-profile-avatar">
    {userInitials}
  </div>

  <div className="reports-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>
        <div className="reports-menu">
          {menuItems.map(
            (item) => (
              <button
                key={item.name}
                className={
                  item.name ===
                  "Reports"
                    ? "reports-menu-btn active"
                    : "reports-menu-btn"
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
          className="reports-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="reports-content">
        <div className="reports-header">
          <h1>
            Reports - Vehicle Management
          </h1>
        </div>

       

        <div className="reports-filter-box no-print">
          <div>
            <label>
              From Date
            </label>

            <DatePicker
              selected={
                fromDate
              }
              onChange={(date) =>
                setFromDate(
                  date
                )
              }
              selectsStart
              startDate={
                fromDate
              }
              endDate={toDate}
              maxDate={
                toDate || null
              }
              placeholderText="Select From Date"
              dateFormat="dd/MM/yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={
                30
              }
              scrollableYearDropdown
              className="reports-datepicker"
            />
          </div>

          <div>
            <label>
              To Date
            </label>

            <DatePicker
              selected={toDate}
              onChange={(date) =>
                setToDate(date)
              }
              selectsEnd
              startDate={
                fromDate
              }
              endDate={toDate}
              minDate={
                fromDate || null
              }
              placeholderText="Select To Date"
              dateFormat="dd/MM/yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={
                30
              }
              scrollableYearDropdown
              className="reports-datepicker"
            />
          </div>

          <div>
            <label>
              Vehicle
            </label>

            <select
              value={
                selectedVehicle
              }
              onChange={(e) =>
                setSelectedVehicle(
                  e.target.value
                )
              }
            >
              <option value="">
                All Vehicles
              </option>

              {vehicles.map(
                (vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
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

          <button
            className="reports-generate-btn"
            onClick={
              generateReport
            }
            disabled={loading}
          >
            {loading
              ? "GENERATING..."
              : "GENERATE REPORT"}
          </button>
        </div>

        {error && (
          <div className="reports-error no-print">
            {error}
          </div>
        )}

        {reportData && (
          <>
            <div className="reports-export-actions no-print">
              <button
                onClick={
                  handlePrint
                }
              >
                PRINT
              </button>

              <button
                onClick={
                  handlePDF
                }
              >
                EXPORT PDF
              </button>

              <button
                onClick={
                  handleExcel
                }
              >
                EXPORT EXCEL
              </button>
            </div>

            <div className="report-print-area">
              <div className="report-period">
                <strong>
                  Report Period:
                </strong>{" "}
                {formatDateForApi(
                  fromDate
                )}{" "}
                to{" "}
                {formatDateForApi(
                  toDate
                )}
              </div>

              <div className="reports-summary-grid">
                <div className="report-card">
                  <span>
                    Trips
                  </span>

                  <strong>
                    {
                      reportData
                        .summary
                        .totalTrips
                    }
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Distance
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalDistance
                    )}{" "}
                    km
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Fuel
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalFuelLiters
                    )}{" "}
                    L
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Fuel Cost
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalFuelCost
                    )}
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Mileage
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .mileage
                    )}{" "}
                    km/L
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Maintenance
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalMaintenanceCost
                    )}
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Incidents
                  </span>

                  <strong>
                    {
                      reportData
                        .summary
                        .totalIncidents
                    }
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Incident Cost
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalIncidentCost
                    )}
                  </strong>
                </div>

                <div className="report-card">
                  <span>
                    Other Expenses
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalOtherExpenses
                    )}
                  </strong>
                </div>

                <div className="report-card total">
                  <span>
                    Total Cost
                  </span>

                  <strong>
                    {formatNumber(
                      reportData
                        .summary
                        .totalCost
                    )}
                  </strong>
                </div>
              </div>

              <div className="report-table-section">
                <h3>
                  Trips
                </h3>

                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>
                          Trip
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Vehicle
                        </th>

                        <th>
                          Driver
                        </th>

                        <th>
                          Distance
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.trips
                        .length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="report-empty"
                          >
                            No trip records.
                          </td>
                        </tr>
                      ) : (
                        reportData.trips.map(
                          (
                            trip
                          ) => (
                            <tr
                              key={
                                trip.id
                              }
                            >
                              <td>
                                TRIP-
                                {String(
                                  trip.id
                                ).padStart(
                                  5,
                                  "0"
                                )}
                              </td>

                              <td>
                                {dateOnly(
                                  trip.start_datetime
                                )}
                              </td>

                              <td>
                                {
                                  trip.registration_no
                                }
                              </td>

                              <td>
                                {trip.driver_name ||
                                  "--"}
                              </td>

                              <td>
                                {formatNumber(
                                  trip.distance
                                )}
                              </td>

                              <td>
                                {
                                  trip.status
                                }
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-table-section">
                <h3>
                  Fuel
                </h3>

                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>
                          Vehicle
                        </th>
                        <th>
                          Liters
                        </th>
                        <th>Cost</th>
                        <th>
                          Vendor
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData.fuel
                        .length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="report-empty"
                          >
                            No fuel records.
                          </td>
                        </tr>
                      ) : (
                        reportData.fuel.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                {dateOnly(
                                  item.fuel_date
                                )}
                              </td>

                              <td>
                                {
                                  item.registration_no
                                }
                              </td>

                              <td>
                                {formatNumber(
                                  item.liters
                                )}
                              </td>

                              <td>
                                {formatNumber(
                                  item.amount
                                )}
                              </td>

                              <td>
                                {item.station_vendor ||
                                  "--"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-table-section">
                <h3>
                  Maintenance
                </h3>

                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>
                          Vehicle
                        </th>
                        <th>
                          Service
                        </th>
                        <th>Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData
                        .maintenance
                        .length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="report-empty"
                          >
                            No maintenance records.
                          </td>
                        </tr>
                      ) : (
                        reportData.maintenance.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                {dateOnly(
                                  item.maintenance_date
                                )}
                              </td>

                              <td>
                                {
                                  item.registration_no
                                }
                              </td>

                              <td>
                                {
                                  item.service_type
                                }
                              </td>

                              <td>
                                {formatNumber(
                                  item.cost
                                )}
                              </td>

                              <td>
                                {
                                  item.status
                                }
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-table-section">
                <h3>
                  Incidents
                </h3>

                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>
                          Incident
                        </th>
                        <th>Date</th>
                        <th>
                          Vehicle
                        </th>
                        <th>Type</th>
                        <th>Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData
                        .incidents
                        .length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="report-empty"
                          >
                            No incident records.
                          </td>
                        </tr>
                      ) : (
                        reportData.incidents.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                INC-
                                {String(
                                  item.id
                                ).padStart(
                                  5,
                                  "0"
                                )}
                              </td>

                              <td>
                                {dateOnly(
                                  item.incident_date
                                )}
                              </td>

                              <td>
                                {
                                  item.registration_no
                                }
                              </td>

                              <td>
                                {
                                  item.incident_type
                                }
                              </td>

                              <td>
                                {formatNumber(
                                  Number(
                                    item.actual_cost ||
                                      0
                                  ) >
                                    0
                                    ? item.actual_cost
                                    : item.estimated_cost
                                )}
                              </td>

                              <td>
                                {
                                  item.status
                                }
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-table-section">
                <h3>
                  Expenses
                </h3>

                <div className="report-table-wrapper">
                  <table className="report-table">
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
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportData
                        .expenses
                        .length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="report-empty"
                          >
                            No expense records.
                          </td>
                        </tr>
                      ) : (
                        reportData.expenses.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                EXP-
                                {String(
                                  item.id
                                ).padStart(
                                  5,
                                  "0"
                                )}
                              </td>

                              <td>
                                {dateOnly(
                                  item.expense_date
                                )}
                              </td>

                              <td>
                                {
                                  item.registration_no
                                }
                              </td>

                              <td>
                                {
                                  item.category
                                }
                              </td>

                              <td>
                                {item.description ||
                                  "--"}
                              </td>

                              <td>
                                {formatNumber(
                                  item.amount
                                )}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {!reportData && (
          <div className="reports-summary-box">
            <h3>
              Fleet Report includes:
            </h3>

            <p>
              Trips • Distance • Fuel Liters • Fuel Cost • Mileage • Maintenance • Incidents • Expenses • Total Cost
            </p>

            <span>
              Select dates and vehicle, then click Generate Report.
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;