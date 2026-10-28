import {
  useEffect,
  useState,
} from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  useNavigate,
} from "react-router-dom";

import "./AddDocument.css";

function AddDocument() {
  const navigate = useNavigate();

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
    documentFile,
    setDocumentFile,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    vehicleId: "",
    documentType: "",
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    documentReference: "",
    remarks: "",
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
      navigate("/documents");
    }
  }, [
    navigate,
    role,
    user,
  ]);

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

          if (response.ok) {
            setVehicles(
              data.vehicles || []
            );
          } else {
            setError(
              data.message ||
                "Unable to load vehicles"
            );
          }
        } catch (err) {
          console.error(err);

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

  const formatDateForDatabase = (
    date
  ) => {
    if (!date) {
      return "";
    }

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

  const parseDatabaseDate = (
    value
  ) => {
    if (!value) {
      return null;
    }

    const [
      year,
      month,
      day,
    ] = value
      .split("-")
      .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return null;
    }

    return new Date(
      year,
      month - 1,
      day
    );
  };

  const handleIssueDateChange = (
    date
  ) => {
    setFormData(
      (prev) => ({
        ...prev,
        issueDate:
          formatDateForDatabase(
            date
          ),
      })
    );
  };

  const handleExpiryDateChange = (
    date
  ) => {
    setFormData(
      (prev) => ({
        ...prev,
        expiryDate:
          formatDateForDatabase(
            date
          ),
      })
    );
  };

  const handleFileChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      setDocumentFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only PDF, JPG and PNG files are allowed"
      );

      e.target.value = "";

      setDocumentFile(null);

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "File size must be 5 MB or less"
      );

      e.target.value = "";

      setDocumentFile(null);

      return;
    }

    setError("");

    setDocumentFile(file);
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setLoading(true);

      try {
        const data =
          new FormData();

        data.append(
          "vehicleId",
          formData.vehicleId
        );

        data.append(
          "documentType",
          formData.documentType
        );

        data.append(
          "documentNumber",
          formData.documentNumber
        );

        data.append(
          "issueDate",
          formData.issueDate
        );

        data.append(
          "expiryDate",
          formData.expiryDate
        );

        data.append(
          "documentReference",
          formData.documentReference
        );

        data.append(
          "remarks",
          formData.remarks
        );

        if (documentFile) {
          data.append(
            "documentFile",
            documentFile
          );
        }

        const response =
          await fetch(
            "http://localhost:5000/api/documents",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body: data,
            }
          );

        const result =
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
            result.message ||
              "Unable to add document"
          );

          return;
        }

        navigate("/documents");
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
    <div className="add-document-page">
      <main className="add-document-content">

        <div className="add-document-header">
          <h1>
            Add Vehicle Document
          </h1>
        </div>

        <div className="add-document-section">
          Document Information
        </div>

        <form
          className="add-document-form"
          onSubmit={handleSubmit}
        >

          <div className="add-document-field">
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

          <div className="add-document-field">
            <label>
              Document Type
            </label>

            <select
              name="documentType"
              value={
                formData.documentType
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="">
                Select Type
              </option>

              <option value="Registration">
                Registration
              </option>

              <option value="Insurance">
                Insurance
              </option>

              <option value="Token Tax">
                Token Tax
              </option>

              <option value="Fitness Certificate">
                Fitness Certificate
              </option>

              <option value="Route Permit">
                Route Permit
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div className="add-document-field">
            <label>
              Document Number
            </label>

            <input
              type="text"
              name="documentNumber"
              value={
                formData.documentNumber
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div className="add-document-field">
            <label>
              Upload PDF / Image
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={
                handleFileChange
              }
            />

            {documentFile && (
              <small className="add-document-file-name">
                Selected:{" "}
                {documentFile.name}
              </small>
            )}
          </div>

          <div className="add-document-dates-row">

            <div className="add-document-date-inline">
              <label>
                Issue Date
              </label>

              <DatePicker
                selected={
                  parseDatabaseDate(
                    formData.issueDate
                  )
                }
                onChange={
                  handleIssueDateChange
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Issue Date"

                showMonthDropdown
                showYearDropdown
                dropdownMode="select"

                yearDropdownItemNumber={150}
                scrollableYearDropdown

                minDate={
                  new Date(
                    1900,
                    0,
                    1
                  )
                }

                maxDate={
                  new Date(
                    2100,
                    11,
                    31
                  )
                }

                showPopperArrow={false}
                isClearable
              />
            </div>

            <div className="add-document-date-inline">
              <label>
                Expiry Date
              </label>

              <DatePicker
                selected={
                  parseDatabaseDate(
                    formData.expiryDate
                  )
                }
                onChange={
                  handleExpiryDateChange
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Expiry Date"

                showMonthDropdown
                showYearDropdown
                dropdownMode="select"

                yearDropdownItemNumber={150}
                scrollableYearDropdown

                minDate={
                  new Date(
                    1900,
                    0,
                    1
                  )
                }

                maxDate={
                  new Date(
                    2100,
                    11,
                    31
                  )
                }

                showPopperArrow={false}
                isClearable
                required
              />
            </div>

          </div>

          <div className="add-document-field full">
            <label>
              File / Reference
            </label>

            <input
              type="text"
              name="documentReference"
              value={
                formData.documentReference
              }
              onChange={
                handleChange
              }
              placeholder="Reference number or URL"
            />
          </div>

          <div className="add-document-field full">
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

          {error && (
            <div className="add-document-error">
              {error}
            </div>
          )}

          <div className="add-document-actions">

            <button
              type="button"
              className="add-document-cancel"
              onClick={() =>
                navigate(
                  "/documents"
                )
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="add-document-submit"
              disabled={loading}
            >
              {loading
                ? "SAVING..."
                : "ADD DOCUMENT"}
            </button>

          </div>
        </form>
      </main>
    </div>
  );
}

export default AddDocument;