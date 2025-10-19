namespace DFeService.Models;

public class NFeRequest
{
    public CompanyData Company { get; set; } = null!;
    public CustomerData Customer { get; set; } = null!;
    public List<NFeItemData> Items { get; set; } = new();
    public CertificateData Certificate { get; set; } = null!;
    public string Environment { get; set; } = "homologacao"; // "producao" ou "homologacao"
    public int Series { get; set; }
    public int Number { get; set; }
    public string Model { get; set; } = "55"; // 55=NFe, 65=NFCe
    public string OperationNature { get; set; } = "Venda de mercadoria";
    public int OperationType { get; set; } = 1; // 1=Saída, 0=Entrada
    public int Purpose { get; set; } = 1; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    public int ConsumerOperation { get; set; } = 0; // 0=Não, 1=Sim
    public int PresenceIndicator { get; set; } = 1; // 1=Presencial, 2=Internet, etc
    public PaymentData? Payment { get; set; }
    public TransportData? Transport { get; set; }
    public string? AdditionalInfo { get; set; }
}

public class CompanyData
{
    public string Document { get; set; } = null!; // CNPJ
    public string Name { get; set; } = null!; // Razão Social
    public string TradeName { get; set; } = null!; // Nome Fantasia
    public string StateRegistration { get; set; } = null!; // IE
    public string? MunicipalRegistration { get; set; } // IM
    public int TaxRegime { get; set; } = 1; // 1=Simples Nacional, 2=Presumido, 3=Real
    public AddressData Address { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
}

public class CustomerData
{
    public string PersonType { get; set; } = "juridica"; // "fisica" ou "juridica"
    public string Document { get; set; } = null!; // CPF ou CNPJ
    public string Name { get; set; } = null!;
    public string? TradeName { get; set; }
    public string? StateRegistration { get; set; }
    public string StateRegistrationType { get; set; } = "nao_contribuinte"; // "contribuinte", "isento", "nao_contribuinte"
    public AddressData Address { get; set; } = null!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public class AddressData
{
    public string Street { get; set; } = null!;
    public string Number { get; set; } = null!;
    public string? Complement { get; set; }
    public string District { get; set; } = null!;
    public string City { get; set; } = null!;
    public string CityCode { get; set; } = null!; // Código IBGE
    public string State { get; set; } = null!; // UF
    public string ZipCode { get; set; } = null!; // CEP
    public string CountryCode { get; set; } = "1058"; // Brasil
    public string Country { get; set; } = "Brasil";
}

public class NFeItemData
{
    public int ItemNumber { get; set; }
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string NCM { get; set; } = null!;
    public string CFOP { get; set; } = null!;
    public string Unit { get; set; } = "UN";
    public decimal Quantity { get; set; }
    public decimal UnitValue { get; set; }
    public decimal TotalValue { get; set; }
    public string? Barcode { get; set; }
    public string? CEST { get; set; }
    public int Origin { get; set; } = 0; // 0-8
    public TaxData Tax { get; set; } = new();
}

public class TaxData
{
    public ICMSData ICMS { get; set; } = new();
    public IPIData? IPI { get; set; }
    public PISData PIS { get; set; } = new();
    public COFINSData COFINS { get; set; } = new();
}

public class ICMSData
{
    public string CST { get; set; } = "102"; // Código de Situação Tributária
    public decimal BaseCalc { get; set; }
    public decimal Rate { get; set; }
    public decimal Value { get; set; }
    public int CSOSN { get; set; } = 102; // Para Simples Nacional
}

public class IPIData
{
    public string CST { get; set; } = "99";
    public decimal BaseCalc { get; set; }
    public decimal Rate { get; set; }
    public decimal Value { get; set; }
}

public class PISData
{
    public string CST { get; set; } = "99";
    public decimal BaseCalc { get; set; }
    public decimal Rate { get; set; }
    public decimal Value { get; set; }
}

public class COFINSData
{
    public string CST { get; set; } = "99";
    public decimal BaseCalc { get; set; }
    public decimal Rate { get; set; }
    public decimal Value { get; set; }
}

public class PaymentData
{
    public int Indicator { get; set; } = 0; // 0=À vista, 1=A prazo
    public List<PaymentMethodData> Methods { get; set; } = new();
}

public class PaymentMethodData
{
    public string Type { get; set; } = "01"; // 01=Dinheiro, 03=Cartão Crédito, etc
    public decimal Value { get; set; }
}

public class TransportData
{
    public int Modality { get; set; } = 9; // 9=Sem frete
    public CarrierData? Carrier { get; set; }
    public List<VolumeData>? Volumes { get; set; }
}

public class CarrierData
{
    public string? Document { get; set; }
    public string? Name { get; set; }
    public string? StateRegistration { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
}

public class VolumeData
{
    public int Quantity { get; set; }
    public string? Species { get; set; }
    public string? Brand { get; set; }
    public string? Numbering { get; set; }
    public decimal? GrossWeight { get; set; }
    public decimal? NetWeight { get; set; }
}

public class CertificateData
{
    public byte[] Content { get; set; } = null!; // Arquivo .pfx em bytes
    public string Password { get; set; } = null!;
}

