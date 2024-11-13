export const CATEGORY_ORDER = ['SPENDING', 'SAVING', 'GIVING'] as const
export type TransactionCategory = typeof CATEGORY_ORDER[number] 