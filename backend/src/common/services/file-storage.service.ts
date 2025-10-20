import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly storagePath: string;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>('STORAGE_PATH') || 
                      path.join(process.cwd(), 'storage');
    this.ensureDirectories();
  }

  /**
   * Garantir que os diretórios existam
   */
  private ensureDirectories(): void {
    const directories = [
      this.storagePath,
      path.join(this.storagePath, 'xml'),
      path.join(this.storagePath, 'xml', 'generated'),
      path.join(this.storagePath, 'xml', 'signed'),
      path.join(this.storagePath, 'xml', 'sent'),
      path.join(this.storagePath, 'xml', 'authorized'),
      path.join(this.storagePath, 'xml', 'cancelled'),
      path.join(this.storagePath, 'pdf'),
      path.join(this.storagePath, 'logs'),
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        this.logger.log(`Diretório criado: ${dir}`);
      }
    });
  }

  /**
   * Salvar XML da NFe
   */
  async saveXml(chave: string, xml: string, type: 'generated' | 'signed' | 'sent' | 'authorized' | 'cancelled' = 'generated'): Promise<StorageResult> {
    try {
      const filename = `${chave}.xml`;
      const filePath = path.join(this.storagePath, 'xml', type, filename);
      
      await fs.promises.writeFile(filePath, xml, 'utf8');
      
      this.logger.log(`XML salvo: ${filePath}`);
      return {
        success: true,
        filePath,
      };
    } catch (error) {
      this.logger.error(`Erro ao salvar XML: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obter XML da NFe
   */
  async getXml(chave: string, type: 'generated' | 'signed' | 'sent' | 'authorized' | 'cancelled' = 'sent'): Promise<string | null> {
    try {
      const filename = `${chave}.xml`;
      const filePath = path.join(this.storagePath, 'xml', type, filename);
      
      if (fs.existsSync(filePath)) {
        return await fs.promises.readFile(filePath, 'utf8');
      }

      // Tentar outros tipos se não encontrar
      const types = ['authorized', 'sent', 'signed', 'generated'];
      for (const t of types) {
        if (t === type) continue;
        
        const altPath = path.join(this.storagePath, 'xml', t, filename);
        if (fs.existsSync(altPath)) {
          return await fs.promises.readFile(altPath, 'utf8');
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Erro ao ler XML: ${error.message}`);
      return null;
    }
  }

  /**
   * Salvar PDF da NFe (DANFE)
   */
  async savePdf(chave: string, pdf: Buffer): Promise<StorageResult> {
    try {
      const filename = `${chave}.pdf`;
      const filePath = path.join(this.storagePath, 'pdf', filename);
      
      await fs.promises.writeFile(filePath, pdf);
      
      this.logger.log(`PDF salvo: ${filePath}`);
      return {
        success: true,
        filePath,
      };
    } catch (error) {
      this.logger.error(`Erro ao salvar PDF: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obter PDF da NFe
   */
  async getPdf(chave: string): Promise<Buffer | null> {
    try {
      const filename = `${chave}.pdf`;
      const filePath = path.join(this.storagePath, 'pdf', filename);
      
      if (fs.existsSync(filePath)) {
        return await fs.promises.readFile(filePath);
      }

      return null;
    } catch (error) {
      this.logger.error(`Erro ao ler PDF: ${error.message}`);
      return null;
    }
  }

  /**
   * Excluir XML
   */
  async deleteXml(chave: string, type: 'generated' | 'signed' | 'sent' | 'authorized' | 'cancelled' = 'generated'): Promise<boolean> {
    try {
      const filename = `${chave}.xml`;
      const filePath = path.join(this.storagePath, 'xml', type, filename);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`XML excluído: ${filePath}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Erro ao excluir XML: ${error.message}`);
      return false;
    }
  }

  /**
   * Verificar se XML existe
   */
  xmlExists(chave: string, type: 'generated' | 'signed' | 'sent' | 'authorized' | 'cancelled' = 'generated'): boolean {
    const filename = `${chave}.xml`;
    const filePath = path.join(this.storagePath, 'xml', type, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Listar XMLs por tipo
   */
  async listXmls(type: 'generated' | 'signed' | 'sent' | 'authorized' | 'cancelled' = 'sent'): Promise<string[]> {
    try {
      const dirPath = path.join(this.storagePath, 'xml', type);
      const files = await fs.promises.readdir(dirPath);
      return files.filter(file => file.endsWith('.xml')).map(file => file.replace('.xml', ''));
    } catch (error) {
      this.logger.error(`Erro ao listar XMLs: ${error.message}`);
      return [];
    }
  }

  /**
   * Obter informações do arquivo
   */
  async getFileInfo(chave: string, type: 'xml' | 'pdf' = 'xml', xmlType?: string): Promise<any> {
    try {
      let filePath: string;
      
      if (type === 'xml') {
        const xmlT = xmlType || 'sent';
        filePath = path.join(this.storagePath, 'xml', xmlT, `${chave}.xml`);
      } else {
        filePath = path.join(this.storagePath, 'pdf', `${chave}.pdf`);
      }

      if (fs.existsSync(filePath)) {
        const stats = await fs.promises.stat(filePath);
        return {
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath,
        };
      }

      return { exists: false };
    } catch (error) {
      this.logger.error(`Erro ao obter informações do arquivo: ${error.message}`);
      return { exists: false, error: error.message };
    }
  }
}
