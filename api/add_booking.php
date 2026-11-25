
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
    empty($data["customer_name"]) ||
    empty($data["email"]) ||
    empty($data["event_id"]) ||
    empty($data["ticket_quantity"])
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Please fill all required fields."
    ]);
    exit;
}

$name = trim($data["customer_name"]);
$email = trim($data["email"]);
$event_id = filter_var($data["event_id"], FILTER_VALIDATE_INT);
$quantity = filter_var($data["ticket_quantity"], FILTER_VALIDATE_INT);

if (
    $name === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !$event_id ||
    !$quantity ||
    $event_id < 1 ||
    $quantity < 1 ||
    $quantity > 20
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid booking details."
    ]);
    exit;
}

try {

    $check = $pdo->prepare(
        "SELECT event_id FROM events WHERE event_id = ?"
    );
    $check->execute([$event_id]);

    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Event not found."
        ]);
        exit;
    }

    $sql = "INSERT INTO bookings
            (customer_name, email, event_id, ticket_quantity)
            VALUES (?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        $name,
        $email,
        $event_id,
        $quantity
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Booking submitted successfully!",
        "booking_id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unable to save booking."
    ]);

}

?>
