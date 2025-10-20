<?php

declare(strict_types=1);

namespace Movix\NfeService\Router;

use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class MiddlewareRouter
{
    /**
     * Registrar todos os middlewares
     */
    public function register(App $app): void
    {
        // Middleware de CORS
        $app->add($this->corsMiddleware());
        
        // Middleware de autenticação (opcional)
        $app->add($this->authMiddleware());
        
        // Middleware de rate limiting
        $app->add($this->rateLimitMiddleware());
        
        // Middleware de logging
        $app->add($this->loggingMiddleware());
        
        // Middleware de validação de content-type
        $app->add($this->contentTypeMiddleware());
    }

    /**
     * Middleware de CORS
     */
    private function corsMiddleware(): callable
    {
        return function (Request $request, RequestHandler $handler): Response {
            $response = $handler->handle($request);
            
            return $response
                ->withHeader('Access-Control-Allow-Origin', '*')
                ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, X-API-Key')
                ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->withHeader('Access-Control-Max-Age', '3600');
        };
    }

    /**
     * Middleware de autenticação (opcional)
     */
    private function authMiddleware(): callable
    {
        return function (Request $request, RequestHandler $handler): Response {
            // Pular autenticação para health check e OPTIONS
            $path = $request->getUri()->getPath();
            $method = $request->getMethod();
            
            if ($path === '/health' || $method === 'OPTIONS') {
                return $handler->handle($request);
            }

            // Verificar API Key (opcional)
            $apiKey = $request->getHeaderLine('X-API-Key');
            $expectedApiKey = $_ENV['API_KEY'] ?? null;
            
            if ($expectedApiKey && $apiKey !== $expectedApiKey) {
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'API Key inválida ou não fornecida',
                    'timestamp' => date('Y-m-d H:i:s')
                ]));
                
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(401);
            }
            
            return $handler->handle($request);
        };
    }

    /**
     * Middleware de rate limiting
     */
    private function rateLimitMiddleware(): callable
    {
        return function (Request $request, RequestHandler $handler): Response {
            // Implementação básica de rate limiting
            $clientIp = $this->getClientIp($request);
            $cacheKey = "rate_limit_{$clientIp}";
            
            // Por simplicidade, usando arquivo para cache
            $cacheFile = sys_get_temp_dir() . "/{$cacheKey}";
            $maxRequests = (int) ($_ENV['RATE_LIMIT_MAX'] ?? 100);
            $timeWindow = (int) ($_ENV['RATE_LIMIT_WINDOW'] ?? 3600); // 1 hora
            
            $currentTime = time();
            $requests = [];
            
            if (file_exists($cacheFile)) {
                $data = json_decode(file_get_contents($cacheFile), true);
                $requests = $data['requests'] ?? [];
            }
            
            // Remover requests antigos
            $requests = array_filter($requests, function($timestamp) use ($currentTime, $timeWindow) {
                return ($currentTime - $timestamp) < $timeWindow;
            });
            
            // Verificar limite
            if (count($requests) >= $maxRequests) {
                $response = new \Slim\Psr7\Response();
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'Rate limit excedido. Tente novamente mais tarde.',
                    'timestamp' => date('Y-m-d H:i:s')
                ]));
                
                return $response
                    ->withHeader('Content-Type', 'application/json')
                    ->withStatus(429);
            }
            
            // Adicionar request atual
            $requests[] = $currentTime;
            file_put_contents($cacheFile, json_encode(['requests' => $requests]));
            
            return $handler->handle($request);
        };
    }

    /**
     * Middleware de logging
     */
    private function loggingMiddleware(): callable
    {
        return function (Request $request, RequestHandler $handler): Response {
            $startTime = microtime(true);
            
            // Log da requisição
            $logData = [
                'timestamp' => date('Y-m-d H:i:s'),
                'method' => $request->getMethod(),
                'uri' => (string) $request->getUri(),
                'ip' => $this->getClientIp($request),
                'user_agent' => $request->getHeaderLine('User-Agent')
            ];
            
            $response = $handler->handle($request);
            
            // Log da resposta
            $endTime = microtime(true);
            $logData['status_code'] = $response->getStatusCode();
            $logData['response_time'] = round(($endTime - $startTime) * 1000, 2) . 'ms';
            
            // Salvar log
            $logFile = ($_ENV['LOG_PATH'] ?? '/var/www/html/logs') . '/access.log';
            file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND | LOCK_EX);
            
            return $response;
        };
    }

    /**
     * Middleware de validação de content-type
     */
    private function contentTypeMiddleware(): callable
    {
        return function (Request $request, RequestHandler $handler): Response {
            $method = $request->getMethod();
            $contentType = $request->getHeaderLine('Content-Type');
            
            // Validar content-type para POST/PUT/PATCH
            if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
                if (!str_contains($contentType, 'application/json')) {
                    $response = new \Slim\Psr7\Response();
                    $response->getBody()->write(json_encode([
                        'success' => false,
                        'message' => 'Content-Type deve ser application/json',
                        'timestamp' => date('Y-m-d H:i:s')
                    ]));
                    
                    return $response
                        ->withHeader('Content-Type', 'application/json')
                        ->withStatus(400);
                }
            }
            
            return $handler->handle($request);
        };
    }

    /**
     * Obter IP do cliente
     */
    private function getClientIp(Request $request): string
    {
        $serverParams = $request->getServerParams();
        
        if (!empty($serverParams['HTTP_X_FORWARDED_FOR'])) {
            return explode(',', $serverParams['HTTP_X_FORWARDED_FOR'])[0];
        }
        
        if (!empty($serverParams['HTTP_X_REAL_IP'])) {
            return $serverParams['HTTP_X_REAL_IP'];
        }
        
        return $serverParams['REMOTE_ADDR'] ?? 'unknown';
    }
}
