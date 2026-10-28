import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./AddFuel.css";

function AddFuel() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role;
  const token =
    localStorage.getItem("token");

  const [vehicles, setVehicles] =
    useState([]);

  const [trips, setTrips] =
    useState([]);

  const [fuelDate, setFuelDate] =
    useState(new Date());

  const [formData, setFormData] =
    useState({
      vehicleId: "",
      tripId: "",
      liters: "",
      amount: "",
      odometer: "",
      stationVendor: "",
      remarks: "",
      status: "Pending",
    });

  const [error, setError] =
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
      navigate("/fuel");
    }
  }, [navigate, role]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [
          vehicleResponse,
          tripResponse,
        ] = await Promise.all([
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
            "http://localhost:5000/api/trips",
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

        const tripData =
          await tripResponse.json();

        if (vehicleResponse.ok) {
          setVehicles(
            vehicleData.vehicles || []
          );
        }

        if (tripResponse.ok) {
          setTrips(
            tripData.trips || []
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load vehicle/trip data"
        );
      }
    };

    if (token) {
      loadOptions();
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

    if (name === "vehicleId") {
      const vehicle =
        vehicles.find(
          (item) =>
            String(item.id) ===
            String(value)
        );

      if (vehicle) {
        setFormData((prev) => ({
          ...prev,
          vehicleId: value,
          odometer:
            vehicle.odometer ?? 0,
        }));
      }
    }
  };

  const formatDateTime = (date) => {
    const pad = (value) =>
      String(value).padStart(
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/fuel",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...formData,
            fuelDate:
              formatDateTime(
                fuelDate
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to add fuel record"
        );
        return;
      }

      navigate("/fuel");
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
    <div className="addfuel-page">
      <main className="addfuel-content">
        <div className="addfuel-header">
          <h1>Add Fuel Record</h1>
        </div>

        <div className="addfuel-section">
          Fuel Information
        </div>

        <form
          className="addfuel-form"
          onSubmit={handleSubmit}
        >
          <div className="addfuel-field">
            <label>Vehicle</label>

            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
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

          <div className="addfuel-field">
            <label>
              Trip (Optional)
            </label>

            <select
              name="tripId"
              value={formData.tripId}
              onChange={handleChange}
            >
              <option value="">
                No Trip
              </option>

              {trips.map((trip) => (
                <option
                  key={trip.id}
                  value={trip.id}
                >
                  TRIP-
                  {String(
                    trip.id
                  ).padStart(5, "0")}
                  {" - "}
                  {trip.registration_no}
                </option>
              ))}
            </select>
          </div>

          <div className="addfuel-field">
            <label>Date / Time</label>

            <DatePicker
              selected={fuelDate}
              onChange={(date) =>
                setFuelDate(date)
              }
              showTimeSelect
              timeIntervals={15}
              dateFormat="dd-MM-yyyy h:mm aa"
              className="addfuel-datepicker"
            />
          </div>

          <div className="addfuel-field">
            <label>Liters</label>

            <input
              type="number"
              step="0.01"
              min="0"
              name="liters"
              value={formData.liters}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addfuel-field">
            <label>Amount</label>

            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addfuel-field">
            <label>Odometer</label>

            <input
              type="number"
              min="0"
              name="odometer"
              value={formData.odometer}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addfuel-field">
            <label>
              Station / Vendor
            </label>

            <input
              type="text"
              name="stationVendor"
              value={
                formData.stationVendor
              }
              onChange={handleChange}
            />
          </div>

          <div className="addfuel-field">
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">
                Pending
              </option>

              <option value="Verified">
                Verified
              </option>
            </select>
          </div>

          <div className="addfuel-field full">
            <label>Remarks</label>

            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="addfuel-error">
              {error}
            </div>
          )}

          <div className="addfuel-actions">
            <button
              type="button"
              className="addfuel-cancel"
              onClick={() =>
                navigate("/fuel")
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="addfuel-submit"
              disabled={loading}
            >
              {loading
                ? "SAVING..."
                : "ADD FUEL RECORD"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddFuel;