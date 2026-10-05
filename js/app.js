const API_URL = "http://localhost:8080/api/applications";

let applications = [];
let editingId = null;

// ===============================
// ELEMENTS
// ===============================

const addJobBtn = document.getElementById("addJobBtn");
const jobModal = document.getElementById("jobModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const jobForm = document.getElementById("jobForm");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");


// ===============================
// OPEN MODAL
// ===============================

addJobBtn.addEventListener("click", () => {

    editingId = null;

    jobForm.reset();

    document.getElementById("modalTitle").textContent =
        "Add Job Application";

    jobModal.classList.remove("hidden");
});


// ===============================
// CLOSE MODAL
// ===============================

function closeModal() {
    jobModal.classList.add("hidden");
    editingId = null;
    jobForm.reset();
}

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);


// ===============================
// LOAD APPLICATIONS
// ===============================

async function loadApplications() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        applications = await response.json();

        displayApplications();
        updateDashboard();

    } catch (error) {

        console.error("Error loading applications:", error);

        alert("Backend se data load nahi ho pa raha.");
    }
}


// ===============================
// SAVE APPLICATION
// ===============================

jobForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const application = {

        company: document.getElementById("company").value,

        role: document.getElementById("role").value,

        applicationDate:
            document.getElementById("applicationDate").value,

        interviewDate:
            document.getElementById("interviewDate").value,

        jobLink:
            document.getElementById("jobLink").value,

        status:
            document.getElementById("status").value,

        notes:
            document.getElementById("notes").value
    };


    try {

        let response;

        // UPDATE
        if (editingId) {

            response = await fetch(
                `${API_URL}/${editingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(application)
                }
            );

        }

        // ADD
        else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(application)
                }
            );
        }


        if (!response.ok) {
            throw new Error("Failed to save application");
        }


        const wasEditing = editingId !== null;

        editingId = null;

        closeModal();

        await loadApplications();


        if (wasEditing) {

            alert("Application updated successfully!");

        } else {

            alert("Application added successfully!");

        }

    } catch (error) {

        console.error("Error saving application:", error);

        alert("Application save nahi ho paayi.");
    }

});


// ===============================
// DISPLAY APPLICATIONS
// ===============================

function displayApplications() {

    const container =
        document.getElementById("applicationsList");


    const searchText =
        searchInput.value.toLowerCase().trim();


    const filterStatus =
        statusFilter.value;


    const filteredApplications =
        applications.filter(application => {

            const company =
                (application.company || "").toLowerCase();

            const role =
                (application.role || "").toLowerCase();


            const matchesSearch =
                company.includes(searchText) ||
                role.includes(searchText);


            const matchesStatus =
                filterStatus === "All" ||
                application.status === filterStatus;


            return matchesSearch && matchesStatus;

        });


    container.innerHTML = "";


    if (filteredApplications.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No applications found</h3>
                <p>Add a job application to get started.</p>
            </div>
        `;

        updateApplicationCount(0);

        return;
    }


    filteredApplications.forEach(application => {

        const card =
            document.createElement("div");

        card.className = "application-card";


        card.innerHTML = `

            <div>
                <h3>${escapeHtml(application.company)}</h3>

                <p>
                    ${escapeHtml(application.role)}
                </p>
            </div>


            <div>

                <strong>Status:</strong>

                <p>
                    ${escapeHtml(application.status)}
                </p>

            </div>


            <div>

                <strong>Applied:</strong>

                <p>
                    ${escapeHtml(application.applicationDate || "-")}
                </p>

            </div>


            <div>

                <strong>Interview:</strong>

                <p>
                    ${escapeHtml(application.interviewDate || "Not scheduled")}
                </p>

            </div>


            <div>

                <strong>Job Link:</strong>

                <p>

                    ${
                        application.jobLink
                        ? `
                            <a
                                href="${escapeAttribute(application.jobLink)}"
                                target="_blank"
                                rel="noopener noreferrer">
                                Open Job
                            </a>
                        `
                        : "Not provided"
                    }

                </p>

            </div>


            <div class="application-notes">

                <strong>Notes:</strong>

                <p>
                    ${escapeHtml(application.notes || "No notes")}
                </p>

            </div>


            <div class="application-actions">

                <button
                    type="button"
                    onclick="editApplication(${application.id})">
                    Edit
                </button>


                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteApplication(${application.id})">
                    Delete
                </button>

            </div>

        `;


        container.appendChild(card);

    });


    updateApplicationCount(filteredApplications.length);
}


// ===============================
// EDIT APPLICATION
// ===============================

function editApplication(id) {

    const application =
        applications.find(app => app.id === id);


    if (!application) {
        return;
    }


    editingId = id;


    document.getElementById("modalTitle").textContent =
        "Edit Job Application";


    document.getElementById("company").value =
        application.company || "";


    document.getElementById("role").value =
        application.role || "";


    document.getElementById("applicationDate").value =
        application.applicationDate || "";


    document.getElementById("interviewDate").value =
        application.interviewDate || "";


    document.getElementById("jobLink").value =
        application.jobLink || "";


    document.getElementById("status").value =
        application.status || "Applied";


    document.getElementById("notes").value =
        application.notes || "";


    jobModal.classList.remove("hidden");

}


// ===============================
// DELETE APPLICATION
// ===============================

async function deleteApplication(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this application?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error("Failed to delete application");
        }


        await loadApplications();


    } catch (error) {

        console.error("Error deleting application:", error);

        alert("Application delete nahi ho paayi.");
    }

}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    document.getElementById("totalCount").textContent =
        applications.length;


    document.getElementById("appliedCount").textContent =
        applications.filter(
            app => app.status === "Applied"
        ).length;


    document.getElementById("interviewCount").textContent =
        applications.filter(
            app => app.status === "Interview"
        ).length;


    document.getElementById("selectedCount").textContent =
        applications.filter(
            app => app.status === "Selected"
        ).length;


    document.getElementById("rejectedCount").textContent =
        applications.filter(
            app => app.status === "Rejected"
        ).length;

}


// ===============================
// APPLICATION COUNT
// ===============================

function updateApplicationCount(count) {

    const element =
        document.getElementById("applicationCount");


    element.textContent =
        `${count} Application${count === 1 ? "" : "s"}`;

}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener(
    "input",
    displayApplications
);


// ===============================
// FILTER
// ===============================

statusFilter.addEventListener(
    "change",
    displayApplications
);


// ===============================
// SECURITY HELPERS
// ===============================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replace(/"/g, "&quot;");
}


// ===============================
// INITIAL LOAD
// ===============================

loadApplications();