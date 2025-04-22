"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

export type Task = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  is_completed: boolean
  priority: string
  related_to_type: string | null
  related_to_id: string | null
  created_at: string
  updated_at: string
  user_id: string
  customers?: {
    id: string
    name: string
  } | null
  deals?: {
    id: string
    title: string
  } | null
}

export const columns: ColumnDef<Task>[] = [
  {
    id: "completed",
    header: "",
    cell: ({ row }) => {
      const task = row.original
      const router = useRouter()
      const supabase = getSupabaseBrowserClient()

      const toggleCompleted = async () => {
        await supabase
          .from("tasks")
          .update({ is_completed: !task.is_completed, updated_at: new Date().toISOString() })
          .eq("id", task.id)

        router.refresh()
      }

      return (
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={toggleCompleted}
          aria-label={task.is_completed ? "Marcar como não concluída" : "Marcar como concluída"}
        />
      )
    },
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      const task = row.original
      return (
        <div className={`font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
          <Link href={`/tasks/${task.id}`} className="hover:underline">
            {task.title}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Prioridade",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string

      return (
        <div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              priority === "high"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : priority === "medium"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "due_date",
    header: "Data de Vencimento",
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string | null
      return <div>{date ? formatDate(date) : "-"}</div>
    },
  },
  {
    accessorKey: "related_to_type",
    header: "Relacionado a",
    cell: ({ row }) => {
      const task = row.original

      if (!task.related_to_type || !task.related_to_id) {
        return <div>-</div>
      }

      if (task.related_to_type === "customer" && task.customers) {
        return (
          <div>
            <span className="text-xs text-muted-foreground">Cliente:</span>{" "}
            <Link href={`/customers/${task.customers.id}`} className="hover:underline">
              {task.customers.name}
            </Link>
          </div>
        )
      }

      if (task.related_to_type === "deal" && task.deals) {
        return (
          <div>
            <span className="text-xs text-muted-foreground">Negócio:</span>{" "}
            <Link href={`/deals/${task.deals.id}`} className="hover:underline">
              {task.deals.title}
            </Link>
          </div>
        )
      }

      return <div>-</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original
      const router = useRouter()
      const supabase = getSupabaseBrowserClient()

      const handleDelete = async () => {
        if (confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
          await supabase.from("tasks").delete().eq("id", task.id)
          router.refresh()
        }
      }

      const toggleCompleted = async () => {
        await supabase
          .from("tasks")
          .update({ is_completed: !task.is_completed, updated_at: new Date().toISOString() })
          .eq("id", task.id)

        router.refresh()
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
            <DropdownMenuItem onClick={toggleCompleted}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {task.is_completed ? "Marcar como não concluída" : "Marcar como concluída"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/tasks/${task.id}`} className="flex w-full">
                Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/tasks/${task.id}/edit`} className="flex w-full">
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
