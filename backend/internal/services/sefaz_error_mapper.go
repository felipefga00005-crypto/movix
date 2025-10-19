package services

import "fmt"

// SefazErrorMapper maps SEFAZ status codes to user-friendly messages
type SefazErrorMapper struct{}

// NewSefazErrorMapper creates a new SEFAZ error mapper
func NewSefazErrorMapper() *SefazErrorMapper {
	return &SefazErrorMapper{}
}

// SefazStatusInfo contains information about a SEFAZ status code
type SefazStatusInfo struct {
	Code        string
	Description string
	IsSuccess   bool
	IsRejection bool
	IsPending   bool
	UserMessage string
}

// GetStatusInfo returns information about a SEFAZ status code
func (m *SefazErrorMapper) GetStatusInfo(code string) *SefazStatusInfo {
	statusMap := map[string]SefazStatusInfo{
		// Success codes
		"100": {
			Code:        "100",
			Description: "Autorizado o uso da NF-e",
			IsSuccess:   true,
			UserMessage: "NFe autorizada com sucesso",
		},
		"101": {
			Code:        "101",
			Description: "Cancelamento de NF-e homologado",
			IsSuccess:   true,
			UserMessage: "NFe cancelada com sucesso",
		},
		"102": {
			Code:        "102",
			Description: "Inutilização de número homologado",
			IsSuccess:   true,
			UserMessage: "Numeração inutilizada com sucesso",
		},
		"135": {
			Code:        "135",
			Description: "Evento registrado e vinculado a NF-e",
			IsSuccess:   true,
			UserMessage: "Cancelamento registrado com sucesso",
		},
		"155": {
			Code:        "155",
			Description: "Cancelamento homologado fora de prazo",
			IsSuccess:   true,
			UserMessage: "Cancelamento homologado (fora do prazo)",
		},

		// Processing codes
		"103": {
			Code:        "103",
			Description: "Lote recebido com sucesso",
			IsPending:   true,
			UserMessage: "Lote recebido, aguardando processamento",
		},
		"104": {
			Code:        "104",
			Description: "Lote processado",
			IsPending:   true,
			UserMessage: "Lote em processamento",
		},
		"105": {
			Code:        "105",
			Description: "Lote em processamento",
			IsPending:   true,
			UserMessage: "Lote em processamento, aguarde",
		},

		// Common rejection codes
		"204": {
			Code:        "204",
			Description: "Duplicidade de NF-e",
			IsRejection: true,
			UserMessage: "Esta NFe já foi autorizada anteriormente",
		},
		"205": {
			Code:        "205",
			Description: "NF-e está denegada na base de dados da SEFAZ",
			IsRejection: true,
			UserMessage: "NFe denegada - verifique a situação fiscal do destinatário",
		},
		"206": {
			Code:        "206",
			Description: "NF-e já está inutilizada na Base de dados da SEFAZ",
			IsRejection: true,
			UserMessage: "Esta numeração já foi inutilizada",
		},
		"207": {
			Code:        "207",
			Description: "CNPJ do emitente inválido",
			IsRejection: true,
			UserMessage: "CNPJ do emitente está inválido",
		},
		"208": {
			Code:        "208",
			Description: "CNPJ do destinatário inválido",
			IsRejection: true,
			UserMessage: "CNPJ/CPF do destinatário está inválido",
		},
		"209": {
			Code:        "209",
			Description: "IE do emitente inválida",
			IsRejection: true,
			UserMessage: "Inscrição Estadual do emitente está inválida",
		},
		"210": {
			Code:        "210",
			Description: "IE do destinatário inválida",
			IsRejection: true,
			UserMessage: "Inscrição Estadual do destinatário está inválida",
		},
		"213": {
			Code:        "213",
			Description: "CNPJ-Base do Emitente difere do CNPJ-Base do Certificado Digital",
			IsRejection: true,
			UserMessage: "Certificado digital não pertence ao emitente",
		},
		"214": {
			Code:        "214",
			Description: "Tamanho da mensagem excedeu o limite estabelecido",
			IsRejection: true,
			UserMessage: "NFe muito grande - reduza o número de itens ou informações adicionais",
		},
		"215": {
			Code:        "215",
			Description: "Falha no reconhecimento da autoria ou integridade do arquivo digital",
			IsRejection: true,
			UserMessage: "Erro na assinatura digital - verifique o certificado",
		},
		"216": {
			Code:        "216",
			Description: "NF-e com Data de Emissão superior à permitida",
			IsRejection: true,
			UserMessage: "Data de emissão está muito no futuro",
		},
		"217": {
			Code:        "217",
			Description: "NF-e com Data de Emissão muito atrasada",
			IsRejection: true,
			UserMessage: "Data de emissão está muito antiga",
		},
		"218": {
			Code:        "218",
			Description: "NF-e não consta na base de dados da SEFAZ",
			IsRejection: true,
			UserMessage: "NFe não encontrada na SEFAZ",
		},
		"301": {
			Code:        "301",
			Description: "Uso Denegado: Irregularidade fiscal do emitente",
			IsRejection: true,
			UserMessage: "Emitente com irregularidade fiscal - regularize sua situação",
		},
		"302": {
			Code:        "302",
			Description: "Uso Denegado: Irregularidade fiscal do destinatário",
			IsRejection: true,
			UserMessage: "Destinatário com irregularidade fiscal",
		},
		"303": {
			Code:        "303",
			Description: "Uso Denegado: Destinatário não habilitado a operar na UF",
			IsRejection: true,
			UserMessage: "Destinatário não habilitado nesta UF",
		},
		"401": {
			Code:        "401",
			Description: "CPF do remetente inválido",
			IsRejection: true,
			UserMessage: "CPF do remetente está inválido",
		},
		"402": {
			Code:        "402",
			Description: "XML da área de cabeçalho com codificação diferente de UTF-8",
			IsRejection: true,
			UserMessage: "Erro de codificação do XML",
		},
		"403": {
			Code:        "403",
			Description: "O grupo de informações da NF-e avulsa é de uso exclusivo do Fisco",
			IsRejection: true,
			UserMessage: "Informações exclusivas do Fisco foram preenchidas",
		},
		"404": {
			Code:        "404",
			Description: "Uso de prefixo de namespace não permitido",
			IsRejection: true,
			UserMessage: "Erro no formato do XML",
		},
		"539": {
			Code:        "539",
			Description: "CNPJ do emitente não cadastrado",
			IsRejection: true,
			UserMessage: "CNPJ do emitente não está cadastrado na SEFAZ",
		},
		"540": {
			Code:        "540",
			Description: "CNPJ do destinatário não cadastrado",
			IsRejection: true,
			UserMessage: "CNPJ do destinatário não está cadastrado",
		},
		"656": {
			Code:        "656",
			Description: "Consumo Indevido",
			IsRejection: true,
			UserMessage: "Limite de consultas excedido - aguarde alguns minutos",
		},
		"999": {
			Code:        "999",
			Description: "Erro não catalogado",
			IsRejection: true,
			UserMessage: "Erro desconhecido - entre em contato com o suporte",
		},
	}

	if info, ok := statusMap[code]; ok {
		return &info
	}

	// Unknown code
	return &SefazStatusInfo{
		Code:        code,
		Description: fmt.Sprintf("Código desconhecido: %s", code),
		IsRejection: true,
		UserMessage: fmt.Sprintf("Erro SEFAZ %s - entre em contato com o suporte", code),
	}
}

// IsSuccess checks if a status code represents success
func (m *SefazErrorMapper) IsSuccess(code string) bool {
	info := m.GetStatusInfo(code)
	return info.IsSuccess
}

// IsRejection checks if a status code represents a rejection
func (m *SefazErrorMapper) IsRejection(code string) bool {
	info := m.GetStatusInfo(code)
	return info.IsRejection
}

// IsPending checks if a status code represents pending processing
func (m *SefazErrorMapper) IsPending(code string) bool {
	info := m.GetStatusInfo(code)
	return info.IsPending
}

// GetUserMessage returns a user-friendly message for a status code
func (m *SefazErrorMapper) GetUserMessage(code string) string {
	info := m.GetStatusInfo(code)
	return info.UserMessage
}

// FormatError formats a SEFAZ error with code and message
func (m *SefazErrorMapper) FormatError(code, originalMessage string) string {
	info := m.GetStatusInfo(code)
	if info.UserMessage != "" {
		return fmt.Sprintf("[%s] %s - %s", code, info.UserMessage, originalMessage)
	}
	return fmt.Sprintf("[%s] %s", code, originalMessage)
}

