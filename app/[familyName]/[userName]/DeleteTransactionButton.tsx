'use client'

import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { useState } from "react"
import { deleteTransaction } from "./actions"
import { formatCurrency } from "@/lib/utils"

interface DeleteTransactionButtonProps {
    transactionId: string
    familyName: string
    userName: string
    description: string
    amount: number
    currencySymbol: string
}

export function DeleteTransactionButton({
    transactionId,
    familyName,
    userName,
    description,
    amount,
    currencySymbol,
}: DeleteTransactionButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <Trash2Icon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Delete Transaction</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this transaction?
                        <div className="mt-2 text-foreground">
                            <p><strong>Description:</strong> {description}</p>
                            <p><strong>Amount:</strong> {formatCurrency(amount, currencySymbol)}</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <form action={async (formData) => {
                        setOpen(false)
                        const formDataWithIds = new FormData()
                        formDataWithIds.append('transactionId', transactionId)
                        formDataWithIds.append('familyName', familyName)
                        formDataWithIds.append('userName', userName)
                        await deleteTransaction(formDataWithIds)
                    }}>
                        <Button
                            type="submit"
                            variant="destructive"
                        >
                            Delete
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 