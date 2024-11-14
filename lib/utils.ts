import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAmount = (amount: number, currencySymbol: string) => {
    const absAmount = Math.abs(amount / 100).toFixed(2) // Convert cents to dollars
    return `${currencySymbol}${absAmount}`
}

export function formatCurrency(amount: number, currencySymbol: string): string {
    return `${currencySymbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}
