<?php

declare(strict_types=1);

namespace Movix\NfeService\Config;

class NfeConfig
{
    private array $config;

    public function __construct()
    {
        $this->loadConfig();
    }

    /**
     * Carregar configurações
     */
    private function loadConfig(): void
    {
        $this->config = [
            'atualizacao' => date('Y-m-d H:i:s'),
            'tpAmb' => (int) ($_ENV['NFE_AMBIENTE'] ?? 2),
            'razaosocial' => $_ENV['EMPRESA_RAZAO_SOCIAL'] ?? '',
            'siglaUF' => $_ENV['EMPRESA_UF'] ?? 'SP',
            'cnpj' => $_ENV['EMPRESA_CNPJ'] ?? '',
            'schemes' => 'PL_009_V4',
            'versao' => '4.00',
            'tokenIBPT' => '',
            'CSC' => '',
            'CSCid' => '',
            'proxyConf' => [
                'proxyIp' => '',
                'proxyPort' => '',
                'proxyUser' => '',
                'proxyPass' => ''
            ]
        ];
    }

    /**
     * Obter configuração como JSON
     */
    public function getConfigJson(): string
    {
        return json_encode($this->config);
    }

    /**
     * Obter caminho do certificado
     */
    public function getCertificatePath(): string
    {
        return $_ENV['CERT_PATH'] ?? '/var/www/html/certificates/certificado.pfx';
    }

    /**
     * Obter senha do certificado
     */
    public function getCertificatePassword(): string
    {
        return $_ENV['CERT_PASSWORD'] ?? '';
    }

    /**
     * Obter ambiente (1=Produção, 2=Homologação)
     */
    public function getAmbiente(): int
    {
        return (int) ($_ENV['NFE_AMBIENTE'] ?? 2);
    }

    /**
     * Obter dados da emitente
     */
    public function getEmitente(): array
    {
        return [
            'cnpj' => $_ENV['EMPRESA_CNPJ'] ?? '',
            'razao_social' => $_ENV['EMPRESA_RAZAO_SOCIAL'] ?? '',
            'nome_fantasia' => $_ENV['EMPRESA_NOME_FANTASIA'] ?? '',
            'inscricao_estadual' => $_ENV['EMPRESA_INSCRICAO_ESTADUAL'] ?? '',
            'inscricao_municipal' => $_ENV['EMPRESA_INSCRICAO_MUNICIPAL'] ?? '',
            'cnae' => $_ENV['EMPRESA_CNAE'] ?? '',
            'regime_tributario' => (int) ($_ENV['EMPRESA_REGIME_TRIBUTARIO'] ?? 1),
            'endereco' => [
                'logradouro' => $_ENV['EMPRESA_LOGRADOURO'] ?? '',
                'numero' => $_ENV['EMPRESA_NUMERO'] ?? '',
                'complemento' => $_ENV['EMPRESA_COMPLEMENTO'] ?? '',
                'bairro' => $_ENV['EMPRESA_BAIRRO'] ?? '',
                'cep' => $_ENV['EMPRESA_CEP'] ?? '',
                'municipio' => $_ENV['EMPRESA_MUNICIPIO'] ?? '',
                'uf' => $_ENV['EMPRESA_UF'] ?? '',
                'telefone' => $_ENV['EMPRESA_TELEFONE'] ?? '',
                'email' => $_ENV['EMPRESA_EMAIL'] ?? ''
            ]
        ];
    }

    /**
     * Verificar se está em produção
     */
    public function isProducao(): bool
    {
        return $this->getAmbiente() === 1;
    }

    /**
     * Obter configuração específica
     */
    public function get(string $key, $default = null)
    {
        return $this->config[$key] ?? $default;
    }

    /**
     * Definir configuração
     */
    public function set(string $key, $value): void
    {
        $this->config[$key] = $value;
    }
}
