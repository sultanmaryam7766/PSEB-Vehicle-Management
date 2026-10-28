import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";



import "./AddMaintenance.css";

function AddMaintenance() {
  const navigate =
    useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role =
    user?.role;

  const token =
    localStorage.getItem("token");

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    formData,
    setFormData,
  ] = useState({
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

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================
     AUTH
  ========================= */

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (
      role !== "Administrator" &&
      role !== "Operator"
    ) {
      navigate(
        "/maintenance"
      );
    }
  }, [
    navigate,
    role,
    user,
  ]);

  /* =========================
     LOAD VEHICLES
  ========================= */

  useEffect(() => {
    const loadVehicles =
      async () => {
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

          setVehicles(
            data.vehicles || []
          );
        } catch (err) {
          console.error(
            "Vehicle load error:",
            err
          );

          setError(
            "Unable to load vehicles"
          );
        }
      };

    if (token) {
      loadVehicles();
    }
  }, [
    token,
    navigate,
  ]);

  /* =========================
     HELPERS
  ========================= */

  const isOilChange = (
    value
  ) => {
    return String(
      value || ""
    )
      .trim()
      .toLowerCase() ===
      "oil change";
  };

  const formatNumber = (
    value
  ) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return "--";
    }

    return Number(
      value
    ).toLocaleString();
  };

  const selectedVehicle =
    vehicles.find(
      (vehicle) =>
        String(vehicle.id) ===
        String(
          formData.vehicleId
        )
    );

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    /* VEHICLE */

    if (
      name === "vehicleId"
    ) {
      const vehicle =
        vehicles.find(
          (item) =>
            String(item.id) ===
            String(value)
        );

      setFormData(
        (prev) => ({
          ...prev,

          vehicleId:
            value,

          odometer:
            vehicle?.odometer ??
            "",

          nextServiceOdometer:
            "",
        })
      );

      return;
    }

    /* SERVICE TYPE */

    if (
      name === "serviceType"
    ) {
      setFormData(
        (prev) => ({
          ...prev,

          serviceType:
            value,

          nextServiceOdometer:
            isOilChange(
              value
            )
              ? ""
              : prev.nextServiceOdometer,
        })
      );

      return;
    }

    /* STATUS */

    if (
      name === "status"
    ) {
      setFormData(
        (prev) => ({
          ...prev,

          status:
            value,

          nextServiceOdometer:
            value !==
            "Completed"
              ? ""
              : prev.nextServiceOdometer,
        })
      );

      return;
    }

    /* NORMAL INPUT */

    setFormData(
      (prev) => ({
        ...prev,
        [name]:
          value,
      })
    );
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");

      if (
        !formData.vehicleId ||
        !formData.maintenanceDate ||
        !formData.serviceType ||
        formData.odometer ===
          ""
      ) {
        setError(
          "Vehicle, maintenance date, service type and odometer are required"
        );

        return;
      }

      const finalOdometer =
        Number(
          formData.odometer
        );

      if (
        Number.isNaN(
          finalOdometer
        ) ||
        finalOdometer < 0
      ) {
        setError(
          "Invalid service odometer"
        );

        return;
      }

      /* OTHER SERVICES */

      if (
        formData.status ===
          "Completed" &&
        formData.serviceType
          .trim() !== "" &&
        !isOilChange(
          formData.serviceType
        ) &&
        formData.nextServiceOdometer !==
          ""
      ) {
        const nextOdometer =
          Number(
            formData.nextServiceOdometer
          );

        if (
          Number.isNaN(
            nextOdometer
          ) ||
          nextOdometer <=
            finalOdometer
        ) {
          setError(
            "Next service odometer must be greater than current service odometer"
          );

          return;
        }
      }

      setLoading(true);

      try {
        const payload = {
          vehicleId:
            formData.vehicleId,

          maintenanceDate:
            formData.maintenanceDate,

          serviceType:
            formData.serviceType,

          vendor:
            formData.vendor,

          odometer:
            formData.odometer,

          cost:
            formData.cost,

          nextServiceOdometer:
            isOilChange(
              formData.serviceType
            )
              ? ""
              : formData.nextServiceOdometer,

          remarks:
            formData.remarks,

          status:
            formData.status,
        };

        const response =
          await fetch(
            "http://localhost:5000/api/maintenance",
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

          navigate("/");
          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to add maintenance record"
          );

          return;
        }

        navigate(
          "/maintenance"
        );
      } catch (err) {
        console.error(
          "Create maintenance error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="add-maintenance-page">

      <main className="add-maintenance-content">

      

        {/* =====================
            HEADER
        ===================== */}

        <div className="add-maintenance-header">

          <h1>
            Add Maintenance
          </h1>

        </div>

        <div className="add-maintenance-section">
          Maintenance Information
        </div>

        {/* =====================
            FORM
        ===================== */}

        <form
          className="add-maintenance-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* VEHICLE */}

          <div className="add-maintenance-field">

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

          {/* DATE */}

          <div className="add-maintenance-field">

            <label>
              Maintenance Date
            </label>

            <input
              type="date"
              name="maintenanceDate"
              value={
                formData.maintenanceDate
              }
              onChange={
                handleChange
              }
              required
            />

          </div>

          {/* SERVICE TYPE */}

          <div className="add-maintenance-field">

            <label>
              Service Type
            </label>

            <input
              type="text"
              name="serviceType"
              value={
                formData.serviceType
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Oil Change"
              required
            />

          </div>

          {/* STATUS */}

          <div className="add-maintenance-field">

            <label>
              Status
            </label>

            <select
              name="status"
              value={
                formData.status
              }
              onChange={
                handleChange
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

          {/* VENDOR */}

          <div className="add-maintenance-field">

            <label>
              Vendor / Workshop
            </label>

            <input
              type="text"
              name="vendor"
              value={
                formData.vendor
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* =====================
              SINGLE ODOMETER
          ===================== */}

          <div className="add-maintenance-field">

            <label>
              Service Odometer
            </label>

            <input
              type="number"
              name="odometer"
              value={
                formData.odometer
              }
              readOnly
            />

            {selectedVehicle && (

              <small className="add-maintenance-current-odometer">

                Current vehicle odometer:{" "}

                <strong>
                  {formatNumber(
                    selectedVehicle.odometer
                  )}{" "}
                  km
                </strong>

              </small>

            )}

          </div>

          {/* COST */}

          <div className="add-maintenance-field">

            <label>
              Cost
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="cost"
              value={
                formData.cost
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* =====================
              OIL CHANGE AUTO
          ===================== */}

          {formData.status ===
            "Completed" &&
            isOilChange(
              formData.serviceType
            ) && (

              <div className="add-maintenance-auto-service">

                <span>
                  Automatic Next Oil Change
                </span>

                <strong>

                  {formData.odometer !==
                  ""
                    ? `${formatNumber(
                        Number(
                          formData.odometer
                        ) +
                          5000
                      )} km`
                    : "--"}

                </strong>

                <small>
                  Next Oil Change will automatically be due after 5,000 km.
                </small>

              </div>

            )}

          {/* =====================
              OTHER SERVICES
          ===================== */}

          {formData.status ===
            "Completed" &&
            formData.serviceType
              .trim() !== "" &&
            !isOilChange(
              formData.serviceType
            ) && (

              <div className="add-maintenance-field">

                <label>
                  Next Service Odometer
                </label>

                <input
                  type="number"
                  min="0"
                  name="nextServiceOdometer"
                  value={
                    formData.nextServiceOdometer
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional"
                />

                <small>
                  Optional for services other than Oil Change
                </small>

              </div>

            )}

          {/* =====================
              STATUS MESSAGE
          ===================== */}

          <div className="add-maintenance-status-info full">

            {formData.status ===
              "Scheduled" && (

              <>
                <strong>
                  Scheduled
                </strong>

                <span>
                  Maintenance is planned but has not been completed yet.
                </span>
              </>

            )}

            {formData.status ===
              "In Progress" && (

              <>
                <strong>
                  In Progress
                </strong>

                <span>
                  Maintenance work is currently being carried out.
                </span>
              </>

            )}

            {formData.status ===
              "Completed" &&
              formData.serviceType
                .trim() === "" && (

                <>
                  <strong>
                    Maintenance Completed
                  </strong>

                  <span>
                    Enter the service type to configure the next service reminder.
                  </span>
                </>

              )}

            {formData.status ===
              "Completed" &&
              isOilChange(
                formData.serviceType
              ) && (

                <>
                  <strong>
                    Oil Change Completed
                  </strong>

                  <span>
                    The system will automatically set the next Oil Change 5,000 km after the current vehicle odometer.
                  </span>
                </>

              )}

            {formData.status ===
              "Completed" &&
              formData.serviceType
                .trim() !== "" &&
              !isOilChange(
                formData.serviceType
              ) && (

                <>
                  <strong>
                    Maintenance Completed
                  </strong>

                  <span>
                    You can optionally enter a future service odometer for this maintenance type.
                  </span>
                </>

              )}

          </div>

          {/* REMARKS */}

          <div className="add-maintenance-field full">

            <label>
              Remarks
            </label>

            <input
              type="text"
              name="remarks"
              value={
                formData.remarks
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* ERROR */}

          {error && (

            <div className="add-maintenance-error">
              {error}
            </div>

          )}

          {/* ACTIONS */}

          <div className="add-maintenance-actions">

            <button
              type="button"
              className="add-maintenance-cancel"
              onClick={() =>
                navigate(
                  "/maintenance"
                )
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="add-maintenance-submit"
              disabled={
                loading
              }
            >
              {loading
                ? "SAVING..."
                : "ADD MAINTENANCE"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default AddMaintenance;