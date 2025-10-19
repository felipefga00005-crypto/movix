package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/movix/backend/internal/models"
	"github.com/movix/backend/internal/repositories"
	"github.com/movix/backend/internal/validators"
)

// ProductService handles business logic for products
type ProductService struct {
	repo *repositories.ProductRepository
}

// NewProductService creates a new product service
func NewProductService(repo *repositories.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

// CriarProduto creates a new product with validations
func (s *ProductService) CriarProduto(product *models.Product) error {
	// Validate required fields
	if product.CompanyID == uuid.Nil {
		return errors.New("company_id é obrigatório")
	}
	
	if product.Code == "" {
		return errors.New("código do produto é obrigatório")
	}
	
	if product.Description == "" {
		return errors.New("descrição do produto é obrigatória")
	}
	
	if product.NCM == "" {
		return errors.New("NCM é obrigatório")
	}
	
	if product.CommercialUnit == "" {
		return errors.New("unidade comercial é obrigatória")
	}
	
	// Clean and validate NCM
	product.NCM = validators.RemoverFormatacao(product.NCM)
	if err := validators.ValidarNCM(product.NCM); err != nil {
		return err
	}
	
	// Validate CEST if provided
	if product.CEST != "" {
		product.CEST = validators.RemoverFormatacao(product.CEST)
		if err := validators.ValidarCEST(product.CEST); err != nil {
			return err
		}
	}
	
	// Validate CFOP if provided
	if product.CFOP != "" {
		product.CFOP = validators.RemoverFormatacao(product.CFOP)
		if err := validators.ValidarCFOP(product.CFOP); err != nil {
			return err
		}
	}
	
	// Validate barcode if provided
	if product.Barcode != "" {
		product.Barcode = validators.RemoverFormatacao(product.Barcode)
		if err := validators.ValidarGTIN(product.Barcode); err != nil {
			return err
		}
	}
	
	if product.BarcodeUnit != "" {
		product.BarcodeUnit = validators.RemoverFormatacao(product.BarcodeUnit)
		if err := validators.ValidarGTIN(product.BarcodeUnit); err != nil {
			return err
		}
	}
	
	// Validate origin
	if err := validators.ValidarOrigem(int(product.Origin)); err != nil {
		return err
	}
	
	// Validate commercial unit
	product.CommercialUnit = strings.ToUpper(strings.TrimSpace(product.CommercialUnit))
	if err := validators.ValidarUnidade(product.CommercialUnit); err != nil {
		return err
	}
	
	// Validate tax unit if provided
	if product.TaxUnit != "" {
		product.TaxUnit = strings.ToUpper(strings.TrimSpace(product.TaxUnit))
		if err := validators.ValidarUnidade(product.TaxUnit); err != nil {
			return err
		}
	}
	
	// Check if code already exists
	exists, err := s.repo.ExistsByCode(product.CompanyID, product.Code, nil)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("já existe um produto com este código")
	}
	
	// Validate prices
	if product.CostPrice < 0 {
		return errors.New("preço de custo não pode ser negativo")
	}
	
	if product.SalePrice < 0 {
		return errors.New("preço de venda não pode ser negativo")
	}
	
	// Validate stock
	if product.CurrentStock < 0 {
		return errors.New("estoque atual não pode ser negativo")
	}
	
	// Create product
	return s.repo.Create(product)
}

// ObterProduto gets a product by ID
func (s *ProductService) ObterProduto(id uuid.UUID) (*models.Product, error) {
	return s.repo.FindByID(id)
}

// ListarProdutos lists all products of a company
func (s *ProductService) ListarProdutos(companyID uuid.UUID, activeOnly bool) ([]models.Product, error) {
	return s.repo.ListByCompany(companyID, activeOnly)
}

// AtualizarProduto updates a product with validations
func (s *ProductService) AtualizarProduto(product *models.Product) error {
	// Validate required fields
	if product.ID == uuid.Nil {
		return errors.New("ID é obrigatório")
	}
	
	if product.Code == "" {
		return errors.New("código do produto é obrigatório")
	}
	
	if product.Description == "" {
		return errors.New("descrição do produto é obrigatória")
	}
	
	if product.NCM == "" {
		return errors.New("NCM é obrigatório")
	}
	
	if product.CommercialUnit == "" {
		return errors.New("unidade comercial é obrigatória")
	}
	
	// Clean and validate NCM
	product.NCM = validators.RemoverFormatacao(product.NCM)
	if err := validators.ValidarNCM(product.NCM); err != nil {
		return err
	}
	
	// Validate CEST if provided
	if product.CEST != "" {
		product.CEST = validators.RemoverFormatacao(product.CEST)
		if err := validators.ValidarCEST(product.CEST); err != nil {
			return err
		}
	}
	
	// Validate CFOP if provided
	if product.CFOP != "" {
		product.CFOP = validators.RemoverFormatacao(product.CFOP)
		if err := validators.ValidarCFOP(product.CFOP); err != nil {
			return err
		}
	}
	
	// Validate barcode if provided
	if product.Barcode != "" {
		product.Barcode = validators.RemoverFormatacao(product.Barcode)
		if err := validators.ValidarGTIN(product.Barcode); err != nil {
			return err
		}
	}
	
	if product.BarcodeUnit != "" {
		product.BarcodeUnit = validators.RemoverFormatacao(product.BarcodeUnit)
		if err := validators.ValidarGTIN(product.BarcodeUnit); err != nil {
			return err
		}
	}
	
	// Validate origin
	if err := validators.ValidarOrigem(int(product.Origin)); err != nil {
		return err
	}
	
	// Validate commercial unit
	product.CommercialUnit = strings.ToUpper(strings.TrimSpace(product.CommercialUnit))
	if err := validators.ValidarUnidade(product.CommercialUnit); err != nil {
		return err
	}
	
	// Validate tax unit if provided
	if product.TaxUnit != "" {
		product.TaxUnit = strings.ToUpper(strings.TrimSpace(product.TaxUnit))
		if err := validators.ValidarUnidade(product.TaxUnit); err != nil {
			return err
		}
	}
	
	// Check if code already exists (excluding current product)
	exists, err := s.repo.ExistsByCode(product.CompanyID, product.Code, &product.ID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("já existe outro produto com este código")
	}
	
	// Validate prices
	if product.CostPrice < 0 {
		return errors.New("preço de custo não pode ser negativo")
	}
	
	if product.SalePrice < 0 {
		return errors.New("preço de venda não pode ser negativo")
	}
	
	// Validate stock
	if product.CurrentStock < 0 {
		return errors.New("estoque atual não pode ser negativo")
	}
	
	// Update product
	return s.repo.Update(product)
}

// DeletarProduto soft deletes a product
func (s *ProductService) DeletarProduto(id uuid.UUID) error {
	return s.repo.Delete(id)
}

// BuscarPorCodigo finds a product by code
func (s *ProductService) BuscarPorCodigo(companyID uuid.UUID, code string) (*models.Product, error) {
	return s.repo.FindByCode(companyID, code)
}

// PesquisarProdutos searches products by code or description
func (s *ProductService) PesquisarProdutos(companyID uuid.UUID, term string, limit int) ([]models.Product, error) {
	return s.repo.Search(companyID, term, limit)
}

