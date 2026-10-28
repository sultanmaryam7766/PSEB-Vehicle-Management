import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./CreateTrip.css";

function CreateTrip() {
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

  const [
    vehicles,
    setVehicles,
  ] =
    useState([]);

  const [
    drivers,
    setDrivers,
  ] =
    useState([]);

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      new Date()
    );

  const [
    formData,
    setFormData,
  ] =
    useState({
      vehicleId: "",
      driverId: "",
      employeeDepartment: "",
      purpose: "",
      fromLocation: "",
      destination: "",
      startOdometer: "",
    });

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  /* =========================
     ACCESS
  ========================= */

  useEffect(
    () => {
      if (!user) {
        navigate("/");
        return;
      }

      if (
        role !==
          "Administrator" &&
        role !==
          "Operator"
      ) {
        navigate(
          "/trips"
        );
      }
    },
    [
      navigate,
      role,
    ]
  );

  /* =========================
     LOAD VEHICLES / DRIVERS
  ========================= */

  useEffect(
    () => {
      const loadOptions =
        async () => {
          try {
            const [
              vehicleResponse,
              driverResponse,
            ] =
              await Promise.all([
                fetch(
                  "http://localhost:5000/api/vehicles",
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                ),

                fetch(
                  "http://localhost:5000/api/drivers",
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                ),
              ]);

            const vehicleData =
              await vehicleResponse.json();

            const driverData =
              await driverResponse.json();

            if (
              vehicleResponse.ok
            ) {
              setVehicles(
                (
                  vehicleData.vehicles ||
                  []
                ).filter(
                  (
                    vehicle
                  ) =>
                    vehicle.status ===
                    "Active"
                )
              );
            }

            if (
              driverResponse.ok
            ) {
              setDrivers(
                (
                  driverData.drivers ||
                  []
                ).filter(
                  (
                    driver
                  ) =>
                    driver.status ===
                    "Active"
                )
              );
            }
          } catch (
            err
          ) {
            console.error(
              err
            );

            setError(
              "Unable to load vehicles and drivers"
            );
          }
        };

      if (
        token
      ) {
        loadOptions();
      }
    },
    [
      token,
    ]
  );

  /* =========================
     CHANGE
  ========================= */

  const handleChange =
    (e) => {
      const {
        name,
        value,
      } =
        e.target;

      setFormData(
        (prev) => ({
          ...prev,
          [name]:
            value,
        })
      );

      if (
        name ===
        "vehicleId"
      ) {
        const vehicle =
          vehicles.find(
            (item) =>
              String(
                item.id
              ) ===
              String(
                value
              )
          );

        setFormData(
          (prev) => ({
            ...prev,

            vehicleId:
              value,

            startOdometer:
              vehicle
                ? vehicle.odometer ??
                  0
                : "",
          })
        );
      }
    };

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDateTime =
    (date) => {
      const pad =
        (value) =>
          String(
            value
          ).padStart(
            2,
            "0"
          );

      return `${date.getFullYear()}-${pad(
        date.getMonth() + 1
      )}-${pad(
        date.getDate()
      )} ${pad(
        date.getHours()
      )}:${pad(
        date.getMinutes()
      )}:${pad(
        date.getSeconds()
      )}`;
    };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setLoading(
        true
      );

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/trips",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  ...formData,

                  startDateTime:
                    formatDateTime(
                      startDate
                    ),
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to create trip"
          );

          return;
        }

        navigate(
          "/trips"
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
    };

  return (
    <div className="create-trip-page">

      <main className="create-trip-content">

        {/* HEADER */}

        <div className="create-trip-header">

          <div className="create-trip-header-icon">

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 21c0-7 4-7 4-14" />
              <path d="M19 21c0-7-4-7-4-14" />
              <path d="M9 7h6" />
            </svg>

          </div>

          <h1>
            Create Trip
          </h1>

        </div>

        {/* SECTION */}

        <div className="create-trip-section">

          <div className="create-trip-section-icon">

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="1"
              />

              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>

          </div>

          <span>
            Trip Information
          </span>

        </div>

        {/* FORM */}

        <form
          className="create-trip-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="create-trip-field">

            <label>
              Vehicle
            </label>

            <select
              name="vehicleId"
              value={
                formData.vehicleId
              }
              onChange={
                handleChange
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

          <div className="create-trip-field">

            <label>
              Driver
            </label>

            <select
              name="driverId"
              value={
                formData.driverId
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="">
                Select Driver
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

          <div className="create-trip-field">

            <label>
              Employee / Department
            </label>

            <input
              type="text"
              name="employeeDepartment"
              value={
                formData.employeeDepartment
              }
              onChange={
                handleChange
              }
              placeholder="Enter employee or department"
              required
            />

          </div>

          <div className="create-trip-field">

            <label>
              Purpose
            </label>

            <input
              type="text"
              name="purpose"
              value={
                formData.purpose
              }
              onChange={
                handleChange
              }
              placeholder="Enter trip purpose"
              required
            />

          </div>

          <div className="create-trip-field">

            <label>
              From
            </label>

            <input
              type="text"
              name="fromLocation"
              value={
                formData.fromLocation
              }
              onChange={
                handleChange
              }
              placeholder="Starting location"
              required
            />

          </div>

          <div className="create-trip-field">

            <label>
              Destination
            </label>

            <input
              type="text"
              name="destination"
              value={
                formData.destination
              }
              onChange={
                handleChange
              }
              placeholder="Destination"
              required
            />

          </div>

          <div className="create-trip-field">

            <label>
              Start Date / Time
            </label>

            <DatePicker
              selected={
                startDate
              }
              onChange={(
                date
              ) =>
                setStartDate(
                  date
                )
              }
              showTimeSelect
              timeIntervals={
                15
              }
              dateFormat="dd-MM-yyyy h:mm aa"
              className="create-trip-datepicker"
              calendarClassName="pseb-calendar"
              popperPlacement="bottom-start"
            />

          </div>

          <div className="create-trip-field">

            <label>
              Start Odometer
            </label>

            <input
              type="number"
              name="startOdometer"
              min="0"
              value={
                formData.startOdometer
              }
              onChange={
                handleChange
              }
              placeholder="Vehicle current odometer"
              required
            />

          </div>

          {error && (
            <div className="create-trip-error">
              {error}
            </div>
          )}

          <div className="create-trip-actions">

            <button
              type="submit"
              className="create-trip-submit"
              disabled={
                loading
              }
            >
              {loading
                ? "CREATING..."
                : "CREATE TRIP"}
            </button>

            <button
              type="button"
              className="create-trip-cancel"
              onClick={() =>
                navigate(
                  "/trips"
                )
              }
            >
              CANCEL
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreateTrip;