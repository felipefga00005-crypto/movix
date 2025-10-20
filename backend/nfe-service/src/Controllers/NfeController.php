<?php

declare(strict_types=1);

namespace Movix\NfeService\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Movix\NfeService\Services\NfeService;
use Movix\NfeService\Utils\ResponseHelper;

class NfeController
{
    private NfeService $nfeService;

    public function __construct()
    {
        $this->nfeService = new NfeService();
    }

    /**
     * Gerar NFe
     */
    public function generate(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (!$data) {
                return ResponseHelper::error($response, 'Dados não fornecidos', 400);
            }

            $result = $this->nfeService->generate($data);
            
            return ResponseHelper::success($response, $result, 'NFe gerada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Assinar NFe
     */
    public function sign(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (!isset($data['xml'])) {
                return ResponseHelper::error($response, 'XML da NFe não fornecido', 400);
            }

            $result = $this->nfeService->sign($data['xml']);
            
            return ResponseHelper::success($response, $result, 'NFe assinada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Enviar NFe para SEFAZ
     */
    public function send(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (!isset($data['xml'])) {
                return ResponseHelper::error($response, 'XML da NFe não fornecido', 400);
            }

            $result = $this->nfeService->send($data['xml']);
            
            return ResponseHelper::success($response, $result, 'NFe enviada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Consultar status da NFe
     */
    public function getStatus(Request $request, Response $response, array $args): Response
    {
        try {
            $chave = $args['chave'] ?? '';
            
            if (empty($chave)) {
                return ResponseHelper::error($response, 'Chave da NFe não fornecida', 400);
            }

            $result = $this->nfeService->getStatus($chave);
            
            return ResponseHelper::success($response, $result);
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Cancelar NFe
     */
    public function cancel(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (!isset($data['chave']) || !isset($data['justificativa'])) {
                return ResponseHelper::error($response, 'Chave e justificativa são obrigatórias', 400);
            }

            $result = $this->nfeService->cancel($data['chave'], $data['justificativa']);
            
            return ResponseHelper::success($response, $result, 'NFe cancelada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Consultar NFe
     */
    public function consulta(Request $request, Response $response, array $args): Response
    {
        try {
            $chave = $args['chave'] ?? '';
            
            if (empty($chave)) {
                return ResponseHelper::error($response, 'Chave da NFe não fornecida', 400);
            }

            $result = $this->nfeService->consulta($chave);
            
            return ResponseHelper::success($response, $result);
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Inutilizar numeração
     */
    public function inutilizar(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            $required = ['serie', 'numero_inicial', 'numero_final', 'justificativa'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    return ResponseHelper::error($response, "Campo {$field} é obrigatório", 400);
                }
            }

            $result = $this->nfeService->inutilizar($data);
            
            return ResponseHelper::success($response, $result, 'Numeração inutilizada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Carta de correção
     */
    public function cartaCorrecao(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (!isset($data['chave']) || !isset($data['correcao'])) {
                return ResponseHelper::error($response, 'Chave e correção são obrigatórias', 400);
            }

            $result = $this->nfeService->cartaCorrecao($data['chave'], $data['correcao']);
            
            return ResponseHelper::success($response, $result, 'Carta de correção enviada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Manifestação do destinatário
     */
    public function manifestacao(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            if (!isset($data['chave']) || !isset($data['tipo'])) {
                return ResponseHelper::error($response, 'Chave e tipo de manifestação são obrigatórios', 400);
            }

            $result = $this->nfeService->manifestacao($data['chave'], $data['tipo'], $data['justificativa'] ?? '');
            
            return ResponseHelper::success($response, $result, 'Manifestação enviada com sucesso');
            
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }



    /**
     * Validar dados da NFe
     */
    public function validate(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            if (!$data) {
                return ResponseHelper::error($response, 'Dados não fornecidos', 400);
            }

            $result = $this->nfeService->validate($data);

            return ResponseHelper::success($response, $result, 'Dados validados com sucesso');

        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Verificar status do serviço
     */
    public function checkServiceStatus(Request $request, Response $response): Response
    {
        try {
            $result = $this->nfeService->checkServiceStatus();
            return ResponseHelper::success($response, $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Verificar status do serviço SEFAZ
     */
    public function checkSefazStatus(Request $request, Response $response): Response
    {
        try {
            $result = $this->nfeService->checkSefazStatus();
            return ResponseHelper::success($response, $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }

    /**
     * Testar geração de NFe
     */
    public function testNfeGeneration(Request $request, Response $response): Response
    {
        try {
            $result = $this->nfeService->testNfeGeneration();
            return ResponseHelper::success($response, $result);
        } catch (\Exception $e) {
            return ResponseHelper::error($response, $e->getMessage(), 500);
        }
    }
}
