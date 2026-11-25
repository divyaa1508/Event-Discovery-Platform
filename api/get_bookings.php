
<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";

try {

    $sql = "SELECT
                b.booking_id,
                b.customer_name,
                b.email,
                b.event_id,
                e.event_name,
                b.ticket_quantity,
                b.booking_status,
                b.booking_date
            FROM bookings b
            INNER JOIN events e
            ON b.event_id = e.event_id
            ORDER BY b.booking_id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $bookings = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "total_bookings" => count($bookings),
        "bookings" => $bookings
    ]);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unable to fetch bookings."
    ]);

}

?>
