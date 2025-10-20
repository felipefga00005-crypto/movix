<?php

declare(strict_types=1);

namespace Movix\NfeService\Router;

use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface;
use Movix\NfeService\Controllers\NfeController;

class NfeRouter
{
    private NfeController $nfeController;

    public function __construct()
    {
        $this->nfeController = new NfeController();
    }

    /**
     * Registrar todas as rotas da NFe
     */
    public function register(App $app): void
    {
        // Grupo de rotas da API NFe
        $app->group('/api/v1/nfe', function ($group) {
            $this->registerNfeRoutes($group);
        });

        // Rotas de configuração e utilitários
        $this->registerConfigRoutes($app);
    }

    /**
     * Registrar rotas específicas da NFe
     */
    private function registerNfeRoutes(RouteCollectorProxyInterface $group): void
    {
        // === OPERAÇÕES PRINCIPAIS ===

        // Gerar NFe
        $group->post('/generate', [$this->nfeController, 'generate']);

        // Assinar NFe
        $group->post('/sign', [$this->nfeController, 'sign']);

        // Enviar NFe para SEFAZ
        $group->post('/send', [$this->nfeController, 'send']);

        // === CONSULTAS ===

        // Consultar status da NFe por chave
        $group->get('/status/{chave}', [$this->nfeController, 'getStatus']);

        // Consultar NFe por chave
        $group->get('/consulta/{chave}', [$this->nfeController, 'consulta']);

        // === EVENTOS ===
        
        // Cancelar NFe
        $group->post('/cancel', [$this->nfeController, 'cancel']);
        
        // Carta de correção eletrônica
        $group->post('/cce', [$this->nfeController, 'cartaCorrecao']);
        
        // Inutilizar numeração
        $group->post('/inutilizar', [$this->nfeController, 'inutilizar']);

        // === MANIFESTAÇÃO DO DESTINATÁRIO ===

        // Manifestação do destinatário
        $group->post('/manifestacao', [$this->nfeController, 'manifestacao']);

        // === VALIDAÇÕES ===

        // Validar dados antes de gerar NFe
        $group->post('/validate', [$this->nfeController, 'validate']);
    }

    /**
     * Registrar rotas de configuração
     */
    private function registerConfigRoutes(App $app): void
    {
        // Verificar status do serviço (sem certificado)
        $app->get('/api/v1/status', [$this->nfeController, 'checkServiceStatus']);

        // Testar status da SEFAZ
        $app->get('/api/v1/test/sefaz-status', [$this->nfeController, 'checkSefazStatus']);

        // Testar geração de NFe
        $app->get('/api/v1/test/nfe-generation', [$this->nfeController, 'testNfeGeneration']);
    }
}
