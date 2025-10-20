<?php

declare(strict_types=1);

use Slim\Factory\AppFactory;
use Slim\Middleware\ErrorMiddleware;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Dotenv\Dotenv;
use Movix\NfeService\Router\NfeRouter;
use Movix\NfeService\Router\MiddlewareRouter;

require __DIR__ . '/../vendor/autoload.php';

// Carregar variáveis de ambiente
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Criar aplicação Slim
$app = AppFactory::create();

// Adicionar middleware de parsing do body
$app->addBodyParsingMiddleware();

// Adicionar middleware de roteamento
$app->addRoutingMiddleware();

// Adicionar middleware de tratamento de erros
$errorMiddleware = $app->addErrorMiddleware(
    $_ENV['APP_DEBUG'] === 'true',
    true,
    true
);

// Registrar middlewares customizados
$middlewareRouter = new MiddlewareRouter();
$middlewareRouter->register($app);

// Rota de health check
$app->get('/health', function (Request $request, Response $response) {
    $data = [
        'status' => 'ok',
        'service' => 'NFe Microservice',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'environment' => $_ENV['APP_ENV'] ?? 'production',
        'nfe_ambiente' => $_ENV['NFE_AMBIENTE'] === '1' ? 'producao' : 'homologacao'
    ];

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

// Registrar rotas da NFe
$nfeRouter = new NfeRouter();
$nfeRouter->register($app);

// Executar aplicação
$app->run();
