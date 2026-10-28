import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import "./CompleteTrip.css";

function CompleteTrip() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const tripId =
    searchParams.get(
      "tripId"
    );

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
    trip,
    setTrip,
  ] =
    useState(null);

  const [
    endOdometer,
    setEndOdometer,
  ] =
    useState("");

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      new Date()
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =========================
     AUTH
  ========================= */

  useEffect(() => {
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
      return;
    }

    if (!tripId) {
      navigate(
        "/trips"
      );
    }
  }, [
    navigate,
    role,
    tripId,
    user,
  ]);

  /* =========================
     LOAD TRIP
  ========================= */

  useEffect(() => {
    const loadTrip =
      async () => {
        if (
          !token ||
          !tripId
        ) {
          return;
        }

        try {
          const response =
            await fetch(
              `http://localhost:5000/api/trips/${tripId}`,
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

          if (
            !response.ok
          ) {
            setError(
              data.message ||
                "Unable to load trip"
            );

            return;
          }

          setTrip(
            data.trip
          );

          setEndOdometer(
            data.trip
              .start_odometer
          );
        } catch (
          err
        ) {
          console.error(
            "Trip load error:",
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

    loadTrip();
  }, [
    token,
    tripId,
    navigate,
  ]);

  /* =========================
     DISTANCE
  ========================= */

  const distance =
    useMemo(() => {
      if (
        !trip ||
        endOdometer === ""
      ) {
        return null;
      }

      const end =
        Number(
          endOdometer
        );

      const start =
        Number(
          trip.start_odometer
        );

      if (
        Number.isNaN(
          end
        ) ||
        end < start
      ) {
        return null;
      }

      return (
        end -
        start
      );
    }, [
      endOdometer,
      trip,
    ]);

  /* =========================
     FORMAT DATETIME
  ========================= */

  const formatDateTime =
    (
      date
    ) => {
      const pad =
        (
          value
        ) =>
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
     COMPLETE TRIP
  ========================= */

  const handleComplete =
    async () => {
      setError("");

      if (
        !trip ||
        distance === null
      ) {
        setError(
          "Please enter a valid end odometer"
        );

        return;
      }

      setSubmitting(
        true
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/trips/${trip.id}/complete`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  endOdometer,

                  endDateTime:
                    formatDateTime(
                      endDate
                    ),
                }),
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

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to complete trip"
          );

          return;
        }

        /*
          After completion backend updates
          vehicle odometer.
        */

        sessionStorage.setItem(
          "refreshVehicleNotifications",
          "1"
        );

        sessionStorage.setItem(
          "openVehicleNotifications",
          "1"
        );

        navigate(
          "/trips"
        );
      } catch (
        err
      ) {
        console.error(
          "Complete trip error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* =========================
     LOADING
  ========================= */

  if (
    loading
  ) {
    return (
      <div className="complete-page">

        <main className="complete-content">

          <div className="complete-header">

            <div className="complete-header-icon">
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
              Complete Trip
            </h1>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="complete-page">

      <main className="complete-content">

        {/* HEADER */}

        <div className="complete-header">

          <div className="complete-header-icon">

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 21c0-7 4-7 4-14" />
              <path d="M19 21c0-7-4-7-4-14" />
              <path d="M9 7h6" />
              <path d="M15 12l2 2 4-4" />
            </svg>

          </div>

          <h1>
            Complete Trip
          </h1>

        </div>

        {/* SECTION */}

        <div className="complete-section">

          <div className="complete-section-icon">

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
            Trip Completion
          </span>

        </div>

        {error && (
          <div className="complete-error">
            {error}
          </div>
        )}

        {trip && (
          <>

            {/* TRIP INFO */}

            <div className="complete-trip-info">

              <div>

                <strong>
                  TRIP-
                  {String(
                    trip.id
                  ).padStart(
                    5,
                    "0"
                  )}
                </strong>

                <span>
                  {
                    trip.registration_no
                  }{" "}
                  •{" "}
                  {
                    trip.driver_name
                  }{" "}
                  •{" "}
                  {
                    trip.from_location
                  }{" "}
                  →{" "}
                  {
                    trip.destination
                  }
                </span>

              </div>

            </div>

            {/* FORM */}

            <div className="complete-form">

              <div className="complete-field">

                <label>
                  Start Odometer
                </label>

                <input
                  type="text"
                  value={
                    trip.start_odometer
                  }
                  readOnly
                />

              </div>

              <div className="complete-field">

                <label>
                  End Odometer
                </label>

                <input
                  type="number"
                  min={
                    trip.start_odometer
                  }
                  value={
                    endOdometer
                  }
                  onChange={(
                    e
                  ) =>
                    setEndOdometer(
                      e.target.value
                    )
                  }
                  placeholder="Enter end odometer"
                />

              </div>

              <div className="complete-field">

                <label>
                  Start Date / Time
                </label>

                <input
                  type="text"
                  value={
                    trip.start_datetime ||
                    "--"
                  }
                  readOnly
                />

              </div>

              <div className="complete-field">

                <label>
                  End Date / Time
                </label>

                <DatePicker
                  selected={
                    endDate
                  }
                  onChange={(
                    date
                  ) =>
                    setEndDate(
                      date
                    )
                  }
                  showTimeSelect
                  timeIntervals={
                    15
                  }
                  dateFormat="dd-MM-yyyy h:mm aa"
                  className="complete-datepicker"
                  calendarClassName="complete-calendar"
                  popperPlacement="bottom-start"
                />

              </div>

            </div>

            {/* DISTANCE */}

            <div className="complete-distance">

              <span>
                AUTO-CALCULATED DISTANCE
              </span>

              <strong>
                {distance !==
                null
                  ? `${distance.toLocaleString()} km`
                  : "-- km"}
              </strong>

            </div>

            {/* ACTIONS */}

            <div className="complete-actions">

              <button
                type="button"
                className="complete-submit"
                onClick={
                  handleComplete
                }
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "COMPLETING..."
                  : "COMPLETE TRIP"}
              </button>

              <button
                type="button"
                className="complete-cancel"
                onClick={() =>
                  navigate(
                    "/trips"
                  )
                }
              >
                CANCEL
              </button>

            </div>

          </>
        )}

      </main>

    </div>
  );
}

export default CompleteTrip;