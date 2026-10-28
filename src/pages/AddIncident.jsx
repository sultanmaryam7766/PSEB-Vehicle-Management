import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./AddIncident.css";

function AddIncident() {
  const navigate =
    useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role;

  const token =
    localStorage.getItem("token");

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    drivers,
    setDrivers,
  ] = useState([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    formData,
    setFormData,
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

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (
      role !== "Administrator" &&
      role !== "Operator"
    ) {
      navigate("/incidents");
    }
  }, [navigate, role]);

  useEffect(() => {
    const loadData =
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
              vehicleData.vehicles ||
                []
            );
          }

          if (
            driverResponse.ok
          ) {
            setDrivers(
              driverData.drivers ||
                []
            );
          }
        } catch (err) {
          console.error(err);

          setError(
            "Unable to load vehicles or drivers"
          );
        }
      };

    if (token) {
      loadData();
    }
  }, [token]);

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setLoading(true);

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/incidents",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify(
                formData
              ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to create incident"
          );
          return;
        }

        navigate(
          "/incidents"
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="add-incident-page">
      <main className="add-incident-content">
        <div className="add-incident-header">
          <h1>
            Report Incident
          </h1>
        </div>

        <div className="add-incident-section">
          Incident Information
        </div>

        <form
          className="add-incident-form"
          onSubmit={handleSubmit}
        >
          <div className="add-incident-field">
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

          <div className="add-incident-field">
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
            >
              <option value="">
                No Driver / Unknown
              </option>

              {drivers.map(
                (driver) => (
                  <option
                    key={driver.id}
                    value={driver.id}
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

          <div className="add-incident-field">
            <label>
              Incident Date
            </label>

            <input
              type="date"
              name="incidentDate"
              value={
                formData.incidentDate
              }
              onChange={
                handleChange
              }
              required
            />
          </div>

          <div className="add-incident-field">
            <label>
              Location
            </label>

            <input
              type="text"
              name="location"
              value={
                formData.location
              }
              onChange={
                handleChange
              }
              required
            />
          </div>

          <div className="add-incident-field">
            <label>
              Incident Type
            </label>

            <select
              name="incidentType"
              value={
                formData.incidentType
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="">
                Select Type
              </option>

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

          <div className="add-incident-field">
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

          <div className="add-incident-field">
            <label>
              Estimated Cost
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="estimatedCost"
              value={
                formData.estimatedCost
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="add-incident-field">
            <label>
              Actual Cost
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="actualCost"
              value={
                formData.actualCost
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="add-incident-field">
            <label>
              Police Report No.
            </label>

            <input
              type="text"
              name="policeReportNo"
              value={
                formData.policeReportNo
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="add-incident-field">
            <label>
              Insurance Claim No.
            </label>

            <input
              type="text"
              name="insuranceClaimNo"
              value={
                formData.insuranceClaimNo
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="add-incident-field full">
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              rows="4"
            />
          </div>

          {error && (
            <div className="add-incident-error">
              {error}
            </div>
          )}

          <div className="add-incident-actions">
            <button
              type="button"
              className="add-incident-cancel"
              onClick={() =>
                navigate(
                  "/incidents"
                )
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="add-incident-submit"
              disabled={loading}
            >
              {loading
                ? "SAVING..."
                : "ADD INCIDENT"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddIncident;