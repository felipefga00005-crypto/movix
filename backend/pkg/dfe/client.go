package dfe

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client represents a DFe service HTTP client
type Client struct {
	baseURL    string
	httpClient *http.Client
	timeout    time.Duration
}

// NewClient creates a new DFe service client
func NewClient(baseURL string, timeout time.Duration) *Client {
	if timeout == 0 {
		timeout = 60 * time.Second
	}

	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: timeout,
		},
		timeout: timeout,
	}
}

// AuthorizeNFe sends an NFe for authorization
func (c *Client) AuthorizeNFe(req *NFeRequest) (*NFeResponse, error) {
	var resp NFeResponse
	err := c.doRequest("POST", "/api/nfe/authorize", req, &resp)
	return &resp, err
}

// CancelNFe cancels an authorized NFe
func (c *Client) CancelNFe(req *CancelNFeRequest) (*CancelNFeResponse, error) {
	var resp CancelNFeResponse
	err := c.doRequest("POST", "/api/nfe/cancel", req, &resp)
	return &resp, err
}

// CheckServiceStatus checks SEFAZ service status
func (c *Client) CheckServiceStatus(req *StatusServiceRequest) (*StatusServiceResponse, error) {
	var resp StatusServiceResponse
	err := c.doRequest("POST", "/api/nfe/status", req, &resp)
	return &resp, err
}

// GenerateDanfe generates DANFE PDF or HTML
func (c *Client) GenerateDanfe(req *DanfeRequest) (*DanfeResponse, error) {
	var resp DanfeResponse
	err := c.doRequest("POST", "/api/nfe/danfe", req, &resp)
	return &resp, err
}

// doRequest performs an HTTP request to the DFe service
func (c *Client) doRequest(method, path string, reqBody interface{}, respBody interface{}) error {
	// Marshal request body
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create request
	url := c.baseURL + path
	req, err := http.NewRequest(method, url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Execute request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	// Check status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("DFe service returned status %d: %s", resp.StatusCode, string(body))
	}

	// Unmarshal response
	if err := json.Unmarshal(body, respBody); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}

