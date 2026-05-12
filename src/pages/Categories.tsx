import { useState, type FormEvent } from 'react';
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import ActionsMenu from '../components/ActionsMenu';
import PageHeader from '../components/PageHeader';
import {
  type Category,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '../services/categoryApi';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

const extractApiMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      if ('detail' in data && typeof (data as { detail?: unknown }).detail === 'string') {
        return (data as { detail: string }).detail;
      }
      const values = Object.values(data as Record<string, unknown>);
      const firstValue = values[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
        return firstValue[0];
      }
      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }
  }
  return fallback;
};

const Categories = () => {
  const { data: categories = [], isLoading, isFetching, error, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setStatusMessage({ type: 'error', text: 'Category name is required.' });
      return;
    }

    try {
      const payload = {
        category_name: trimmedName,
        ...(trimmedSlug ? { slug: trimmedSlug } : {}),
        description: trimmedDescription,
        status,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          body: payload,
        }).unwrap();
        setStatusMessage({ type: 'success', text: 'Category updated successfully.' });
      } else {
        await createCategory(payload).unwrap();
        setStatusMessage({ type: 'success', text: 'Category created successfully.' });
      }

      setName('');
      setSlug('');
      setDescription('');
      setStatus('active');
      setEditingCategory(null);
    } catch (submitError) {
      console.error('Failed to submit category', submitError);
      setStatusMessage({
        type: 'error',
        text: extractApiMessage(submitError, 'Unable to save category. Please try again.'),
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.category_name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setStatus(category.status);
    setStatusMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setStatus('active');
    setStatusMessage(null);
  };

  const handleToggleStatus = async (id: number, currentStatus: 'active' | 'inactive') => {
    try {
      const category = categories.find((item) => item.id === id);
      if (!category) {
        return;
      }

      await updateCategory({
        id,
        body: {
          category_name: category.category_name,
          slug: category.slug,
          description: category.description,
          status: currentStatus === 'active' ? 'inactive' : 'active',
        },
      }).unwrap();
      setStatusMessage({ type: 'success', text: 'Category status updated.' });
    } catch (updateError) {
      console.error('Failed to update category', updateError);
      setStatusMessage({
        type: 'error',
        text: extractApiMessage(updateError, 'Unable to update category status.'),
      });
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await deleteCategory(id).unwrap();
      setStatusMessage({ type: 'success', text: 'Category deleted successfully.' });
    } catch (deleteError) {
      console.error('Failed to delete category', deleteError);
      setStatusMessage({
        type: 'error',
        text: extractApiMessage(deleteError, 'Unable to delete category.'),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage book categories and organize the catalog"
        icon={Tags}
        sticky={false}
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              {categories.length} total
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingCategory ? 'Edit category' : 'Create category'}
              </h2>
              <p className="text-sm text-slate-600">
                {editingCategory
                  ? 'Update the selected category details and save the changes.'
                  : 'Add a new category to keep the catalog organized.'}
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {statusMessage ? (
              <div
                className={`rounded-xl border px-3 py-2 text-sm ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {statusMessage.text}
              </div>
            ) : null}
            <div>
              <label htmlFor="category-name" className="mb-1 block text-sm font-medium text-slate-700">
                Category name
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Criminal Procedure"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="category-slug" className="mb-1 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                id="category-slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="Leave blank to auto-generate"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="category-description" className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description of this category"
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="category-status" className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="category-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as 'active' | 'inactive')}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating || isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingCategory ? 'Update category' : 'Add category'}
            </button>
            {editingCategory ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="ml-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Category list</h2>
              <p className="text-sm text-slate-600">
                Review the categories available in the catalog.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {categories.length} records
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading categories...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load categories. Make sure the backend API is running.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Tags className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{category.category_name}</p>
                            <p className="text-xs text-slate-500">Slug: {category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        <div className="space-y-2">
                          <p>{category.description || 'No description provided.'}</p>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              category.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {category.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(category.id, category.status)}
                            disabled={isUpdating || isDeleting}
                            title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                            role="switch"
                            aria-checked={category.status === 'active'}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 disabled:opacity-50 ${
                              category.status === 'active'
                                ? 'bg-emerald-500 shadow-emerald-200'
                                : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ${
                                category.status === 'active'
                                  ? 'translate-x-5'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <ActionsMenu
                            actions={[
                              {
                                label: 'Edit',
                                icon: <Pencil className="h-4 w-4 text-blue-600" />,
                                onClick: () => handleEdit(category),
                                disabled: isUpdating || isDeleting,
                              },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="h-4 w-4 text-red-600" />,
                                onClick: () => {
                                  const confirmed = window.confirm(
                                    `Delete "${category.category_name}" category?`
                                  );

                                  if (confirmed) {
                                    handleRemove(category.id);
                                  }
                                },
                                disabled: isDeleting || isUpdating,
                                className: 'text-red-600 hover:bg-red-50',
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && !error && categories.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
              No categories found.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default Categories;
