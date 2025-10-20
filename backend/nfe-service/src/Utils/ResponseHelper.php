<?php

declare(strict_types=1);

namespace Movix\NfeService\Utils;

use Psr\Http\Message\ResponseInterface as Response;

class ResponseHelper
{
    /**
     * Resposta de sucesso
     */
    public static function success(Response $response, $data = null, string $message = 'Success', int $statusCode = 200): Response
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }

    /**
     * Resposta de erro
     */
    public static function error(Response $response, string $message = 'Error', int $statusCode = 400, $errors = null): Response
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }

    /**
     * Resposta de validação
     */
    public static function validation(Response $response, array $errors, string $message = 'Validation failed'): Response
    {
        return self::error($response, $message, 422, $errors);
    }
}
