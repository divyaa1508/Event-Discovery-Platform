const API_BASE = "api/";

const tableBody = document.getElementById("bookingTableBody");
const managementMessage = document.getElementById("managementMessage");

// Create table cell safely
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    return cell;
}

// Load all bookings or search results
async function loadBookings(search = "") {
    tableBody.innerHTML = `
        <tr><td colspan="8">Loading bookings...</td></tr>
    `;

    try {
        const url = API_BASE + "search_bookings.php?search=" +
            encodeURIComponent(search);

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error(result.message || "Unable to load bookings.");
        }

        tableBody.innerHTML = "";

        if (result.bookings.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="8">No bookings found.</td></tr>
            `;
            return;
        }

        result.bookings.forEach(booking => {
            const row = document.createElement("tr");

            row.appendChild(createCell(booking.booking_id));
            row.appendChild(createCell(booking.customer_name));
            row.appendChild(createCell(booking.email));
            row.appendChild(createCell(booking.event_name));
            row.appendChild(createCell(booking.ticket_quantity));
            row.appendChild(createCell(booking.booking_date));

            const statusCell = document.createElement("td");
            const status = document.createElement("span");
            status.className = "status " + booking.booking_status.toLowerCase();
            status.textContent = booking.booking_status;
            statusCell.appendChild(status);
            row.appendChild(statusCell);

            const actionCell = document.createElement("td");

            if (booking.booking_status === "Pending") {
                const confirmButton = document.createElement("button");
                confirmButton.textContent = "Confirm";
                confirmButton.className = "action-btn confirm-btn";
                confirmButton.addEventListener("click", () => {
                    updateBooking(booking.booking_id, "Confirmed");
                });

                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.className = "action-btn cancel-btn";
                cancelButton.addEventListener("click", () => {
                    cancelBooking(booking.booking_id);
                });

                actionCell.append(confirmButton, cancelButton);

            } else if (booking.booking_status === "Confirmed") {
                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.className = "action-btn cancel-btn";
                cancelButton.addEventListener("click", () => {
                    cancelBooking(booking.booking_id);
                });

                actionCell.appendChild(cancelButton);

            } else {
                actionCell.textContent = "No actions";
            }

            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = `
            <tr><td colspan="8">Unable to load bookings.</td></tr>
        `;
        managementMessage.textContent = error.message;
        managementMessage.className = "message error";
    }
}

// Update booking status
async function updateBooking(bookingId, status) {
    try {
        const response = await fetch(API_BASE + "update_booking.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                booking_id: bookingId,
                booking_status: status
            })
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error(result.message || "Update failed.");
        }

        managementMessage.textContent = result.message;
        managementMessage.className = "message success";
        await loadBookings(document.getElementById("searchInput").value.trim());

    } catch (error) {
        managementMessage.textContent = error.message;
        managementMessage.className = "message error";
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm("Are you sure you want to cancel this booking?")) {
        return;
    }

    try {
        const response = await fetch(API_BASE + "cancel_booking.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                booking_id: bookingId
            })
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error(result.message || "Cancellation failed.");
        }

        managementMessage.textContent = result.message;
        managementMessage.className = "message success";
        await loadBookings(document.getElementById("searchInput").value.trim());

    } catch (error) {
        managementMessage.textContent = error.message;
        managementMessage.className = "message error";
    }
}

// Search button
document.getElementById("searchButton").addEventListener("click", () => {
    loadBookings(document.getElementById("searchInput").value.trim());
});

// Search when Enter is pressed
document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        loadBookings(event.target.value.trim());
    }
});

// Show all bookings
document.getElementById("showAllButton").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    managementMessage.textContent = "";
    loadBookings();
});

loadBookings();