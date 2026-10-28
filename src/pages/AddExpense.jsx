import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./AddExpense.css";

function AddExpense() {
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
    trips,
    setTrips,
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
    tripId: "",
    expenseDate: "",
    category: "",
    description: "",
    amount: "",
    vendor: "",
    referenceNo: "",
    remarks: "",
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
      navigate("/expenses");
    }
  }, [navigate, role, user]);

  useEffect(() => {
    const loadData =
      async () => {
        try {
          const [
            vehicleResponse,
            tripResponse,
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

          if (
            vehicleResponse.status ===
              401 ||
            tripResponse.status ===
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

          if (vehicleResponse.ok) {
            setVehicles(
              vehicleData.vehicles ||
                []
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
            "Unable to load vehicles or trips"
          );
        }
      };

    if (token) {
      loadData();
    }
  }, [navigate, token]);

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
            "http://localhost:5000/api/expenses",
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
              "Unable to add expense"
          );

          return;
        }

        navigate("/expenses");
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
    <div className="add-expense-page">
      <main className="add-expense-content">

        <div className="add-expense-header">
          <h1>
            Add Expense
          </h1>
        </div>

        <div className="add-expense-section">
          Expense Information
        </div>

        <form
          className="add-expense-form"
          onSubmit={handleSubmit}
        >
          {/* VEHICLE */}

          <div className="add-expense-field">
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

          {/* TRIP */}

          <div className="add-expense-field">
            <label>
              Trip
            </label>

            <select
              name="tripId"
              value={
                formData.tripId
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                No Linked Trip
              </option>

              {trips.map(
                (trip) => (
                  <option
                    key={trip.id}
                    value={trip.id}
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

          {/* EXPENSE DATE */}

          <div className="add-expense-field">
            <label>
              Expense Date
            </label>

            <input
              type="date"
              name="expenseDate"
              value={
                formData.expenseDate
              }
              onChange={
                handleChange
              }
              required
            />
          </div>

          {/* CATEGORY */}

          <div className="add-expense-field">
            <label>
              Category
            </label>

            <select
              name="category"
              value={
                formData.category
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="">
                Select Category
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

          {/* AMOUNT */}

          <div className="add-expense-field">
            <label>
              Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="amount"
              value={
                formData.amount
              }
              onChange={
                handleChange
              }
              required
            />
          </div>

          {/* VENDOR */}

          <div className="add-expense-field">
            <label>
              Vendor
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

          {/* REFERENCE */}

          <div className="add-expense-field">
            <label>
              Reference No.
            </label>

            <input
              type="text"
              name="referenceNo"
              value={
                formData.referenceNo
              }
              onChange={
                handleChange
              }
            />
          </div>

          {/* DESCRIPTION */}

          <div className="add-expense-field">
            <label>
              Description
            </label>

            <input
              type="text"
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
            />
          </div>

          {/* REMARKS */}

          <div className="add-expense-field full">
            <label>
              Remarks
            </label>

            <textarea
              name="remarks"
              value={
                formData.remarks
              }
              onChange={
                handleChange
              }
              rows="4"
            />
          </div>

          {error && (
            <div className="add-expense-error">
              {error}
            </div>
          )}

          <div className="add-expense-actions">

            <button
              type="button"
              className="add-expense-cancel"
              onClick={() =>
                navigate(
                  "/expenses"
                )
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="add-expense-submit"
              disabled={loading}
            >
              {loading
                ? "SAVING..."
                : "ADD EXPENSE"}
            </button>

          </div>
        </form>
      </main>
    </div>
  );
}

export default AddExpense;