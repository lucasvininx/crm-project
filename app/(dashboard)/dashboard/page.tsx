import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { BarChart, CheckCircle, DollarSign, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

async function getStats() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Obter contagem de clientes
  const { count: customersCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Obter contagem de negócios
  const { count: dealsCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Obter valor total de negócios ganhos
  const { data: wonDeals } = await supabase.from("deals").select("value").eq("user_id", user.id).eq("status", "ganho")

  const totalWonValue = wonDeals?.reduce((acc, deal) => acc + (deal.value || 0), 0) || 0

  // Obter contagem de tarefas pendentes
  const { count: pendingTasksCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", false)

  return {
    customersCount: customersCount || 0,
    dealsCount: dealsCount || 0,
    totalWonValue,
    pendingTasksCount: pendingTasksCount || 0,
  }
}

async function getTodayTasks() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .gte("due_date", today.toISOString())
    .lt("due_date", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
    .order("due_date", { ascending: true })

  return tasks || []
}

async function getRecentDeals() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: deals } = await supabase
    .from("deals")
    .select(`
      *,
      customers (
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return deals || []
}

function StatsCards({ stats }: { stats: Awaited<ReturnType<typeof getStats>> }) {
  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.customersCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Negócios Ativos</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.dealsCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalWonValue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingTasksCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu CRM e principais métricas.</p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <StatsCards stats={getStats()} />
      </Suspense>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas de Hoje</TabsTrigger>
          <TabsTrigger value="deals">Negócios Recentes</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas para Hoje</CardTitle>
              <CardDescription>Lista de tarefas que precisam ser concluídas hoje.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando tarefas...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <TasksList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Negócios Recentes</CardTitle>
              <CardDescription>Últimos negócios adicionados ao sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando negócios...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <DealsList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function TasksList() {
  const tasks = await getTodayTasks()

  if (tasks.length === 0) {
    return <p className="text-muted-foreground">Nenhuma tarefa para hoje.</p>
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-muted-foreground">
              {task.description ? task.description.substring(0, 100) : "Sem descrição"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                task.priority === "high"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

async function DealsList() {
  const deals = await getRecentDeals()

  if (deals.length === 0) {
    return <p className="text-muted-foreground">Nenhum negócio recente.</p>
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <div key={deal.id} className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="font-medium">{deal.title}</p>
            <p className="text-sm text-muted-foreground">{deal.customers?.name || "Cliente não especificado"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                deal.status === "ganho"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : deal.status === "perdido"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : deal.status === "em_negociacao"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {deal.status === "ganho"
                ? "Ganho"
                : deal.status === "perdido"
                  ? "Perdido"
                  : deal.status === "em_negociacao"
                    ? "Em Negociação"
                    : "Novo"}
            </span>
            <span className="font-medium">{formatCurrency(deal.value || 0)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
