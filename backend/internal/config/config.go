package config

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server     ServerConfig
	Database   DatabaseConfig
	Redis      RedisConfig
	JWT        JWTConfig
	Encryption EncryptionConfig
	SEFAZ      SEFAZConfig
	DFe        DFeConfig
	RateLimit  RateLimitConfig
	CORS       CORSConfig
	Logging    LoggingConfig
}

type ServerConfig struct {
	Port string
	Host string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	Timezone string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       string
}

type JWTConfig struct {
	Secret            string
	Expiration        time.Duration
	RefreshExpiration time.Duration
}

type EncryptionConfig struct {
	Key string
}

type SEFAZConfig struct {
	Environment string
	Timeout     time.Duration
}

type DFeConfig struct {
	ServiceURL string
	Timeout    time.Duration
}

type RateLimitConfig struct {
	Requests int
	Window   time.Duration
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

type LoggingConfig struct {
	Level  string
	Format string
}

func LoadConfig() (*Config, error) {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		// .env file is optional, so we just log a warning
		fmt.Println("Warning: .env file not found, using environment variables")
	}

	// Parse JWT expiration
	jwtExpiration, err := time.ParseDuration(getEnv("JWT_EXPIRATION", "24h"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION: %w", err)
	}

	jwtRefreshExpiration, err := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRATION", "168h"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_REFRESH_EXPIRATION: %w", err)
	}

	// Parse SEFAZ timeout
	sefazTimeout, err := time.ParseDuration(getEnv("SEFAZ_TIMEOUT", "60s"))
	if err != nil {
		return nil, fmt.Errorf("invalid SEFAZ_TIMEOUT: %w", err)
	}

	// Parse DFe service timeout
	dfeTimeout, err := time.ParseDuration(getEnv("DFE_SERVICE_TIMEOUT", "60s"))
	if err != nil {
		return nil, fmt.Errorf("invalid DFE_SERVICE_TIMEOUT: %w", err)
	}

	// Parse rate limit window
	rateLimitWindow, err := time.ParseDuration(getEnv("RATE_LIMIT_WINDOW", "1m"))
	if err != nil {
		return nil, fmt.Errorf("invalid RATE_LIMIT_WINDOW: %w", err)
	}

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "movix"),
			Password: getEnv("DB_PASSWORD", "movix123"),
			Name:     getEnv("DB_NAME", "movix_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			Timezone: getEnv("DB_TIMEZONE", "America/Sao_Paulo"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnv("REDIS_DB", "0"),
		},
		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
			Expiration:        jwtExpiration,
			RefreshExpiration: jwtRefreshExpiration,
		},
		Encryption: EncryptionConfig{
			Key: getEnv("ENCRYPTION_KEY", "your-32-byte-encryption-key-here"),
		},
		SEFAZ: SEFAZConfig{
			Environment: getEnv("SEFAZ_ENVIRONMENT", "homologacao"),
			Timeout:     sefazTimeout,
		},
		DFe: DFeConfig{
			ServiceURL: getEnv("DFE_SERVICE_URL", "http://localhost:5000"),
			Timeout:    dfeTimeout,
		},
		RateLimit: RateLimitConfig{
			Requests: getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
			Window:   rateLimitWindow,
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
			AllowedMethods: getEnvAsSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
			AllowedHeaders: getEnvAsSlice("CORS_ALLOWED_HEADERS", []string{"Content-Type", "Authorization"}),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "debug"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}

	return config, nil
}

func (c *Config) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
		c.Database.Timezone,
	)
}

func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	var value int
	fmt.Sscanf(valueStr, "%d", &value)
	return value
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	
	var result []string
	current := ""
	for _, char := range valueStr {
		if char == ',' {
			if current != "" {
				result = append(result, current)
				current = ""
			}
		} else {
			current += string(char)
		}
	}
	if current != "" {
		result = append(result, current)
	}
	
	return result
}

