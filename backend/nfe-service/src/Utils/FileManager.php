<?php

declare(strict_types=1);

namespace Movix\NfeService\Utils;

/**
 * Utilitário para validação e formatação de arquivos NFe
 *
 * NOTA: O storage de arquivos agora é gerenciado pelo NestJS.
 * Esta classe serve apenas para utilitários de validação e formatação.
 */
class FileManager
{
    public function __construct()
    {
        // Não gerencia mais storage - responsabilidade do NestJS
    }

    /**
     * Validar chave de acesso da NFe
     */
    public function validateChave(string $chave): bool
    {
        // Chave deve ter 44 dígitos
        if (strlen($chave) !== 44) {
            return false;
        }

        // Deve conter apenas números
        if (!ctype_digit($chave)) {
            return false;
        }

        return true;
    }

    /**
     * Validar XML da NFe
     */
    public function validateXml(string $xml): bool
    {
        // Verificar se é um XML válido
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $isValid = $dom->loadXML($xml);
        libxml_clear_errors();

        if (!$isValid) {
            return false;
        }

        // Verificar se contém elementos básicos da NFe
        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('nfe', 'http://www.portalfiscal.inf.br/nfe');

        $infNFe = $xpath->query('//nfe:infNFe');
        return $infNFe->length > 0;
    }

    /**
     * Extrair chave do XML
     */
    public function extractChaveFromXml(string $xml): ?string
    {
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);

        if (!$dom->loadXML($xml)) {
            libxml_clear_errors();
            return null;
        }

        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('nfe', 'http://www.portalfiscal.inf.br/nfe');

        $chaveNodes = $xpath->query('//nfe:chNFe');
        if ($chaveNodes->length > 0) {
            return $chaveNodes->item(0)->nodeValue;
        }

        // Tentar extrair do atributo Id
        $infNFeNodes = $xpath->query('//nfe:infNFe/@Id');
        if ($infNFeNodes->length > 0) {
            $id = $infNFeNodes->item(0)->nodeValue;
            return substr($id, 3); // Remove "NFe" do início
        }

        return null;
    }

    /**
     * Formatar nome do arquivo XML
     */
    public function formatXmlFilename(string $chave): string
    {
        return $chave . '.xml';
    }

    /**
     * Formatar nome do arquivo PDF
     */
    public function formatPdfFilename(string $chave): string
    {
        return $chave . '.pdf';
    }

    /**
     * Validar tipo de XML
     */
    public function validateXmlType(string $type): bool
    {
        $validTypes = ['generated', 'signed', 'sent', 'authorized', 'cancelled'];
        return in_array($type, $validTypes);
    }

    /**
     * Limpar XML (remover caracteres inválidos)
     */
    public function sanitizeXml(string $xml): string
    {
        // Remove caracteres de controle inválidos
        $xml = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $xml);

        // Normaliza quebras de linha
        $xml = str_replace(["\r\n", "\r"], "\n", $xml);

        return trim($xml);
    }

    /**
     * Verificar se XML está bem formado
     */
    public function isWellFormedXml(string $xml): bool
    {
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $result = $dom->loadXML($xml);
        libxml_clear_errors();

        return $result !== false;
    }
}
