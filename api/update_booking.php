
<?php

header("Content-Type: application/json");
require_once __DIR__ . "/../config/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Only POST method is allowed."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (
    !is_array($data) ||
    !isset($data["booking_id"], $data["booking_status"])
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Booking ID and status are required."
    ]);
    exit;
}

$booking_id = filter_var($data["booking_id"], FILTER_VALIDATE_INT);
$status = $data["booking_status"];

if (
    !$booking_id ||
    !in_array($status, ["Pending", "Confirmed", "Cancelled"], true)
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid booking details."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "UPDATE bookings
         SET booking_status = ?
         WHERE booking_id = ?"
    );

    $stmt->execute([$status, $booking_id]);

    if ($stmt->rowCount() === 0) {
        $check = $pdo->prepare(
            "SELECT booking_id, booking_status
             FROM bookings WHERE booking_id = ?"
        );
        $check->execute([$booking_id]);
        $booking = $check->fetch();

        if (!$booking) {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Booking not found."
            ]);
            exit;
        }

        if ($booking["booking_status"] !== $status) {
            throw new Exception("Unable to update booking.");
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Booking status updated successfully."
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unable to update booking status."
    ]);
}
?>
