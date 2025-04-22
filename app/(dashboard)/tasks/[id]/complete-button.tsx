"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle } from "lucide-react"

interface CompleteTaskButtonProps {
  id: string
  isCompleted: boolean
}

export function CompleteTaskButton({ id, isCompleted }: CompleteTaskButtonProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)

  const handleToggleComplete = async () => {
    setLoading(true)

    try {
      await supabase
        .from("tasks")
        .update({ is_completed: !isCompleted, updated_at: new Date().toISOString() })
        .eq("id", id)

      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleToggleComplete} disabled={loading} variant={isCompleted ? "outline" : "default"}>
      {isCompleted ? (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Marcar como não concluída
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Marcar como concluída
        </>
      )}
    </Button>
  )
}
