import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/authSlice';

/**
 * Custom hook to check user permissions
 * 
 * Returns helper functions to check if the current user has specific permissions
 */
export const usePermissions = () => {
  const user = useAppSelector(selectCurrentUser);

  const hasPermission = (module: string, model: string, action: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    try {
      const modulePerms = user.permissions[module as keyof typeof user.permissions];
      if (!modulePerms) return false;

      const modelPerms = modulePerms[model as keyof typeof modulePerms];
      if (!modelPerms || typeof modelPerms !== 'object') return false;

      return !!(modelPerms as Record<string, boolean>)[action];
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // Admin check helper - used for all catalog permissions
  const isAdmin = () => user?.role === 'admin';

  // Catalog Product Permissions
  const canViewProducts = () => hasPermission('catalog', 'product', 'view');
  const canAddProducts = () => hasPermission('catalog', 'product', 'add');
  const canEditProducts = () => hasPermission('catalog', 'product', 'change');
  const canDeleteProducts = () => hasPermission('catalog', 'product', 'delete');

  // Catalog Brand Permissions
  // Admin users have full access to all brand operations
  const canViewBrands = () => isAdmin() || hasPermission('catalog', 'brand', 'view');
  const canAddBrands = () => isAdmin() || hasPermission('catalog', 'brand', 'add');
  const canEditBrands = () => isAdmin() || hasPermission('catalog', 'brand', 'change');
  const canDeleteBrands = () => isAdmin() || hasPermission('catalog', 'brand', 'delete');

  // Catalog Category Permissions
  // Admin users have full access to all category operations
  const canViewCategories = () => isAdmin() || hasPermission('catalog', 'category', 'view');
  const canAddCategories = () => isAdmin() || hasPermission('catalog', 'category', 'add');
  const canEditCategories = () => isAdmin() || hasPermission('catalog', 'category', 'change');
  const canDeleteCategories = () => isAdmin() || hasPermission('catalog', 'category', 'delete');

  // Catalog Attribute Permissions
  const canViewAttributes = () => hasPermission('catalog', 'attribute', 'view');
  const canAddAttributes = () => hasPermission('catalog', 'attribute', 'add');
  const canEditAttributes = () => hasPermission('catalog', 'attribute', 'change');
  const canDeleteAttributes = () => hasPermission('catalog', 'attribute', 'delete');

  // Catalog Attribute Value Permissions
  const canViewAttributeValues = () => hasPermission('catalog', 'attributevalue', 'view');
  const canAddAttributeValues = () => hasPermission('catalog', 'attributevalue', 'add');
  const canEditAttributeValues = () => hasPermission('catalog', 'attributevalue', 'change');
  const canDeleteAttributeValues = () => hasPermission('catalog', 'attributevalue', 'delete');

  // Catalog Media Asset Permissions
  // Admin users have full access to all media asset operations
  const canViewMediaAssets = () => isAdmin() || hasPermission('catalog', 'mediaasset', 'view');
  const canAddMediaAssets = () => isAdmin() || hasPermission('catalog', 'mediaasset', 'add');
  const canEditMediaAssets = () => isAdmin() || hasPermission('catalog', 'mediaasset', 'change');
  const canDeleteMediaAssets = () => isAdmin() || hasPermission('catalog', 'mediaasset', 'delete');

  // Store Product Permissions
  const canViewStoreProducts = () => hasPermission('catalog', 'storeproduct', 'view');
  const canAddStoreProducts = () => hasPermission('catalog', 'storeproduct', 'add');
  const canEditStoreProducts = () => hasPermission('catalog', 'storeproduct', 'change');
  const canDeleteStoreProducts = () => hasPermission('catalog', 'storeproduct', 'delete');

  return {
    hasPermission,
    // Product permissions
    canViewProducts,
    canAddProducts,
    canEditProducts,
    canDeleteProducts,
    // Brand permissions
    canViewBrands,
    canAddBrands,
    canEditBrands,
    canDeleteBrands,
    // Category permissions
    canViewCategories,
    canAddCategories,
    canEditCategories,
    canDeleteCategories,
    // Attribute permissions
    canViewAttributes,
    canAddAttributes,
    canEditAttributes,
    canDeleteAttributes,
    // Attribute Value permissions
    canViewAttributeValues,
    canAddAttributeValues,
    canEditAttributeValues,
    canDeleteAttributeValues,
    // Media Asset permissions
    canViewMediaAssets,
    canAddMediaAssets,
    canEditMediaAssets,
    canDeleteMediaAssets,
    // Store product permissions
    canViewStoreProducts,
    canAddStoreProducts,
    canEditStoreProducts,
    canDeleteStoreProducts,
  };
};

export default usePermissions;

