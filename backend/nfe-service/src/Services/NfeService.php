<?php

declare(strict_types=1);

namespace Movix\NfeService\Services;

use NFePHP\NFe\Make;
use NFePHP\NFe\Tools;
use NFePHP\NFe\Common\Standardize;
use NFePHP\Common\Certificate;
use Movix\NfeService\Config\NfeConfig;

class NfeService
{
    private ?Tools $tools = null;
    private NfeConfig $config;

    public function __construct()
    {
        $this->config = new NfeConfig();
    }

    /**
     * Inicializar ferramentas da NFe (lazy loading)
     */
    private function initializeTools(): void
    {
        if ($this->tools !== null) {
            return;
        }

        try {
            $configJson = $this->config->getConfigJson();

            // Verificar se o certificado existe
            $certPath = $this->config->getCertificatePath();
            if (!file_exists($certPath)) {
                throw new \Exception("Certificado não encontrado em: {$certPath}");
            }

            $certificate = Certificate::readPfx(
                file_get_contents($certPath),
                $this->config->getCertificatePassword()
            );

            $this->tools = new Tools($configJson, $certificate);
            $this->tools->model(55); // NFe modelo 55
        } catch (\Exception $e) {
            throw new \Exception("Erro ao inicializar ferramentas NFe: " . $e->getMessage());
        }
    }

    /**
     * Obter instância das ferramentas (com lazy loading)
     */
    private function getTools(): Tools
    {
        $this->initializeTools();
        return $this->tools;
    }

    /**
     * Gerar NFe
     */
    public function generate(array $data): array
    {
        try {
            $make = new Make();

            // Configurar identificação da NFe
            $this->buildIdentificacao($make, $data);

            // Configurar emitente
            $this->buildEmitente($make, $data);

            // Configurar destinatário
            $this->buildDestinatario($make, $data);

            // Configurar produtos/serviços
            $this->buildItens($make, $data);

            // Configurar totais
            $this->buildTotais($make, $data);

            // Configurar transporte
            $this->buildTransporte($make, $data);

            // Configurar pagamento
            $this->buildPagamento($make, $data);

            // Configurar informações adicionais
            $this->buildInformacoesAdicionais($make, $data);

            // Gerar XML
            $xml = $make->getXML();
            $chave = $make->getChave();

            return [
                'chave' => $chave,
                'xml' => $xml,
                'numero' => $data['identificacao']['numero'],
                'serie' => $data['identificacao']['serie']
            ];

        } catch (\Exception $e) {
            throw new \Exception("Erro ao gerar NFe: " . $e->getMessage());
        }
    }

    /**
     * Assinar NFe
     */
    public function sign(string $xml): array
    {
        try {
            $tools = $this->getTools();
            $xmlSigned = $tools->signNFe($xml);

            // Extrair chave do XML
            $dom = new \DOMDocument();
            $dom->loadXML($xmlSigned);
            $chave = $dom->getElementsByTagName('chNFe')->item(0)->nodeValue;

            return [
                'chave' => $chave,
                'xml_signed' => $xmlSigned,
                'status' => 'assinada'
            ];

        } catch (\Exception $e) {
            throw new \Exception("Erro ao assinar NFe: " . $e->getMessage());
        }
    }

    /**
     * Enviar NFe para SEFAZ
     */
    public function send(string $xml): array
    {
        try {
            $tools = $this->getTools();
            $response = $tools->sefazEnviaLote([$xml], 1);

            $standardize = new Standardize();
            $std = $standardize->toStd($response);

            if ($std->cStat == '103') {
                // Lote recebido com sucesso
                $recibo = $std->infRec->nRec;

                // Consultar resultado do processamento
                $consultaResponse = $tools->sefazConsultaRecibo($recibo);
                $consultaStd = $standardize->toStd($consultaResponse);

                return [
                    'status' => 'enviada',
                    'recibo' => $recibo,
                    'protocolo' => $consultaStd->protNFe->infProt->nProt ?? null,
                    'response' => $consultaStd
                ];
            }

            throw new \Exception("Erro no envio: " . $std->xMotivo);

        } catch (\Exception $e) {
            throw new \Exception("Erro ao enviar NFe: " . $e->getMessage());
        }
    }

