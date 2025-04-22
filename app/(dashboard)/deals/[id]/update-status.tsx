"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock, MoreHorizontal } from "lucide-react"

interface UpdateDealStatusProps {
  id: string
  currentStatus: string
}

export function UpdateDealStatus({ id, currentStatus }: UpdateDealStatusProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)

  const handleUpdateStatus = async (status: string) => {
    if (status === currentStatus) return

    setLoading(true)

    try {
      await supabase.from("deals").update({ status, updated_at: new Date().toISOString() }).eq("id", id)

      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {currentStatus === "ganho" ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Ganho
            </>
          ) : currentStatus === "perdido" ? (
            <>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Perdido
            </>
          ) : currentStatus === "em_negociacao" ? (
            <>
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              Em Negociação
            </>
          ) : (
            <>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Novo
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleUpdateStatus("novo")} disabled={currentStatus === "novo"}>
          <MoreHorizontal className="mr-2 h-4 w-4" />
          Novo
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleUpdateStatus("em_negociacao")}
          disabled={currentStatus === "em_negociacao"}
        >
          <Clock className="mr-2 h-4 w-4 text-blue-500" />
          Em Negociação
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUpdateStatus("ganho")} disabled={currentStatus === "ganho"}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Ganho
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUpdateStatus("perdido")} disabled={currentStatus === "perdido"}>
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
          Perdido
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
