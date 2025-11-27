import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant: string | undefined | null) => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
      default:
        return <Info className="h-5 w-5 text-blue-300 flex-shrink-0" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant as any} {...props}>
            <div className="flex items-start gap-3 flex-1">
              {getIcon(variant)}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
