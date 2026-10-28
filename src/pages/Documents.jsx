import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import NotificationBell from "../components/NotificationBell";

import {
  useNavigate,
} from "react-router-dom";

import "./Documents.css";

function Documents() {
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
const userName =
  user?.name ||
  "User";

const userInitials =
  userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
  const [
    documents,
    setDocuments,
  ] =
    useState([]);

  const [
    vehicles,
    setVehicles,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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
    deletingId,
    setDeletingId,
  ] =
    useState(null);

  const [
    locationFilter,
    setLocationFilter,
  ] =
    useState("All");

  const [
    monthFilter,
    setMonthFilter,
  ] =
    useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("All");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] =
    useState(20);

  const [
    searchWord,
    setSearchWord,
  ] =
    useState("");

  const [
    searchOn,
    setSearchOn,
  ] =
    useState("Any");

  const [
    editingDocument,
    setEditingDocument,
  ] =
    useState(null);

  const [
    editDocumentFile,
    setEditDocumentFile,
  ] =
    useState(null);

  const [
    editForm,
    setEditForm,
  ] =
    useState({
      vehicleId: "",
      documentType: "",
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      documentReference: "",
      remarks: "",
    });

  /* =========================
     AUTH
  ========================= */

  useEffect(
    () => {
      if (
        !user
      ) {
        navigate(
          "/"
        );
      }
    },
    [
      navigate,
      user,
    ]
  );

  /* =========================
     LOAD DOCUMENTS
  ========================= */

  const loadDocuments =
    useCallback(
      async () => {
        if (
          !token
        ) {
          return;
        }

        setLoading(
          true
        );

        setError(
          ""
        );

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/documents",
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
                "Unable to load documents"
            );

            return;
          }

          setDocuments(
            data.documents ||
              []
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
      },
      [
        navigate,
        token,
      ]
    );

  /* =========================
     LOAD VEHICLES
  ========================= */

  const loadVehicles =
    useCallback(
      async () => {
        if (
          !token
        ) {
          return;
        }

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

            navigate(
              "/"
            );

            return;
          }

          if (
            response.ok
          ) {
            setVehicles(
              data.vehicles ||
                []
            );
          }
        } catch (
          err
        ) {
          console.error(
            err
          );
        }
      },
      [
        navigate,
        token,
      ]
    );

  useEffect(
    () => {
      loadDocuments();
      loadVehicles();
    },
    [
      loadDocuments,
      loadVehicles,
    ]
  );

  /* =========================
     MENU
  ========================= */

  const menuItems = [
    {
      name:
        "Dashboard",
    },

    {
      name:
        "Vehicles",
      path:
        "/vehicles",
    },

    {
      name:
        "Vehicle History",
      path:
        "/vehicle-history",
    },

    {
      name:
        "Drivers",
      path:
        "/drivers",
    },

    {
      name:
        "Trips",
      path:
        "/trips",
    },

    {
      name:
        "Fuel",
      path:
        "/fuel",
    },

    {
      name:
        "Maintenance",
      path:
        "/maintenance",
    },

    {
      name:
        "Documents",
      path:
        "/documents",
    },

    {
      name:
        "Incidents",
      path:
        "/incidents",
    },

    {
      name:
        "Expenses",
      path:
        "/expenses",
    },

    {
      name:
        "Reports",
      path:
        "/reports",
    },
  ];

  if (
    role ===
    "Administrator"
  ) {
    menuItems.push(
      {
        name:
          "Users & Roles",
        path:
          "/users-roles",
      },

      {
        name:
          "Audit Log",
        path:
          "/audit-log",
      }
    );
  }

  const handleDashboard =
    () => {
      if (
        role ===
        "Administrator"
      ) {
        navigate(
          "/admin-dashboard"
        );
      } else if (
        role ===
        "Operator"
      ) {
        navigate(
          "/operator-dashboard"
        );
      } else {
        navigate(
          "/viewer-dashboard"
        );
      }
    };

  const handleMenuClick = (
    item
  ) => {
    if (
      item.name ===
      "Dashboard"
    ) {
      handleDashboard();
      return;
    }

    navigate(
      item.path
    );
  };

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/"
      );
    };

  /* =========================
     DATE
  ========================= */

  const dateOnly = (
    value
  ) => {
    if (
      !value
    ) {
      return "";
    }

    return String(
      value
    ).slice(
      0,
      10
    );
  };

  /* =========================
     FILE VIEW / DOWNLOAD
  ========================= */

  const getDocumentFileUrl = (
    fileName
  ) => {
    if (
      !fileName
    ) {
      return "";
    }

    return `http://localhost:5000/uploads/${encodeURIComponent(
      fileName
    )}`;
  };

  const handleViewDocument = (
    document
  ) => {
    if (
      !document.document_file
    ) {
      setError(
        "No uploaded file is available for this document."
      );

      return;
    }

    setError(
      ""
    );

    const fileUrl =
      getDocumentFileUrl(
        document.document_file
      );

    const newWindow =
      window.open(
        fileUrl,
        "_blank"
      );

    if (
      newWindow
    ) {
      newWindow.opener =
        null;
    }
  };

  const handleDownloadDocument =
    async (
      document
    ) => {
      if (
        !document.document_file
      ) {
        setError(
          "No uploaded file is available for this document."
        );

        return;
      }

      setError(
        ""
      );

      try {
        const fileUrl =
          getDocumentFileUrl(
            document.document_file
          );

        const response =
          await fetch(
            fileUrl
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "File could not be downloaded"
          );
        }

        const blob =
          await response.blob();

        const blobUrl =
          window.URL.createObjectURL(
            blob
          );

        const link =
          window.document.createElement(
            "a"
          );

        link.href =
          blobUrl;

        link.download =
          document.document_file;

        window.document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          blobUrl
        );
      } catch (
        err
      ) {
        console.error(
          "Download document error:",
          err
        );

        setError(
          "Unable to download document file"
        );
      }
    };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (
    document
  ) => {
    setEditingDocument(
      document
    );

    setEditDocumentFile(
      null
    );

    setEditForm({
      vehicleId:
        document.vehicle_id,

      documentType:
        document.document_type,

      documentNumber:
        document.document_number ||
        "",

      issueDate:
        dateOnly(
          document.issue_date
        ),

      expiryDate:
        dateOnly(
          document.expiry_date
        ),

      documentReference:
        document.document_reference ||
        "",

      remarks:
        document.remarks ||
        "",
    });

    setError(
      ""
    );

    setSuccess(
      ""
    );
  };

  const handleEditChange = (
    e
  ) => {
    const {
      name,
      value,
    } =
      e.target;

    setEditForm(
      (
        prev
      ) => ({
        ...prev,

        [name]:
          value,
      })
    );
  };

  const handleEditFileChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (
      !file
    ) {
      setEditDocumentFile(
        null
      );

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

      e.target.value =
        "";

      setEditDocumentFile(
        null
      );

      return;
    }

    if (
      file.size >
      5 *
        1024 *
        1024
    ) {
      setError(
        "File size must be 5 MB or less"
      );

      e.target.value =
        "";

      setEditDocumentFile(
        null
      );

      return;
    }

    setError(
      ""
    );

    setEditDocumentFile(
      file
    );
  };

  const handleUpdate =
    async (
      e
    ) => {
      e.preventDefault();

      if (
        !editingDocument
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      try {
        const form =
          new FormData();

        form.append(
          "vehicleId",
          editForm.vehicleId
        );

        form.append(
          "documentType",
          editForm.documentType
        );

        form.append(
          "documentNumber",
          editForm.documentNumber
        );

        form.append(
          "issueDate",
          editForm.issueDate
        );

        form.append(
          "expiryDate",
          editForm.expiryDate
        );

        form.append(
          "documentReference",
          editForm.documentReference
        );

        form.append(
          "remarks",
          editForm.remarks
        );

        if (
          editDocumentFile
        ) {
          form.append(
            "documentFile",
            editDocumentFile
          );
        }

        const response =
          await fetch(
            `http://localhost:5000/api/documents/${editingDocument.id}`,
            {
              method:
                "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                form,
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
              "Unable to update document"
          );

          return;
        }

        setSuccess(
          "Document updated successfully"
        );

        setEditingDocument(
          null
        );

        setEditDocumentFile(
          null
        );

        await loadDocuments();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
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
      }
    };

  /* =========================
     DELETE
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      document
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const vehicle =
        `${document.registration_no || ""}${
          document.vehicle_name
            ? ` - ${document.vehicle_name}`
            : ""
        }`;

      const number =
        document.document_number
          ? `\nDocument No: ${document.document_number}`
          : "";

      const fileInfo =
        document.document_file
          ? "\nThe uploaded file will also be permanently deleted."
          : "";

      const confirmed =
        window.confirm(
          `Delete this vehicle document?\n\n` +
          `${vehicle}\n` +
          `${document.document_type || ""}` +
          `${number}\n\n` +
          "This document record will be permanently deleted." +
          `${fileInfo}\n\n` +
          "Vehicle History and document notifications will update.\n\n" +
          "Do you want to continue?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      setDeletingId(
        document.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/documents/${document.id}`,
            {
              method:
                "DELETE",

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

          navigate(
            "/"
          );

          return;
        }

        if (
          response.status ===
          403
        ) {
          setError(
            "Only Administrator can delete vehicle documents"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete document"
          );

          return;
        }

        setSuccess(
          `${document.document_type} deleted successfully`
        );

        if (
          editingDocument?.id ===
          document.id
        ) {
          setEditingDocument(
            null
          );

          setEditDocumentFile(
            null
          );
        }

        await loadDocuments();

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Delete document error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================
     FILTER DATA
  ========================= */

  const locations =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            documents
              .map(
                (
                  document
                ) =>
                  document.location
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        documents,
      ]
    );

  const months =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            documents
              .map(
                (
                  document
                ) =>
                  document.expiry_date
                    ? String(
                        document.expiry_date
                      ).slice(
                        0,
                        7
                      )
                    : null
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        documents,
      ]
    );

  const filteredDocuments =
    useMemo(
      () => {
        /*
          Latest added document
          always comes first.
        */

        let result = [
          ...documents,
        ].sort(
          (
            a,
            b
          ) =>
            Number(
              b.id
            ) -
            Number(
              a.id
            )
        );

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                document
              ) =>
                document.location ===
                locationFilter
            );
        }

        if (
          monthFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                document
              ) =>
                String(
                  document.expiry_date
                ).slice(
                  0,
                  7
                ) ===
                monthFilter
            );
        }

        if (
          statusFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                document
              ) =>
                document.status ===
                statusFilter
            );
        }

        const word =
          searchWord
            .trim()
            .toLowerCase();

        if (
          word
        ) {
          result =
            result.filter(
              (
                document
              ) => {
                const vehicle =
                  `${document.registration_no || ""} ${document.vehicle_name || ""}`.toLowerCase();

                const type =
                  (
                    document.document_type ||
                    ""
                  ).toLowerCase();

                const number =
                  (
                    document.document_number ||
                    ""
                  ).toLowerCase();

                if (
                  searchOn ===
                  "Vehicle"
                ) {
                  return vehicle.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Document Type"
                ) {
                  return (
                    type.includes(
                      word
                    ) ||
                    number.includes(
                      word
                    )
                  );
                }

                return (
                  vehicle.includes(
                    word
                  ) ||
                  type.includes(
                    word
                  ) ||
                  number.includes(
                    word
                  )
                );
              }
            );
        }

        return result.slice(
          0,
          Number(
            recordsPerPage
          )
        );
      },
      [
        documents,
        locationFilter,
        monthFilter,
        statusFilter,
        recordsPerPage,
        searchWord,
        searchOn,
      ]
    );

  return (
    <div className="documents-page">

      {/* SIDEBAR */}

      <aside className="documents-sidebar">

      <div className="documents-welcome">

  <div className="documents-profile-avatar">
    {userInitials}
  </div>

  <div className="documents-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="documents-menu">

          {menuItems.map(
            (
              item
            ) => (

              <button
                key={
                  item.name
                }
                className={
                  item.name ===
                  "Documents"
                    ? "documents-menu-btn active"
                    : "documents-menu-btn"
                }
                onClick={() =>
                  handleMenuClick(
                    item
                  )
                }
              >
                {
                  item.name
                }
              </button>

            )
          )}

        </div>

        <button
          className="documents-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* CONTENT */}

      <main className="documents-content">

        <div className="documents-header">

          <h1>
            Vehicle Documents
          </h1>

        </div>

        {/* FILTERS */}

        <div className="documents-filters">

          <div className="documents-filter-field">

            <label>
              Location
            </label>

            <select
              value={
                locationFilter
              }
              onChange={(
                e
              ) =>
                setLocationFilter(
                  e.target.value
                )
              }
            >

              {locations.map(
                (
                  location
                ) => (

                  <option
                    key={
                      location
                    }
                    value={
                      location
                    }
                  >
                    {
                      location
                    }
                  </option>

                )
              )}

            </select>

          </div>

          <div className="documents-filter-field">

            <label>
              Expiry Month
            </label>

            <select
              value={
                monthFilter
              }
              onChange={(
                e
              ) =>
                setMonthFilter(
                  e.target.value
                )
              }
            >

              {months.map(
                (
                  month
                ) => (

                  <option
                    key={
                      month
                    }
                    value={
                      month
                    }
                  >
                    {
                      month
                    }
                  </option>

                )
              )}

            </select>

          </div>

          <div className="documents-filter-field">

            <label>
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(
                e
              ) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Valid">
                Valid
              </option>

              <option value="Expiring">
                Expiring
              </option>

              <option value="Urgent">
                Urgent
              </option>

              <option value="Expired">
                Expired
              </option>

            </select>

          </div>

          <div className="documents-filter-field">

            <label>
              Records / page
            </label>

            <select
              value={
                recordsPerPage
              }
              onChange={(
                e
              ) =>
                setRecordsPerPage(
                  e.target.value
                )
              }
            >

              <option value="20">
                20
              </option>

              <option value="50">
                50
              </option>

              <option value="100">
                100
              </option>

            </select>

          </div>

          <div className="documents-filter-field">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search document..."
              value={
                searchWord
              }
              onChange={(
                e
              ) =>
                setSearchWord(
                  e.target.value
                )
              }
            />

          </div>

          <div className="documents-filter-field">

            <label>
              Search On
            </label>

            <select
              value={
                searchOn
              }
              onChange={(
                e
              ) =>
                setSearchOn(
                  e.target.value
                )
              }
            >

              <option value="Any">
                Any
              </option>

              <option value="Vehicle">
                Vehicle
              </option>

              <option value="Document Type">
                Document Type
              </option>

            </select>

          </div>

        </div>

        {/* ADD DOCUMENT */}

        {role !==
          "Viewer" && (

          <div className="documents-actions">

            <button
              className="documents-add-btn"
              onClick={() =>
                navigate(
                  "/add-document"
                )
              }
            >
              + ADD DOCUMENT
            </button>

          </div>

        )}

        {/* MESSAGES */}

        {error && (

          <div className="documents-error">
            {
              error
            }
          </div>

        )}

        {success && (

          <div className="documents-success">
            {
              success
            }
          </div>

        )}

        {/* TABLE */}

        <div className="documents-table-wrapper">

          <table className="documents-table">

            <thead>

              <tr>

                <th>
                  Vehicle
                </th>

                <th>
                  Document
                </th>

                <th>
                  Expiry
                </th>

                <th>
                  Days Left
                </th>

                <th>
                  Status
                </th>

                <th>
                  File
                </th>

                {role !==
                  "Viewer" && (

                  <th>
                    Action
                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="documents-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 6
                        : 7
                    }
                  >
                    Loading documents...
                  </td>

                </tr>

              ) : filteredDocuments.length ===
                0 ? (

                <tr className="documents-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 6
                        : 7
                    }
                  >
                    No vehicle documents found.
                  </td>

                </tr>

              ) : (

                filteredDocuments.map(
                  (
                    document
                  ) => (

                    <tr
                      key={
                        document.id
                      }
                    >

                      <td>

                        <strong>
                          {
                            document.registration_no
                          }
                        </strong>

                        <br />

                        {
                          document.vehicle_name
                        }

                      </td>

                      <td>

                        {
                          document.document_type
                        }

                        {document.document_number && (

                          <>

                            <br />

                            <small>
                              {
                                document.document_number
                              }
                            </small>

                          </>

                        )}

                      </td>

                      <td>
                        {dateOnly(
                          document.expiry_date
                        )}
                      </td>

                      <td>
                        {
                          document.days_left
                        }
                      </td>

                      <td>

                        <span
                          className={`document-status ${String(
                            document.status ||
                              ""
                          )
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            document.status
                          }
                        </span>

                      </td>

                      <td>

                        {document.document_file ? (

                          <div className="document-file-actions">

                            <button
                              type="button"
                              className="document-view-btn"
                              onClick={() =>
                                handleViewDocument(
                                  document
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="document-download-btn"
                              onClick={() =>
                                handleDownloadDocument(
                                  document
                                )
                              }
                            >
                              Download
                            </button>

                          </div>

                        ) : (
                          "--"
                        )}

                      </td>

                      {role !==
                        "Viewer" && (

                        <td>

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              gap:
                                "6px",

                              flexWrap:
                                "wrap",
                            }}
                          >

                            <button
                              type="button"
                              className="document-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  document
                                )
                              }
                            >
                              Edit
                            </button>

                            {role ===
                              "Administrator" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    document
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  document.id
                                }
                                style={{
                                  border:
                                    "1px solid #a83232",

                                  background:
                                    deletingId ===
                                    document.id
                                      ? "#eeeeee"
                                      : "#ffffff",

                                  color:
                                    "#a83232",

                                  borderRadius:
                                    "4px",

                                  padding:
                                    "6px 10px",

                                  fontSize:
                                    "11px",

                                  fontWeight:
                                    "700",

                                  cursor:
                                    deletingId ===
                                    document.id
                                      ? "not-allowed"
                                      : "pointer",

                                  opacity:
                                    deletingId ===
                                    document.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {deletingId ===
                                document.id
                                  ? "DELETING..."
                                  : "DELETE"}
                              </button>

                            )}

                          </div>

                        </td>

                      )}

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* EDIT DOCUMENT */}

        {editingDocument && (

          <div className="document-edit-box">

            <h3>
              Edit Document
            </h3>

            <form
              onSubmit={
                handleUpdate
              }
            >

              <div className="document-edit-grid">

                <div>

                  <label>
                    Vehicle
                  </label>

                  <select
                    name="vehicleId"
                    value={
                      editForm.vehicleId
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  >

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

                <div>

                  <label>
                    Document Type
                  </label>

                  <select
                    name="documentType"
                    value={
                      editForm.documentType
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  >

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

                <div>

                  <label>
                    Document Number
                  </label>

                  <input
                    type="text"
                    name="documentNumber"
                    value={
                      editForm.documentNumber
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Issue Date
                  </label>

                  <input
                    type="date"
                    name="issueDate"
                    value={
                      editForm.issueDate
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={
                      editForm.expiryDate
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    File / Reference
                  </label>

                  <input
                    type="text"
                    name="documentReference"
                    value={
                      editForm.documentReference
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div>

                  <label>
                    Replace PDF / Image
                  </label>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleEditFileChange
                    }
                  />

                  {editDocumentFile && (

                    <small className="document-edit-file-name">
                      Selected:{" "}
                      {
                        editDocumentFile.name
                      }
                    </small>

                  )}

                  {!editDocumentFile &&
                    editingDocument.document_file && (

                    <small className="document-edit-file-name">
                      Current file:{" "}
                      {
                        editingDocument.document_file
                      }
                    </small>

                  )}

                </div>

                <div className="document-edit-full">

                  <label>
                    Remarks
                  </label>

                  <input
                    type="text"
                    name="remarks"
                    value={
                      editForm.remarks
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

              </div>

              <div className="document-edit-actions">

                <button
                  type="submit"
                  className="document-save-btn"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="document-cancel-btn"
                  onClick={() => {
                    setEditingDocument(
                      null
                    );

                    setEditDocumentFile(
                      null
                    );
                  }}
                >
                  CANCEL
                </button>

              </div>

            </form>

          </div>

        )}

      </main>

    </div>
  );
}

export default Documents;