    /**
     * Consultar status da NFe
     */
    public function getStatus(string $chave): array
    {
        try {
            $response = $this->tools->sefazConsultaChave($chave);
            
            $standardize = new Standardize();
            $std = $standardize->toStd($response);
            
            return [
                'chave' => $chave,
                'status' => $std->cStat,
                'motivo' => $std->xMotivo,
                'protocolo' => $std->protNFe->infProt->nProt ?? null,
                'data_autorizacao' => $std->protNFe->infProt->dhRecbto ?? null
            ];
            
        } catch (\Exception $e) {
            throw new \Exception("Erro ao consultar status: " . $e->getMessage());
        }
    }

    /**
     * Cancelar NFe
     */
    public function cancel(string $chave, string $justificativa): array
    {
        try {
            $response = $this->tools->sefazCancela($chave, $justificativa);
            
            $standardize = new Standardize();
            $std = $standardize->toStd($response);
            
            return [
                'chave' => $chave,
                'status' => $std->cStat,
                'motivo' => $std->xMotivo,
                'protocolo' => $std->infCanc->nProt ?? null
            ];
            
        } catch (\Exception $e) {
            throw new \Exception("Erro ao cancelar NFe: " . $e->getMessage());
        }
    }

    /**
     * Consultar NFe
     */
    public function consulta(string $chave): array
    {
        return $this->getStatus($chave);
    }

    /**
     * Inutilizar numeração
     */
    public function inutilizar(array $data): array
    {
        try {
            $response = $this->tools->sefazInutiliza(
                $data['serie'],
                $data['numero_inicial'],
                $data['numero_final'],
                $data['justificativa']
            );
            
            $standardize = new Standardize();
            $std = $standardize->toStd($response);
            
            return [
                'status' => $std->cStat,
                'motivo' => $std->xMotivo,
                'protocolo' => $std->infInut->nProt ?? null
            ];
            
        } catch (\Exception $e) {
            throw new \Exception("Erro ao inutilizar numeração: " . $e->getMessage());
        }
    }

    /**
     * Carta de correção
     */
    public function cartaCorrecao(string $chave, string $correcao): array
    {
        try {
            $response = $this->tools->sefazCCe($chave, $correcao);
            
            $standardize = new Standardize();
            $std = $standardize->toStd($response);
            
            return [
                'chave' => $chave,
                'status' => $std->cStat,
                'motivo' => $std->xMotivo,
                'protocolo' => $std->infEvento->nProt ?? null
            ];
            
        } catch (\Exception $e) {
            throw new \Exception("Erro ao enviar carta de correção: " . $e->getMessage());
        }
    }

    /**
     * Manifestação do destinatário
     */
    public function manifestacao(string $chave, string $tipo, string $justificativa = ''): array
    {
        try {
            $response = $this->tools->sefazManifesta($chave, $tipo, $justificativa);
            
            $standardize = new Standardize();
            $std = $standardize->toStd($response);
            
            return [
                'chave' => $chave,
                'status' => $std->cStat,
                'motivo' => $std->xMotivo,
                'protocolo' => $std->infEvento->nProt ?? null
            ];
            
        } catch (\Exception $e) {
            throw new \Exception("Erro ao enviar manifestação: " . $e->getMessage());
        }
    }



