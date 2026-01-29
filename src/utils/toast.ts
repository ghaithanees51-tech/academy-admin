import toast from 'react-hot-toast';

// Custom toast styles
const toastStyles = {
  success: {
    duration: 4000,
    style: {
      background: '#10b981',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#10b981',
    },
  },
  error: {
    duration: 5000,
    style: {
      background: '#ef4444',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#ef4444',
    },
  },
  loading: {
    style: {
      background: '#6366f1',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#6366f1',
    },
  },
  info: {
    duration: 4000,
    style: {
      background: '#3b82f6',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#3b82f6',
    },
  },
  warning: {
    duration: 4000,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.2)',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#f59e0b',
    },
  },
};

// Custom toast functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, toastStyles.success);
  },
  error: (message: string) => {
    toast.error(message, toastStyles.error);
  },
  loading: (message: string) => {
    return toast.loading(message, toastStyles.loading);
  },
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      ...toastStyles.info,
    });
  },
  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      ...toastStyles.warning,
    });
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        loading: toastStyles.loading,
        success: toastStyles.success,
        error: toastStyles.error,
      }
    );
  },
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// Export default toast for backward compatibility
export default showToast;

