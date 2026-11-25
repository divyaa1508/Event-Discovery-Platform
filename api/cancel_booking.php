
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

if (!is_array($data) || empty($data["booking_id"])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Booking ID is required."
    ]);
    exit;
}

$booking_id = filter_var(
    $data["booking_id"],
    FILTER_VALIDATE_INT
);

if (!$booking_id || $booking_id < 1) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid booking ID."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "UPDATE bookings
         SET booking_status = 'Cancelled'
         WHERE booking_id = ?
         AND booking_status != 'Cancelled'"
    );

    $stmt->execute([$booking_id]);

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

        echo json_encode([
            "status" => "success",
            "message" => "Booking is already cancelled."
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Booking cancelled successfully."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unable to cancel booking."
    ]);
}
?>
