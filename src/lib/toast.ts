import { toast as sonnerToast } from 'sonner'

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}

const toast = {
  success: (title: string, description?: string, options?: Omit<ToastOptions, 'variant'>) =>
    sonnerToast.success(title, {
      description,
      duration: 4000,
      ...options
    }),

  error: (title: string, description?: string, options?: Omit<ToastOptions, 'variant'>) =>
    sonnerToast.error(title, {
      description,
      duration: 6000,
      ...options
    }),

  warning: (title: string, description?: string, options?: Omit<ToastOptions, 'variant'>) =>
    sonnerToast.warning(title, {
      description,
      duration: 5000,
      ...options
    }),

  info: (title: string, description?: string, options?: Omit<ToastOptions, 'variant'>) =>
    sonnerToast.info(title, {
      description,
      duration: 4000,
      ...options
    }),

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success: typeof success === 'function' ? success : () => success,
      error: typeof error === 'function' ? error : () => error,
    })
  },

  dismiss: () => sonnerToast.dismiss(),

  loading: (title: string, description?: string) =>
    sonnerToast.loading(title, {
      description,
      duration: Infinity,
    })
}

export default toast