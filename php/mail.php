<?php
header('Content-Type: application/json; charset=utf-8');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешён']);
    exit;
}

// Rate limiting (simple session-based)
session_start();
$now = time();
$cooldown = 30; // seconds between submissions

if (isset($_SESSION['last_submit']) && ($now - $_SESSION['last_submit']) < $cooldown) {
    echo json_encode(['success' => false, 'message' => 'Пожалуйста, подождите перед повторной отправкой']);
    exit;
}

// Get and sanitize inputs
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$topic = isset($_POST['topic']) ? trim(strip_tags($_POST['topic'])) : '';

// Validate
$errors = [];

if (empty($name) || mb_strlen($name) < 2) {
    $errors[] = 'Некорректное имя';
}

// Clean phone for validation
$phoneClean = preg_replace('/\D/', '', $phone);
if (strlen($phoneClean) < 11) {
    $errors[] = 'Некорректный номер телефона';
}

$validTopics = ['purchase', 'rent', 'partnership', 'other'];
if (!in_array($topic, $validTopics)) {
    $errors[] = 'Некорректная тема обращения';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

// Map topic to readable name
$topicNames = [
    'purchase' => 'Покупка',
    'rent' => 'Аренда',
    'partnership' => 'Сотрудничество',
    'other' => 'Другое'
];
$topicName = isset($topicNames[$topic]) ? $topicNames[$topic] : $topic;

// Prepare email
$to = 'Slyusarev_89@list.ru';
$subject = 'Заявка с сайта АРЛО — ' . $topicName;

$body = "Новая заявка с сайта arlo-robot.ru\n";
$body .= "================================\n\n";
$body .= "Имя: " . $name . "\n";
$body .= "Телефон: " . $phone . "\n";
$body .= "Тема: " . $topicName . "\n";
$body .= "Дата: " . date('d.m.Y H:i:s') . "\n";
$body .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

$headers = "From: noreply@arlo-robot.ru\r\n";
$headers .= "Reply-To: noreply@arlo-robot.ru\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
$sent = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

if ($sent) {
    $_SESSION['last_submit'] = $now;
    echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка отправки. Пожалуйста, свяжитесь по телефону.']);
}
