/**
 * Sistema de Permissões
 * Gerencia permissões baseadas em perfis de usuário
 */

/**
 * Perfis de usuário disponíveis no sistema
 */
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  GERENTE = "gerente",
  OPERADOR = "operador",
}

/**
 * Hierarquia de permissões
 * Quanto maior o número, maior o nível de acesso
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 4,
  [UserRole.ADMIN]: 3,
  [UserRole.GERENTE]: 2,
  [UserRole.OPERADOR]: 1,
};

/**
 * Permissões específicas do sistema
 */
export enum Permission {
  // Usuários
  VIEW_USERS = "view_users",
  CREATE_USERS = "create_users",
  EDIT_USERS = "edit_users",
  DELETE_USERS = "delete_users",

  // Clientes
  VIEW_CLIENTS = "view_clients",
  CREATE_CLIENTS = "create_clients",
  EDIT_CLIENTS = "edit_clients",
  DELETE_CLIENTS = "delete_clients",

  // Produtos
  VIEW_PRODUCTS = "view_products",
  CREATE_PRODUCTS = "create_products",
  EDIT_PRODUCTS = "edit_products",
  DELETE_PRODUCTS = "delete_products",

  // Fornecedores
  VIEW_SUPPLIERS = "view_suppliers",
  CREATE_SUPPLIERS = "create_suppliers",
  EDIT_SUPPLIERS = "edit_suppliers",
  DELETE_SUPPLIERS = "delete_suppliers",

  // Configurações
  VIEW_SETTINGS = "view_settings",
  EDIT_SETTINGS = "edit_settings",

  // Relatórios
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",
}

/**
 * Mapa de permissões por perfil
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Tem todas as permissões
    ...Object.values(Permission),
  ],
  [UserRole.ADMIN]: [
    // Usuários
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    // Clientes
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,
    // Produtos
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    // Fornecedores
    Permission.VIEW_SUPPLIERS,
    Permission.CREATE_SUPPLIERS,
    Permission.EDIT_SUPPLIERS,
    Permission.DELETE_SUPPLIERS,
    // Configurações
    Permission.VIEW_SETTINGS,
    // Relatórios
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.GERENTE]: [
    // Clientes
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    // Produtos
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    // Fornecedores
    Permission.VIEW_SUPPLIERS,
    Permission.CREATE_SUPPLIERS,
    Permission.EDIT_SUPPLIERS,
    // Relatórios
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.OPERADOR]: [
    // Clientes
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    // Produtos
    Permission.VIEW_PRODUCTS,
    // Fornecedores
    Permission.VIEW_SUPPLIERS,
    // Relatórios
    Permission.VIEW_REPORTS,
  ],
};

/**
 * Verifica se um perfil tem uma permissão específica
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const userRole = role as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Verifica se um perfil tem todas as permissões especificadas
 */
export function hasAllPermissions(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Verifica se um perfil tem pelo menos uma das permissões especificadas
 */
export function hasAnyPermission(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica se um perfil tem nível hierárquico suficiente
 */
export function hasRoleLevel(role: string, minimumRole: UserRole): boolean {
  const userRole = role as UserRole;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0;
  return userLevel >= minimumLevel;
}

/**
 * Obtém todas as permissões de um perfil
 */
export function getRolePermissions(role: string): Permission[] {
  const userRole = role as UserRole;
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Verifica se é super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === UserRole.SUPER_ADMIN;
}

/**
 * Verifica se é admin (super_admin ou admin)
 */
export function isAdmin(role: string): boolean {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
}

/**
 * Verifica se pode gerenciar usuários
 */
export function canManageUsers(role: string): boolean {
  return hasPermission(role, Permission.CREATE_USERS);
}

/**
 * Verifica se pode acessar configurações
 */
export function canAccessSettings(role: string): boolean {
  return hasPermission(role, Permission.VIEW_SETTINGS);
}

/**
 * Verifica se pode exportar relatórios
 */
export function canExportReports(role: string): boolean {
  return hasPermission(role, Permission.EXPORT_REPORTS);
}

/**
 * Hook para usar permissões em componentes
 */
export function usePermissions(userRole: string) {
  return {
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(userRole, permissions),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(userRole, permissions),
    hasRoleLevel: (minimumRole: UserRole) => hasRoleLevel(userRole, minimumRole),
    isSuperAdmin: () => isSuperAdmin(userRole),
    isAdmin: () => isAdmin(userRole),
    canManageUsers: () => canManageUsers(userRole),
    canAccessSettings: () => canAccessSettings(userRole),
    canExportReports: () => canExportReports(userRole),
    permissions: getRolePermissions(userRole),
  };
}

