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
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export type Customer = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  created_at: string
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          <Link href={`/customers/${row.original.id}`} className="hover:underline">
            {row.getValue("name")}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <div>{row.getValue("email") || "-"}</div>
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      return <div>{row.getValue("phone") || "-"}</div>
    },
  },
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ row }) => {
      return <div>{row.getValue("company") || "-"}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: "Data de Cadastro",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("created_at"))}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original
      const router = useRouter()
      const supabase = getSupabaseBrowserClient()

      const handleDelete = async () => {
        if (confirm(`Tem certeza que deseja excluir o cliente ${customer.name}?`)) {
          await supabase.from("customers").delete().eq("id", customer.id)

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(customer.id)}>Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/customers/${customer.id}`} className="flex w-full">
                Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/customers/${customer.id}/edit`} className="flex w-full">
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
