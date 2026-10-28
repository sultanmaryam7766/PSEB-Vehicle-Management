import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./AddUser.css";

function AddUser() {
  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    checkingAccess,
    setCheckingAccess,
  ] = useState(true);

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "Operator",
  });

  const [
    message,
    setMessage,
  ] = useState("");

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
    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          storedUser
        );

      if (
        parsedUser.role !==
        "Administrator"
      ) {
        if (
          parsedUser.role ===
          "Operator"
        ) {
          navigate(
            "/operator-dashboard"
          );
        } else if (
          parsedUser.role ===
          "Viewer"
        ) {
          navigate(
            "/viewer-dashboard"
          );
        } else {
          navigate("/");
        }

        return;
      }

      setUser(parsedUser);

      setCheckingAccess(
        false
      );
    } catch (err) {
      console.error(
        "User data error:",
        err
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "token"
      );

      navigate("/");
    }
  }, [
    navigate,
  ]);

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange =
    (e) => {
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

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setMessage("");
      setError("");

      if (
        formData.password.length <
        6
      ) {
        setError(
          "Password must be at least 6 characters"
        );

        return;
      }

      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/users",
            {
              method: "POST",

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

          navigate("/");
          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to create user"
          );

          return;
        }

        setMessage(
          "User created successfully"
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          department: "",
          role: "Operator",
        });
      } catch (err) {
        console.error(
          "Add user error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

  if (checkingAccess) {
    return (
      <div className="adduser-loading" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="adduser-page">

      <main className="adduser-content">

        {/* =========================
            HEADER
        ========================= */}

        <div className="adduser-header">

          <div className="adduser-header-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="8"
                r="3"
              />

              <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />

              <path d="M17 8v6" />

              <path d="M14 11h6" />
            </svg>
          </div>

          <h1>
            Add User
          </h1>

        </div>

        {/* =========================
            SECTION TITLE
        ========================= */}

        <div className="adduser-section-title">

          <div className="adduser-section-icon">
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
            User Information
          </span>

        </div>

        {/* =========================
            FORM
        ========================= */}

        <form
          className="adduser-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="adduser-grid">

            <div className="adduser-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="adduser-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter official email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="adduser-field">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                minLength="6"
                required
              />

            </div>

            <div className="adduser-field">

              <label>
                Department
              </label>

              <input
                type="text"
                name="department"
                placeholder="Enter department"
                value={
                  formData.department
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="adduser-field">

              <label>
                Role
              </label>

              <select
                name="role"
                value={
                  formData.role
                }
                onChange={
                  handleChange
                }
              >

                <option value="Operator">
                  Operator
                </option>

                <option value="Viewer">
                  Viewer
                </option>

                <option value="Administrator">
                  Administrator
                </option>

              </select>

            </div>

          </div>

          {error && (
            <div className="adduser-error">
              {error}
            </div>
          )}

          {message && (
            <div className="adduser-success">
              {message}
            </div>
          )}

          <div className="adduser-actions">

            <button
              type="submit"
              className="create-user-btn"
              disabled={
                loading
              }
            >
              {loading
                ? "CREATING..."
                : "CREATE USER"}
            </button>

            <button
              type="button"
              className="cancel-user-btn"
              onClick={() =>
                navigate(
                  "/users-roles"
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

export default AddUser;