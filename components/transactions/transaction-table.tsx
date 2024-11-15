"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Transaction } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Trash2Icon } from "lucide-react"
import { DeleteTransactionButton } from "@/components/delete-transaction-button"

const getCategoryBadgeStyles = (theme: string | undefined) => ({
  SPENDING: {
    className: theme === 'dark'
      ? 'bg-blue-950/50 text-blue-200 border-blue-800'
      : 'bg-blue-100 text-blue-700 border-blue-300'
  },
  SAVING: {
    className: theme === 'dark'
      ? 'bg-green-950/50 text-green-200 border-green-800'
      : 'bg-green-100 text-green-700 border-green-300'
  },
  GIVING: {
    className: theme === 'dark'
      ? 'bg-pink-950/50 text-pink-200 border-pink-800'
      : 'bg-pink-100 text-pink-700 border-pink-300'
  }
})

interface TransactionWithCreator extends Transaction {
  createdBy: {
    id: string
    name: string | null
  }
}

interface TransactionTableProps {
  data: TransactionWithCreator[]
  currencySymbol: string
  isParent: boolean
  currentUserId: string
}

export function TransactionTable({ data, currencySymbol, isParent, currentUserId }: TransactionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const { theme } = useTheme()
  const categoryBadgeStyles = getCategoryBadgeStyles(theme)

  const columns: ColumnDef<TransactionWithCreator>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return new Date(row.getValue("date")).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as keyof typeof categoryBadgeStyles
        return (
          <Badge className={categoryBadgeStyles[category].className}>
            {category}
          </Badge>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = Number(row.getValue("amount"))
        return (
          <span className={amount < 0 ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"}>
            {formatCurrency(amount, currencySymbol)}
          </span>
        )
      },
    },
    {
      accessorKey: "createdBy.name",
      header: "Created By",
      cell: ({ row }) => {
        const isCurrentUser = row.original.createdBy.id === currentUserId
        return (
          <span className={isCurrentUser ? "font-medium" : "text-muted-foreground"}>
            {isCurrentUser ? "Me" : row.original.createdBy.name}
          </span>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isCreator = row.original.createdById === currentUserId
        const canDelete = isParent || isCreator
        
        return canDelete ? (
          <div className="flex justify-end">
            <DeleteTransactionButton 
              transactionId={row.original.id}
              icon={<Trash2Icon className="h-4 w-4" />}
            />
          </div>
        ) : null
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Filter descriptions..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="font-semibold h-11"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="py-3 px-4 font-medium"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} total transactions
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <div className="flex items-center gap-1 text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 