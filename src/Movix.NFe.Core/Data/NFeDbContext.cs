using Microsoft.EntityFrameworkCore;
using Movix.NFe.Core.Entities;

namespace Movix.NFe.Core.Data;

/// <summary>
/// Contexto do banco de dados para NFe
/// </summary>
public class NFeDbContext : DbContext
{
    public NFeDbContext(DbContextOptions<NFeDbContext> options) : base(options)
    {
    }

    // Entidades Principais
    public DbSet<Emitente> Emitentes { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<NotaFiscal> NotasFiscais { get; set; }
    public DbSet<NotaFiscalItem> NotasFiscaisItens { get; set; }
    public DbSet<NotaFiscalEvento> NotasFiscaisEventos { get; set; }

    // Tabelas Utilitárias - Localização
    public DbSet<Estado> Estados { get; set; }
    public DbSet<Municipio> Municipios { get; set; }

    // Tabelas Utilitárias - Fiscais
    public DbSet<NCM> NCM { get; set; }
    public DbSet<CEST> CEST { get; set; }
    public DbSet<CFOP> CFOP { get; set; }
    public DbSet<CSTICMS> CSTICMS { get; set; }
    public DbSet<CSOSN> CSOSN { get; set; }
    public DbSet<CSTPIS> CSTPIS { get; set; }
    public DbSet<CSTCOFINS> CSTCOFINS { get; set; }
    public DbSet<CSTIPI> CSTIPI { get; set; }
    public DbSet<NaturezaOperacao> NaturezasOperacao { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configurações adicionais
        ConfigureIndexes(modelBuilder);
        ConfigureRelationships(modelBuilder);
    }

    private void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // Índices para melhorar performance
        modelBuilder.Entity<Emitente>()
            .HasIndex(e => e.CNPJ)
            .IsUnique();

        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.CpfCnpj)
            .IsUnique();

        modelBuilder.Entity<Produto>()
            .HasIndex(p => p.Codigo)
            .IsUnique();

        modelBuilder.Entity<NotaFiscal>()
            .HasIndex(n => n.ChaveAcesso)
            .IsUnique();

        modelBuilder.Entity<NotaFiscal>()
            .HasIndex(n => new { n.Serie, n.Numero, n.EmitenteId })
            .IsUnique();

        modelBuilder.Entity<Estado>()
            .HasIndex(e => e.UF)
            .IsUnique();

        modelBuilder.Entity<Estado>()
            .HasIndex(e => e.CodigoIBGE)
            .IsUnique();

        modelBuilder.Entity<Municipio>()
            .HasIndex(m => m.CodigoIBGE)
            .IsUnique();

        modelBuilder.Entity<NCM>()
            .HasIndex(n => n.Codigo)
            .IsUnique();

        modelBuilder.Entity<CEST>()
            .HasIndex(c => c.Codigo)
            .IsUnique();

        modelBuilder.Entity<CFOP>()
            .HasIndex(c => c.Codigo)
            .IsUnique();

        modelBuilder.Entity<CSTICMS>()
            .HasIndex(c => c.Codigo)
            .IsUnique();

        modelBuilder.Entity<CSOSN>()
            .HasIndex(c => c.Codigo)
            .IsUnique();

        modelBuilder.Entity<CSTPIS>()
            .HasIndex(c => c.Codigo)
            .IsUnique();

        modelBuilder.Entity<CSTCOFINS>()
            .HasIndex(c => c.Codigo)
            .IsUnique();

        modelBuilder.Entity<CSTIPI>()
            .HasIndex(c => c.Codigo)
            .IsUnique();
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // Configurar relacionamentos com DeleteBehavior.Restrict para evitar cascata
        modelBuilder.Entity<NotaFiscal>()
            .HasOne(n => n.Emitente)
            .WithMany(e => e.NotasFiscais)
            .HasForeignKey(n => n.EmitenteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NotaFiscal>()
            .HasOne(n => n.Cliente)
            .WithMany(c => c.NotasFiscais)
            .HasForeignKey(n => n.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NotaFiscalItem>()
            .HasOne(i => i.NotaFiscal)
            .WithMany(n => n.Itens)
            .HasForeignKey(i => i.NotaFiscalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotaFiscalEvento>()
            .HasOne(e => e.NotaFiscal)
            .WithMany(n => n.Eventos)
            .HasForeignKey(e => e.NotaFiscalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NaturezaOperacao>()
            .HasOne(n => n.CFOPPadrao)
            .WithMany()
            .HasForeignKey(n => n.CFOPPadraoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

