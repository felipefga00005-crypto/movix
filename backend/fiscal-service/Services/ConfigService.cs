using FiscalService.Models;

namespace FiscalService.Services;

public interface IConfigService
{
    ConfiguracaoFiscal GetConfiguracaoFiscal();
    void SetConfiguracaoFiscal(ConfiguracaoFiscal config);
    int GetAmbiente();
    string GetUF();
    string GetPastaXMLEnviados();
    string GetPastaXMLRetornos();
    bool SalvarXML();
    int GetTimeoutWebService();
    bool ValidarSchema();
    void CriarDiretoriosSeNecessario();
    string GetURLWebService(string uf, TipoDocumento tipoDocumento, int ambiente);
}

public class ConfigService : IConfigService
{
    private readonly ILogger<ConfigService> _logger;
    private ConfiguracaoFiscal _configuracao;

    public ConfigService(ILogger<ConfigService> logger)
    {
        _logger = logger;
        _configuracao = new ConfiguracaoFiscal();
        CriarDiretoriosSeNecessario();
    }

    public ConfiguracaoFiscal GetConfiguracaoFiscal()
    {
        return _configuracao;
    }

    public void SetConfiguracaoFiscal(ConfiguracaoFiscal config)
    {
        _configuracao = config;
        CriarDiretoriosSeNecessario();
        _logger.LogInformation("Configuração fiscal atualizada. Ambiente: {Ambiente}, UF: {UF}", config.Ambiente, config.UF);
    }

    public int GetAmbiente()
    {
        return _configuracao.Ambiente;
    }

    public string GetUF()
    {
        return _configuracao.UF;
    }

    public string GetPastaXMLEnviados()
    {
        return _configuracao.PastaXMLEnviados;
    }

    public string GetPastaXMLRetornos()
    {
        return _configuracao.PastaXMLRetornos;
    }

    public bool SalvarXML()
    {
        return _configuracao.SalvarXML;
    }

    public int GetTimeoutWebService()
    {
        return _configuracao.TimeoutWebService;
    }

    public bool ValidarSchema()
    {
        return _configuracao.ValidarSchema;
    }

