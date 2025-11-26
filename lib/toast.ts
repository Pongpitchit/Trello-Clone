import { toast } from "sonner";

export function Toast(message: string) {
  toast.success(message);
}
export function ToastSuccess(message: string) {
  toast.success(message);
}
export function ToastInfo(message: string) {
  toast.info(message);
}
export function ToastWarning(message: string) {
  toast.warning(message);
}
export function ToastError(message: string) {
  toast.error(message);
}
