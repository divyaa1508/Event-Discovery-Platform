
const API_BASE = "api/";

// =====================================
// 1. LOAD EVENTS FROM DATABASE
// =====================================

async function loadEvents() {
    const eventGrid = document.getElementById("eventGrid");
    const eventSelect = document.getElementById("event_id");

    try {
        const response = await fetch(API_BASE + "get_events.php");
        const result = await response.json();

        console.log("Events Response:", result);

        if (!response.ok || result.status !== "success") {
            throw new Error(result.message || "Unable to load events.");
        }

        // Clear old dropdown options
        eventSelect.innerHTML = '<option value="">Select Event</option>';

        if (!result.events || result.events.length === 0) {
            eventSelect.innerHTML =
                '<option value="">No Events Available</option>';

            if (eventGrid) {
                eventGrid.textContent = "No events available.";
            }

            return;
        }

        // Add events to dropdown
        result.events.forEach(function (event) {
            const option = document.createElement("option");

            option.value = event.event_id;
            option.textContent = event.event_name;

            eventSelect.appendChild(option);
        });

        // Display events on homepage
        if (eventGrid) {
            eventGrid.innerHTML = "";

            result.events.forEach(function (event) {
                const card = document.createElement("div");
                card.className = "event-card";

                const title = document.createElement("h3");
                title.textContent = event.event_name;

                const category = document.createElement("p");
                category.textContent = "Category: " + event.category;

                const date = document.createElement("p");
                date.textContent = "Date: " + event.event_date;

                const location = document.createElement("p");
                location.textContent = "Location: " + event.location;

                const price = document.createElement("p");
                price.textContent = "Price: ₹" + event.price;

                card.appendChild(title);
                card.appendChild(category);
                card.appendChild(date);
                card.appendChild(location);
                card.appendChild(price);

                eventGrid.appendChild(card);
            });
        }

    } catch (error) {
        console.error("Events Loading Error:", error);

        eventSelect.innerHTML =
            '<option value="">Unable to load events</option>';

        if (eventGrid) {
            eventGrid.textContent = "Unable to load events.";
        }
    }
}


// =====================================
// 2. BOOKING FORM SUBMISSION
// =====================================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const message = document.getElementById("bookingMessage");
        const button = document.getElementById("bookingButton");

        const bookingData = {
            customer_name: document.getElementById("customer_name").value.trim(),
            email: document.getElementById("email").value.trim(),
            event_id: Number(document.getElementById("event_id").value),
            ticket_quantity: Number(
                document.getElementById("ticket_quantity").value
            )
        };

        // Validate booking details
        if (
            !bookingData.customer_name ||
            !bookingData.email ||
            !bookingData.event_id ||
            !Number.isInteger(bookingData.ticket_quantity) ||
            bookingData.ticket_quantity < 1 ||
            bookingData.ticket_quantity > 20
        ) {
            message.textContent = "Please enter valid booking details.";
            message.className = "message error";
            return;
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(bookingData.email)) {
            message.textContent = "Please enter a valid email address.";
            message.className = "message error";
            return;
        }

        button.disabled = true;
        button.textContent = "Submitting...";

        try {

            const response = await fetch(API_BASE + "add_booking.php", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Booking failed. Please try again."
                );
            }

            // Success message
            message.textContent =
                "Booking successful! Redirecting to Manage Bookings...";

            message.className = "message success";

            // Reset form
            bookingForm.reset();

            // Redirect to Manage Bookings
            setTimeout(function () {
                window.location.href = "bookings.html";
            }, 1000);

        } catch (error) {

            console.error("Booking Error:", error);

            message.textContent = error.message;
            message.className = "message error";

        } finally {

            button.disabled = false;
            button.textContent = "Submit Booking";

        }

    });

}


// =====================================
// 3. LOAD EVENTS WHEN PAGE IS READY
// =====================================

loadEvents();