    public void CriarDiretoriosSeNecessario()
    {
        try
        {
            var diretorios = new[]
            {
                _configuracao.PastaXMLEnviados,
                _configuracao.PastaXMLRetornos,
                "Certificates",
                "Logs"
            };

            foreach (var diretorio in diretorios)
            {
                if (!Directory.Exists(diretorio))
                {
                    Directory.CreateDirectory(diretorio);
                    _logger.LogInformation("Diretório criado: {Diretorio}", diretorio);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar diretórios necessários");
        }
    }

    public string GetURLWebService(string uf, TipoDocumento tipoDocumento, int ambiente)
    {
        // URLs dos webservices SEFAZ por UF
        // Esta é uma implementação simplificada - em produção deveria vir de um arquivo de configuração
        var urls = new Dictionary<string, Dictionary<string, Dictionary<int, string>>>
        {
            ["SP"] = new()
            {
                ["NFe"] = new()
                {
                    [1] = "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx", // Produção
                    [2] = "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx" // Homologação
                },
                ["NFCe"] = new()
                {
                    [1] = "https://nfce.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx", // Produção
                    [2] = "https://homologacao.nfce.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx" // Homologação
                }
            },
            ["RJ"] = new()
            {
                ["NFe"] = new()
                {
                    [1] = "https://nfe.fazenda.rj.gov.br/ws/nfeautorizacao4.asmx",
                    [2] = "https://homologacao.nfe.fazenda.rj.gov.br/ws/nfeautorizacao4.asmx"
                },
                ["NFCe"] = new()
                {
                    [1] = "https://nfce.fazenda.rj.gov.br/ws/nfeautorizacao4.asmx",
                    [2] = "https://homologacao.nfce.fazenda.rj.gov.br/ws/nfeautorizacao4.asmx"
                }
            },
            ["MG"] = new()
            {
                ["NFe"] = new()
                {
                    [1] = "https://nfe.fazenda.mg.gov.br/nfe2/services/NfeAutorizacao4",
                    [2] = "https://hnfe.fazenda.mg.gov.br/nfe2/services/NfeAutorizacao4"
                },
                ["NFCe"] = new()
                {
                    [1] = "https://nfce.fazenda.mg.gov.br/nfe2/services/NfeAutorizacao4",
                    [2] = "https://hnfce.fazenda.mg.gov.br/nfe2/services/NfeAutorizacao4"
                }
            }
        };

        // URL padrão SVAN (Ambiente Nacional) se não encontrar específica da UF
        var urlsPadrao = new Dictionary<string, Dictionary<int, string>>
        {
            ["NFe"] = new()
            {
                [1] = "https://www.sefazvirtual.fazenda.gov.br/NfeAutorizacao4/NfeAutorizacao4.asmx",
                [2] = "https://hom.sefazvirtual.fazenda.gov.br/NfeAutorizacao4/NfeAutorizacao4.asmx"
            },
            ["NFCe"] = new()
            {
                [1] = "https://www.sefazvirtual.fazenda.gov.br/NfeAutorizacao4/NfeAutorizacao4.asmx",
                [2] = "https://hom.sefazvirtual.fazenda.gov.br/NfeAutorizacao4/NfeAutorizacao4.asmx"
            }
        };

        try
        {
            var tipoDoc = tipoDocumento.ToString();
            
            // Tenta buscar URL específica da UF
            if (urls.ContainsKey(uf) && 
                urls[uf].ContainsKey(tipoDoc) && 
                urls[uf][tipoDoc].ContainsKey(ambiente))
            {
                var url = urls[uf][tipoDoc][ambiente];
                _logger.LogInformation("URL WebService encontrada para {UF}/{TipoDoc}/{Ambiente}: {URL}", uf, tipoDoc, ambiente, url);
                return url;
            }

            // Usa URL padrão SVAN
            if (urlsPadrao.ContainsKey(tipoDoc) && urlsPadrao[tipoDoc].ContainsKey(ambiente))
            {
                var url = urlsPadrao[tipoDoc][ambiente];
                _logger.LogInformation("Usando URL WebService padrão SVAN para {UF}/{TipoDoc}/{Ambiente}: {URL}", uf, tipoDoc, ambiente, url);
                return url;
            }

            _logger.LogWarning("URL WebService não encontrada para {UF}/{TipoDoc}/{Ambiente}", uf, tipoDoc, ambiente);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter URL do WebService para {UF}/{TipoDoc}/{Ambiente}", uf, tipoDoc, ambiente);
            return string.Empty;
        }
    }

    // Método para obter código da UF para SEFAZ
    public int GetCodigoUF(string uf)
    {
        var codigosUF = new Dictionary<string, int>
        {
            ["RO"] = 11, ["AC"] = 12, ["AM"] = 13, ["RR"] = 14,
            ["PA"] = 15, ["AP"] = 16, ["TO"] = 17, ["MA"] = 21,
            ["PI"] = 22, ["CE"] = 23, ["RN"] = 24, ["PB"] = 25,
            ["PE"] = 26, ["AL"] = 27, ["SE"] = 28, ["BA"] = 29,
            ["MG"] = 31, ["ES"] = 32, ["RJ"] = 33, ["SP"] = 35,
            ["PR"] = 41, ["SC"] = 42, ["RS"] = 43, ["MS"] = 50,
            ["MT"] = 51, ["GO"] = 52, ["DF"] = 53
        };

        return codigosUF.ContainsKey(uf) ? codigosUF[uf] : 35; // Default SP
    }

    // Método para validar configuração
    public List<string> ValidarConfiguracao()
    {
        var erros = new List<string>();

        if (_configuracao.Ambiente != 1 && _configuracao.Ambiente != 2)
        {
            erros.Add("Ambiente deve ser 1 (Produção) ou 2 (Homologação)");
        }

        if (string.IsNullOrWhiteSpace(_configuracao.UF) || _configuracao.UF.Length != 2)
        {
            erros.Add("UF deve ter 2 caracteres");
        }

        if (_configuracao.TimeoutWebService <= 0)
        {
            erros.Add("Timeout do WebService deve ser maior que zero");
        }

        if (string.IsNullOrWhiteSpace(_configuracao.PastaXMLEnviados))
        {
            erros.Add("Pasta de XML enviados deve ser informada");
        }

        if (string.IsNullOrWhiteSpace(_configuracao.PastaXMLRetornos))
        {
            erros.Add("Pasta de XML retornos deve ser informada");
        }

        return erros;
    }

    // Método para salvar configuração em arquivo JSON
    public bool SalvarConfiguracaoEmArquivo(string caminho = "config.json")
    {
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(_configuracao, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });
            
            File.WriteAllText(caminho, json);
            _logger.LogInformation("Configuração salva em: {Caminho}", caminho);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar configuração em arquivo");
            return false;
        }
    }

    // Método para carregar configuração de arquivo JSON
    public bool CarregarConfiguracaoDeArquivo(string caminho = "config.json")
    {
        try
        {
            if (!File.Exists(caminho))
            {
                _logger.LogWarning("Arquivo de configuração não encontrado: {Caminho}", caminho);
                return false;
            }

            var json = File.ReadAllText(caminho);
            var config = System.Text.Json.JsonSerializer.Deserialize<ConfiguracaoFiscal>(json);
            
            if (config != null)
            {
                SetConfiguracaoFiscal(config);
                _logger.LogInformation("Configuração carregada de: {Caminho}", caminho);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao carregar configuração de arquivo");
            return false;
        }
    }
}
