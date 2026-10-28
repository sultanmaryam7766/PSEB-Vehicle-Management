import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./AddDriver.css";

function AddDriver() {
  const navigate =
    useNavigate();

  const user = JSON.parse(
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

  const [vehicles, setVehicles] =
    useState([]);

  const [
    checkingAccess,
    setCheckingAccess,
  ] = useState(true);

  const [formData, setFormData] =
    useState({
      driverCode: "",
      driverName: "",
      location: "",
      currentVehicleId: "",
      status: "Active",
    });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (
      role !== "Administrator" &&
      role !== "Operator"
    ) {
      navigate("/drivers");
      return;
    }

    setCheckingAccess(false);
  }, [navigate, role]);

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

          if (response.ok) {
            setVehicles(
              data.vehicles || []
            );
          }
        } catch (err) {
          console.error(
            "Vehicle load error:",
            err
          );
        }
      };

    if (token) {
      loadVehicles();
    }
  }, [token]);

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");
      setLoading(true);

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/drivers",
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
              "Unable to add driver"
          );
          return;
        }

        setSuccess(
          "Driver added successfully"
        );

        setFormData({
          driverCode: "",
          driverName: "",
          location: "",
          currentVehicleId: "",
          status: "Active",
        });
      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

  if (checkingAccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "#06283f",
        }}
      />
    );
  }

  return (
    <div className="adddriver-page">
      <main className="adddriver-content">
        <div className="adddriver-header">
          <h1>
            Add Driver
          </h1>
        </div>

        <div className="adddriver-section-title">
          Driver Information
        </div>

        <form
          className="adddriver-form"
          onSubmit={
            handleSubmit
          }
        >
          <div className="adddriver-grid">
            <div className="adddriver-field">
              <label>
                Driver ID
              </label>

              <input
                type="text"
                name="driverCode"
                value={
                  formData.driverCode
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="adddriver-field">
              <label>
                Driver Name
              </label>

              <input
                type="text"
                name="driverName"
                value={
                  formData.driverName
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="adddriver-field">
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
              />
            </div>

            <div className="adddriver-field">
              <label>
                Current Vehicle
              </label>

              <select
                name="currentVehicleId"
                value={
                  formData.currentVehicleId
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  No Vehicle
                </option>

                {vehicles.map(
                  (vehicle) => (
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

            <div className="adddriver-field">
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
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {error && (
            <div className="adddriver-error">
              {error}
            </div>
          )}

          {success && (
            <div className="adddriver-success">
              {success}
            </div>
          )}

          <div className="adddriver-actions">
            <button
              type="submit"
              className="adddriver-save-btn"
              disabled={
                loading
              }
            >
              {loading
                ? "SAVING..."
                : "ADD DRIVER"}
            </button>

            <button
              type="button"
              className="adddriver-cancel-btn"
              onClick={() =>
                navigate(
                  "/drivers"
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

export default AddDriver;