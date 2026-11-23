<?php
/**
 * Raising Dogs — envio do formulário de contacto por email.
 * Requer um servidor com PHP e a função mail() configurada (ou adapte para SMTP/PHPMailer).
 * Ativação: em assets/js/main.js, defina CONFIG.formEndpoint = 'api/contact.php'.
 */

const DESTINATARIO = 'renatoviegas18@gmail.com';
const REMETENTE    = 'no-reply@exemplo.pt';   // [endereço do próprio domínio, para evitar spam]

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['ok' => false]));
}

// Honeypot anti-spam
if (!empty($_POST['website'])) {
    exit(json_encode(['ok' => true]));
}

$limpar = fn($v) => trim(strip_tags($v ?? ''));
$nome     = $limpar($_POST['nome'] ?? '');
$email    = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$telefone = $limpar($_POST['telefone'] ?? '');
$servico  = $limpar($_POST['servico'] ?? '');
$mensagem = $limpar($_POST['mensagem'] ?? '');

$servicosValidos = ['Treino e Educação Canina', 'Banhos e Tosquias', 'Produtos / Pet Shop', 'Outros'];

if (mb_strlen($nome) < 2 || !$email || !in_array($servico, $servicosValidos, true) || mb_strlen($mensagem) < 10) {
    http_response_code(422);
    exit(json_encode(['ok' => false, 'erro' => 'Dados inválidos']));
}

$assunto = '=?UTF-8?B?' . base64_encode("Novo contacto pelo site — $servico") . '?=';
$corpo = "Nome: $nome\nEmail: $email\nTelefone: " . ($telefone ?: '—') . "\nServiço: $servico\n\nMensagem:\n$mensagem\n";
$cabecalhos = [
    'From' => 'Raising Dogs <' . REMETENTE . '>',
    'Reply-To' => $email,
    'Content-Type' => 'text/plain; charset=UTF-8',
];

$enviado = mail(DESTINATARIO, $assunto, $corpo, $cabecalhos);
http_response_code($enviado ? 200 : 500);
echo json_encode(['ok' => $enviado]);
