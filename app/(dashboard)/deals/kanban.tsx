"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Deal } from "./columns"

interface DealKanbanProps {
  deals: Deal[]
}

export function DealKanban({ deals }: DealKanbanProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Agrupar negócios por status
  const columns = {
    novo: deals.filter((deal) => deal.status === "novo"),
    em_negociacao: deals.filter((deal) => deal.status === "em_negociacao"),
    ganho: deals.filter((deal) => deal.status === "ganho"),
    perdido: deals.filter((deal) => deal.status === "perdido"),
  }

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId)
    setDraggingId(dealId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData("dealId")
    setDraggingId(null)

    if (dealId) {
      // Atualizar o status do negócio no Supabase
      await supabase.from("deals").update({ status }).eq("id", dealId)
      router.refresh()
    }
  }

  const getColumnTitle = (status: string) => {
    switch (status) {
      case "novo":
        return "Novo"
      case "em_negociacao":
        return "Em Negociação"
      case "ganho":
        return "Ganho"
      case "perdido":
        return "Perdido"
      default:
        return status
    }
  }

  const getColumnColor = (status: string) => {
    switch (status) {
      case "novo":
        return "bg-gray-100 dark:bg-gray-800"
      case "em_negociacao":
        return "bg-blue-50 dark:bg-blue-950"
      case "ganho":
        return "bg-green-50 dark:bg-green-950"
      case "perdido":
        return "bg-red-50 dark:bg-red-950"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(columns).map(([status, statusDeals]) => (
        <div
          key={status}
          className={`rounded-lg ${getColumnColor(status)} p-4`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h3 className="mb-4 font-medium">
            {getColumnTitle(status)} ({statusDeals.length})
          </h3>
          <div className="space-y-3">
            {statusDeals.map((deal) => (
              <Card
                key={deal.id}
                className={`cursor-move ${draggingId === deal.id ? "opacity-50" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, deal.id)}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">
                    <Link href={`/deals/${deal.id}`} className="hover:underline">
                      {deal.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="text-xs text-muted-foreground">
                    {deal.customers?.name && <div className="mb-1">Cliente: {deal.customers.name}</div>}
                    {deal.value && <div className="font-medium">{formatCurrency(deal.value)}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {statusDeals.length === 0 && (
              <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                Nenhum negócio
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
