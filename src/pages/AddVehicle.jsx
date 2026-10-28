import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./AddVehicle.css";

function AddVehicle() {
  const navigate =
    useNavigate();

  const storedUser =
    localStorage.getItem(
      "user"
    );

  const user =
    storedUser
      ? JSON.parse(
          storedUser
        )
      : null;

  const role =
    user?.role;

  const token =
    localStorage.getItem(
      "token"
    );

  const [
    checkingAccess,
    setCheckingAccess,
  ] =
    useState(true);

  const [
    formData,
    setFormData,
  ] =
    useState({
      registrationNo: "",
      vehicleName: "",
      location: "",
      odometer: "",
      status: "Active",
    });

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
    loading,
    setLoading,
  ] =
    useState(false);

  /* =========================
     ACCESS CHECK
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
        if (
          role === "Viewer"
        ) {
          navigate(
            "/vehicles"
          );
        } else {
          navigate("/");
        }

        return;
      }

      setCheckingAccess(
        false
      );
    },
    [
      navigate,
      role,
    ]
  );

  /* =========================
     FORM CHANGE
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
    };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (
        !formData.registrationNo.trim() ||
        !formData.vehicleName.trim()
      ) {
        setError(
          "Registration number and vehicle name are required"
        );

        return;
      }

      setLoading(
        true
      );

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/vehicles",
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
                  formData
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
              "Unable to add vehicle"
          );

          return;
        }

        setSuccess(
          "Vehicle added successfully"
        );

        setFormData({
          registrationNo:
            "",
          vehicleName:
            "",
          location:
            "",
          odometer:
            "",
          status:
            "Active",
        });
      } catch (
        err
      ) {
        console.error(
          "Add vehicle error:",
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

  /* =========================
     LOADING
  ========================= */

  if (
    checkingAccess
  ) {
    return (
      <div className="addvehicle-loading" />
    );
  }

  return (
    <div className="addvehicle-page">

      <main className="addvehicle-content">

        {/* =========================
            HEADER
        ========================= */}

        <div className="addvehicle-header">

          <div className="addvehicle-header-icon">

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 17h14" />

              <path d="M6 17v2" />

              <path d="M18 17v2" />

              <path d="M4 13l2-5h12l2 5" />

              <rect
                x="3"
                y="12"
                width="18"
                height="5"
                rx="2"
              />

              <circle
                cx="7"
                cy="15"
                r="1"
              />

              <circle
                cx="17"
                cy="15"
                r="1"
              />

            </svg>

          </div>

          <h1>
            Add Vehicle
          </h1>

        </div>

        {/* =========================
            SECTION
        ========================= */}

        <div className="addvehicle-section-title">

          <div className="addvehicle-section-icon">

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
            Vehicle Information
          </span>

        </div>

        {/* =========================
            FORM
        ========================= */}

        <form
          className="addvehicle-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="addvehicle-grid">

            <div className="addvehicle-field">

              <label>
                Registration No.
              </label>

              <input
                type="text"
                name="registrationNo"
                placeholder="Enter registration number"
                value={
                  formData.registrationNo
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="addvehicle-field">

              <label>
                Vehicle
              </label>

              <input
                type="text"
                name="vehicleName"
                placeholder="Enter vehicle name"
                value={
                  formData.vehicleName
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="addvehicle-field">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="Enter location"
                value={
                  formData.location
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="addvehicle-field">

              <label>
                Odometer
              </label>

              <input
                type="number"
                name="odometer"
                min="0"
                placeholder="Enter odometer"
                value={
                  formData.odometer
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="addvehicle-field">

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
            <div className="addvehicle-error">
              {error}
            </div>
          )}

          {success && (
            <div className="addvehicle-success">
              {success}
            </div>
          )}

          <div className="addvehicle-actions">

            <button
              type="submit"
              className="addvehicle-save-btn"
              disabled={
                loading
              }
            >
              {loading
                ? "SAVING..."
                : "ADD VEHICLE"}
            </button>

            <button
              type="button"
              className="addvehicle-cancel-btn"
              onClick={() =>
                navigate(
                  "/vehicles"
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

export default AddVehicle;