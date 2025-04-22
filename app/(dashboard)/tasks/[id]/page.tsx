import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Edit } from "lucide-react"
import { DeleteTaskButton } from "./delete-button"
import { CompleteTaskButton } from "./complete-button"

interface TaskPageProps {
  params: {
    id: string
  }
}

async function getTask(id: string) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.from("tasks").select("*").eq("id", id).eq("user_id", user.id).single()

  return data
}

async function getRelatedEntity(type: string | null, id: string | null) {
  if (!type || !id) return null

  const supabase = getSupabaseServerClient()

  if (type === "customer") {
    const { data } = await supabase.from("customers").select("id, name").eq("id", id).single()
    return data
  }

  if (type === "deal") {
    const { data } = await supabase.from("deals").select("id, title").eq("id", id).single()
    return data
  }

  return null
}

export default async function TaskPage({ params }: TaskPageProps) {
  const task = await getTask(params.id)

  if (!task) {
    notFound()
  }

  const relatedEntity = await getRelatedEntity(task.related_to_type, task.related_to_id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          {task.is_completed && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Concluída
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CompleteTaskButton id={task.id} isCompleted={task.is_completed} />
          <Button variant="outline" asChild>
            <Link href={`/tasks/${task.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteTaskButton id={task.id} title={task.title} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Tarefa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p className="whitespace-pre-line">{task.description || "Sem descrição"}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
                <p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Vencimento</p>
                <p>{task.due_date ? formatDate(task.due_date) : "Sem data definida"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Relacionado a</p>
              {relatedEntity ? (
                <p>
                  {task.related_to_type === "customer" ? (
                    <>
                      Cliente:{" "}
                      <Link href={`/customers/${relatedEntity.id}`} className="text-primary hover:underline">
                        {relatedEntity.name}
                      </Link>
                    </>
                  ) : task.related_to_type === "deal" ? (
                    <>
                      Negócio:{" "}
                      <Link href={`/deals/${relatedEntity.id}`} className="text-primary hover:underline">
                        {relatedEntity.title}
                      </Link>
                    </>
                  ) : (
                    "Não relacionado"
                  )}
                </p>
              ) : (
                <p>Não relacionado</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p>{formatDate(task.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
              <p>{formatDate(task.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