    /**
     * Validar dados da NFe
     */
    public function validate(array $data): array
    {
        $errors = [];

        // Validar dados obrigatórios
        if (!isset($data['identificacao'])) {
            $errors[] = 'Dados de identificação são obrigatórios';
        }

        if (!isset($data['destinatario'])) {
            $errors[] = 'Dados do destinatário são obrigatórios';
        }

        if (!isset($data['itens']) || empty($data['itens'])) {
            $errors[] = 'Pelo menos um item é obrigatório';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Verificar status do serviço (sem certificado)
     */
    public function checkServiceStatus(): array
    {
        return [
            'service' => 'NFe Microservice',
            'status' => 'online',
            'environment' => $this->config->isProducao() ? 'producao' : 'homologacao',
            'certificate_required' => true,
            'certificate_exists' => file_exists($this->config->getCertificatePath()),
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Verificar certificado digital e testar SEFAZ
     */
    public function checkSefazStatus(): array
    {
        try {
            // Verificar se extensão SOAP está disponível
            if (!extension_loaded('soap')) {
                return [
                    'sefaz_status' => 'error',
                    'sefaz_message' => 'Extensão SOAP não está instalada. Necessária para comunicação com SEFAZ.',
                    'environment' => $this->config->isProducao() ? 'producao' : 'homologacao',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'extensions_required' => ['soap', 'openssl', 'curl']
                ];
            }

            // Tentar carregar o certificado
            $certPath = $this->config->getCertificatePath();
            $certPassword = $this->config->getCertificatePassword();

            if (!file_exists($certPath)) {
                throw new \Exception("Certificado não encontrado: {$certPath}");
            }

            $certificate = Certificate::readPfx(
                file_get_contents($certPath),
                $certPassword
            );

            // Tentar conectar com SEFAZ
            try {
                $tools = $this->getTools();
                $response = $tools->sefazStatus();

                $standardize = new Standardize();
                $std = $standardize->toStd($response);

                return [
                    'sefaz_status' => 'connected',
                    'sefaz_message' => 'Conectado com SEFAZ com sucesso',
                    'environment' => $this->config->isProducao() ? 'producao' : 'homologacao',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'sefaz_response' => [
                        'status_code' => $std->cStat ?? 'unknown',
                        'status_message' => $std->xMotivo ?? 'Sem resposta',
                        'response_time' => $std->dhRecbto ?? null
                    ],
                    'certificate_info' => [
                        'loaded' => true,
                        'password_correct' => true,
                        'ready_for_use' => true
                    ]
                ];

            } catch (\Exception $sefazError) {
                // Certificado OK, mas erro na comunicação SEFAZ
                return [
                    'sefaz_status' => 'certificate_ok_sefaz_error',
                    'sefaz_message' => 'Certificado OK, mas erro na comunicação SEFAZ: ' . $sefazError->getMessage(),
                    'environment' => $this->config->isProducao() ? 'producao' : 'homologacao',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'certificate_info' => [
                        'loaded' => true,
                        'password_correct' => true,
                        'ready_for_use' => true
                    ]
                ];
            }

        } catch (\Exception $e) {
            return [
                'sefaz_status' => 'error',
                'sefaz_message' => $e->getMessage(),
                'environment' => $this->config->isProducao() ? 'producao' : 'homologacao',
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }

    /**
     * Verificar requisitos do sistema
     */
    public function testNfeGeneration(): array
    {
        try {
            // Verificar dados da emitente
            $emitente = $this->config->getEmitente();

            // Verificar se certificado existe
            $certExists = file_exists($this->config->getCertificatePath());

            // Verificar configuração básica
            $configOk = !empty($emitente['cnpj']) && !empty($emitente['razao_social']);

            // Verificar extensões PHP necessárias
            $requiredExtensions = ['soap', 'openssl', 'curl', 'dom', 'xml', 'zip', 'mbstring'];
            $extensionsStatus = [];
            $allExtensionsOk = true;

            foreach ($requiredExtensions as $ext) {
                $loaded = extension_loaded($ext);
                $extensionsStatus[$ext] = $loaded;
                if (!$loaded) {
                    $allExtensionsOk = false;
                }
            }

            // Verificar versão PHP
            $phpVersion = PHP_VERSION;
            $phpVersionOk = version_compare($phpVersion, '8.0.0', '>=');

            return [
                'test_status' => $allExtensionsOk && $configOk && $certExists ? 'success' : 'warning',
                'message' => 'Verificação de requisitos do sistema',
                'emitente_cnpj' => $emitente['cnpj'],
                'emitente_nome' => $emitente['razao_social'],
                'emitente_uf' => $emitente['endereco']['uf'],
                'certificado_existe' => $certExists,
                'configuracao_ok' => $configOk,
                'php_version' => $phpVersion,
                'php_version_ok' => $phpVersionOk,
                'extensions_status' => $extensionsStatus,
                'all_extensions_ok' => $allExtensionsOk,
                'missing_extensions' => array_keys(array_filter($extensionsStatus, function($status) { return !$status; })),
                'ambiente' => $this->config->isProducao() ? 'producao' : 'homologacao',
                'ready_for_production' => $allExtensionsOk && $configOk && $certExists && $phpVersionOk,
                'timestamp' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            return [
                'test_status' => 'error',
                'message' => 'Erro na verificação: ' . $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }

    /**
     * Construir NFe básica para teste
     */
    private function buildBasicNfe(Make $make, array $data): void
    {
        // Identificação
        $std = new \stdClass();
        $std->cUF = 52; // Goiás
        $std->cNF = str_pad((string)rand(1, 99999999), 8, '0', STR_PAD_LEFT);
        $std->natOp = $data['identificacao']['natureza_operacao'];
        $std->mod = 55;
        $std->serie = (int) $data['identificacao']['serie'];
        $std->nNF = (int) $data['identificacao']['numero'];
        $std->dhEmi = date('Y-m-d\TH:i:sP');
        $std->tpNF = (int) $data['identificacao']['tipo_operacao'];
        $std->idDest = 1;
        $std->cMunFG = 5208707; // Goiânia
        $std->tpImp = 1;
        $std->tpEmis = (int) $data['identificacao']['tipo_emissao'];
        $std->cDV = 0;
        $std->tpAmb = $this->config->getAmbiente();
        $std->finNFe = (int) $data['identificacao']['finalidade'];
        $std->indFinal = 1;
        $std->indPres = 1;
        $std->procEmi = 0;
        $std->verProc = '1.0.0';

        $make->tagide($std);

        // Emitente (dados da emitente)
        $emitente = $this->config->getEmitente();
        $emit = new \stdClass();
        $emit->CNPJ = $emitente['cnpj'];
        $emit->xNome = $emitente['razao_social'];
        $emit->xFant = $emitente['nome_fantasia'];
        $emit->IE = $emitente['inscricao_estadual'];
        $emit->CRT = $emitente['regime_tributario'];

        $make->tagemit($emit);

        // Endereço do emitente
        $enderEmit = new \stdClass();
        $enderEmit->xLgr = $emitente['endereco']['logradouro'];
        $enderEmit->nro = $emitente['endereco']['numero'];
        if (!empty($emitente['endereco']['complemento'])) {
            $enderEmit->xCpl = $emitente['endereco']['complemento'];
        }
        $enderEmit->xBairro = $emitente['endereco']['bairro'];
        $enderEmit->cMun = 5208707; // Goiânia
        $enderEmit->xMun = $emitente['endereco']['municipio'];
        $enderEmit->UF = $emitente['endereco']['uf'];
        $enderEmit->CEP = $emitente['endereco']['cep'];
        $enderEmit->cPais = 1058;
        $enderEmit->xPais = 'Brasil';

        $make->tagenderEmit($enderEmit);

        // Destinatário
        $dest = new \stdClass();
        $dest->CNPJ = $data['destinatario']['cnpj'];
        $dest->xNome = $data['destinatario']['razao_social'];
        $dest->indIEDest = 9;

        $make->tagdest($dest);

        // Endereço do destinatário
        $enderDest = new \stdClass();
        $enderDest->xLgr = $data['destinatario']['endereco']['logradouro'];
        $enderDest->nro = $data['destinatario']['endereco']['numero'];
        $enderDest->xBairro = $data['destinatario']['endereco']['bairro'];
        $enderDest->cMun = 5208707; // Goiânia (padrão para teste)
        $enderDest->xMun = $data['destinatario']['endereco']['municipio'];
        $enderDest->UF = $data['destinatario']['endereco']['uf'];
        $enderDest->CEP = $data['destinatario']['endereco']['cep'];
        $enderDest->cPais = 1058;
        $enderDest->xPais = 'Brasil';

        $make->tagenderDest($enderDest);

        // Produto
        $item = $data['itens'][0];
        $prod = new \stdClass();
        $prod->cProd = $item['codigo'];
        $prod->cEAN = 'SEM GTIN';
        $prod->xProd = $item['descricao'];
        $prod->NCM = $item['ncm'];
        $prod->CFOP = $item['cfop'];
        $prod->uCom = $item['unidade'];
        $prod->qCom = $item['quantidade'];
        $prod->vUnCom = $item['valor_unitario'];
        $prod->vProd = $item['valor_total'];
        $prod->cEANTrib = 'SEM GTIN';
        $prod->uTrib = $item['unidade'];
        $prod->qTrib = $item['quantidade'];
        $prod->vUnTrib = $item['valor_unitario'];
        $prod->indTot = 1;

        $make->tagprod($prod);

        // Impostos
        $imposto = new \stdClass();
        $imposto->item = 1;
        $make->tagimposto($imposto);

        // ICMS
        $icms = new \stdClass();
        $icms->item = 1;
        $icms->orig = 0;
        $icms->CST = '41';
        $make->tagICMS($icms);

        // PIS
        $pis = new \stdClass();
        $pis->item = 1;
        $pis->CST = '07';
        $make->tagPIS($pis);

        // COFINS
        $cofins = new \stdClass();
        $cofins->item = 1;
        $cofins->CST = '07';
        $make->tagCOFINS($cofins);

        // Totais
        $total = new \stdClass();
        $total->vBC = 0.00;
        $total->vICMS = 0.00;
        $total->vICMSDeson = 0.00;
        $total->vBCST = 0.00;
        $total->vST = 0.00;
        $total->vProd = $item['valor_total'];
        $total->vFrete = 0.00;
        $total->vSeg = 0.00;
        $total->vDesc = 0.00;
        $total->vII = 0.00;
        $total->vIPI = 0.00;
        $total->vPIS = 0.00;
        $total->vCOFINS = 0.00;
        $total->vOutro = 0.00;
        $total->vNF = $item['valor_total'];

        $make->tagICMSTot($total);

        // Transporte
        $transp = new \stdClass();
        $transp->modFrete = 9;
        $make->tagtransp($transp);

        // Pagamento
        $pag = new \stdClass();
        $pag->tPag = '01';
        $pag->vPag = $item['valor_total'];
        $make->tagpag($pag);

        // Informações adicionais
        $infAdic = new \stdClass();
        $infAdic->infCpl = 'NFe de teste gerada pelo microservico NFe';
        $make->taginfAdic($infAdic);
    }

    // Métodos privados para construção da NFe
    private function buildIdentificacao(Make $make, array $data): void
    {
        $nfe = $data['nfe'];
        $emitente = $data['emitente'];

        $ide = new \stdClass();
        $ide->cUF = $this->getCodigoUF($emitente['endereco']['uf']);
        $ide->cNF = str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
        $ide->natOp = $nfe['naturezaOperacao'];
        $ide->mod = 55; // NFe
        $ide->serie = $nfe['serie'];
        $ide->nNF = $nfe['numero'];
        $ide->dhEmi = date('c'); // Data/hora atual
        $ide->dhSaiEnt = isset($nfe['dataSaida']) ? $nfe['dataSaida'] : date('c');
        $ide->tpNF = $nfe['tipoOperacao']; // 0=Entrada, 1=Saída
        $ide->idDest = $this->getIndicadorDestino($emitente['endereco']['uf'], $data['cliente']['endereco']['uf']);
        $ide->cMunFG = $this->getCodigoMunicipio($emitente['endereco']['municipio'], $emitente['endereco']['uf']);
        $ide->tpImp = 1; // DANFE normal, Retrato
        $ide->tpEmis = 1; // Emissão normal
        $ide->cDV = 0; // Será calculado automaticamente
        $ide->tpAmb = $this->config->isProducao() ? 1 : 2; // 1=Produção, 2=Homologação
        $ide->finNFe = 1; // NFe normal
        $ide->indFinal = $nfe['consumidorFinal']; // 0=Não, 1=Sim
        $ide->indPres = $nfe['presencaComprador']; // 0=Não se aplica, 1=Presencial, etc
        $ide->procEmi = 0; // Emissão por aplicativo do contribuinte
        $ide->verProc = '1.0.0'; // Versão do aplicativo

        $make->tagide($ide);
    }

    private function buildEmitente(Make $make, array $data): void
    {
        $emitente = $data['emitente'];

        $emit = new \stdClass();
        $emit->CNPJ = $emitente['cnpj'];
        $emit->xNome = $emitente['razaoSocial'];
        $emit->xFant = $emitente['nomeFantasia'] ?? null;
        $emit->IE = $emitente['inscricaoEstadual'];
        $emit->CRT = 1; // Simples Nacional

        $make->tagemit($emit);

        // Endereço do emitente
        $enderEmit = new \stdClass();
        $enderEmit->xLgr = $emitente['endereco']['logradouro'];
        $enderEmit->nro = $emitente['endereco']['numero'];
        $enderEmit->xCpl = $emitente['endereco']['complemento'] ?? null;
        $enderEmit->xBairro = $emitente['endereco']['bairro'];
        $enderEmit->cMun = $this->getCodigoMunicipio($emitente['endereco']['municipio'], $emitente['endereco']['uf']);
        $enderEmit->xMun = $emitente['endereco']['municipio'];
        $enderEmit->UF = $emitente['endereco']['uf'];
        $enderEmit->CEP = $emitente['endereco']['cep'];
        $enderEmit->cPais = 1058; // Brasil
        $enderEmit->xPais = 'Brasil';

        $make->tagenderEmit($enderEmit);
    }

    private function buildDestinatario(Make $make, array $data): void
    {
        $cliente = $data['cliente'];

        $dest = new \stdClass();
        if ($cliente['tipo'] === 'JURIDICA') {
            $dest->CNPJ = $cliente['documento'];
        } else {
            $dest->CPF = $cliente['documento'];
        }
        $dest->xNome = $cliente['nome'];
        $dest->indIEDest = $cliente['indicadorIE']; // 1=Contribuinte, 2=Isento, 9=Não contribuinte
        if (isset($cliente['inscricaoEstadual']) && $cliente['indicadorIE'] == 1) {
            $dest->IE = $cliente['inscricaoEstadual'];
        }

        $make->tagdest($dest);

        // Endereço do destinatário
        $enderDest = new \stdClass();
        $enderDest->xLgr = $cliente['endereco']['logradouro'];
        $enderDest->nro = $cliente['endereco']['numero'];
        $enderDest->xCpl = $cliente['endereco']['complemento'] ?? null;
        $enderDest->xBairro = $cliente['endereco']['bairro'];
        $enderDest->cMun = $this->getCodigoMunicipio($cliente['endereco']['municipio'], $cliente['endereco']['uf']);
        $enderDest->xMun = $cliente['endereco']['municipio'];
        $enderDest->UF = $cliente['endereco']['uf'];
        $enderDest->CEP = $cliente['endereco']['cep'];
        $enderDest->cPais = 1058; // Brasil
        $enderDest->xPais = 'Brasil';

        $make->tagenderDest($enderDest);
    }

    private function buildItens(Make $make, array $data): void
    {
        // Implementação será adicionada
    }

    private function buildTotais(Make $make, array $data): void
    {
        // Implementação será adicionada
    }

    private function buildTransporte(Make $make, array $data): void
    {
        // Implementação será adicionada
    }

    private function buildPagamento(Make $make, array $data): void
    {
        // Implementação será adicionada
    }

    private function buildInformacoesAdicionais(Make $make, array $data): void
    {
        // Implementação será adicionada
    }
}
