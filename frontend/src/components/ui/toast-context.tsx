import { createContext } from "react"
import { ToastActionElement, ToastProps } from "@/components/ui/toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export type ToastContextValue = {
  toast: (props: ToasterToast) => void
  dismiss: (toastId: string) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)
