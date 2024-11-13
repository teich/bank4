"use client"

import { useFormState } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeartIcon, PiggyBankIcon, ShoppingCartIcon } from "lucide-react"
import { addTransaction } from "./actions"

const categoryIcons = {
    GIVING: HeartIcon,
    SAVING: PiggyBankIcon,
    SPENDING: ShoppingCartIcon,
}

interface TransactionFormProps {
    targetUserId: string
    currencySymbol: string
}

export function TransactionForm({ targetUserId, currencySymbol }: TransactionFormProps) {
    const initialState = { message: null, errors: {} }
    const [state, formAction] = useFormState(addTransaction, initialState)

    return (
        <form action={formAction} className="flex flex-wrap items-end gap-4">
            <div className="flex-grow min-w-[120px] max-w-[200px]">
                <label htmlFor="amount" className="block text-sm font-medium text-foreground/70 mb-1">
                    Amount
                </label>
                <div className="relative">
                    <Input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-6" 
                        step="0.01" 
                        required 
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {currencySymbol}
                    </span>
                </div>
            </div>
            <div className="flex-grow">
                <label htmlFor="description" className="block text-sm font-medium text-foreground/70 mb-1">
                    Description
                </label>
                <Input id="description" name="description" placeholder="Enter description" required />
            </div>
            <div className="w-40">
                <label htmlFor="category" className="block text-sm font-medium text-foreground/70 mb-1">
                    Category
                </label>
                <Select name="category" required>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(categoryIcons).map(([category, Icon]) => (
                            <SelectItem key={category} value={category}>
                                <span className="flex items-center">
                                    <Icon size={16} className="mr-2" />
                                    {category}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <input type="hidden" name="targetUserId" value={targetUserId} />
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300">
                Add
            </Button>
            {state?.message && (
                <p className="w-full text-sm text-red-500">{state.message}</p>
            )}
        </form>
    )
} 