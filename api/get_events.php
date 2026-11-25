<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";

try {
    $stmt = $pdo->query("SELECT * FROM events ORDER BY event_id DESC");
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "total_events" => count($events),
        "events" => $events
    ]);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}