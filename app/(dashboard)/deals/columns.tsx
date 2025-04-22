"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export type Deal = {
  id: string
  title: string
  customer_id: string | null
  value: number | null
  status: string
  expected_close_date: string | null
  created_at: string
  customers?: {
    id: string
    name: string
  } | null
}

export const columns: ColumnDef<Deal>[] = [
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          <Link href={`/deals/${row.original.id}`} className="hover:underline">
            {row.getValue("title")}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "customers.name",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customers

      if (!customer) {
        return <div>-</div>
      }

      return (
        <div>
          <Link href={`/customers/${customer.id}`} className="hover:underline">
            {customer.name}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "value",
    header: "Valor",
    cell: ({ row }) => {
      const value = row.getValue("value") as number | null
      return <div>{value ? formatCurrency(value) : "-"}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              status === "ganho"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : status === "perdido"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : status === "em_negociacao"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {status === "ganho"
              ? "Ganho"
              : status === "perdido"
                ? "Perdido"
                : status === "em_negociacao"
                  ? "Em Negociação"
                  : "Novo"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "expected_close_date",
    header: "Data Prevista",
    cell: ({ row }) => {
      const date = row.getValue("expected_close_date") as string | null
      return <div>{date ? formatDate(date) : "-"}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("created_at"))}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const deal = row.original
      const router = useRouter()
      const supabase = getSupabaseBrowserClient()

      const handleDelete = async () => {
        if (confirm(`Tem certeza que deseja excluir o negócio ${deal.title}?`)) {
          await supabase.from("deals").delete().eq("id", deal.id)

          router.refresh()
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(deal.id)}>Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/deals/${deal.id}`} className="flex w-full">
                Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/deals/${deal.id}/edit`} className="flex w-full">
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
