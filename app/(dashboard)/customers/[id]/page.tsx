import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Edit } from "lucide-react"
import { DeleteCustomerButton } from "./delete-button"
import { WhatsAppButton } from "./whatsapp-button"

interface CustomerPageProps {
  params: {
    id: string
  }
}

async function getCustomer(id: string) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.from("customers").select("*").eq("id", id).eq("user_id", user.id).single()

  return data
}

async function getCustomerDeals(customerId: string) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("customer_id", customerId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

async function getCustomerTasks(customerId: string) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("related_to_type", "customer")
    .eq("related_to_id", customerId)
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })

  return data || []
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const customer = await getCustomer(params.id)

  if (!customer) {
    notFound()
  }

  const deals = await getCustomerDeals(customer.id)
  const tasks = await getCustomerTasks(customer.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <WhatsAppButton customer={customer} />
          <Button variant="outline" asChild>
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteCustomerButton id={customer.id} name={customer.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{customer.email || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p>{customer.phone || "Não informado"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Empresa</p>
              <p>{customer.company || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Endereço</p>
              <p>{customer.address || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Observações</p>
              <p className="whitespace-pre-line">{customer.notes || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
              <p>{formatDate(customer.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negócios</CardTitle>
            <CardDescription>Negócios relacionados a este cliente.</CardDescription>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <p className="text-muted-foreground">Nenhum negócio encontrado.</p>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                        {deal.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatDate(deal.created_at)}</p>
                    </div>
                    <div>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/deals/new?customerId=${customer.id}`}>Novo Negócio</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
            <CardDescription>Tarefas relacionadas a este cliente.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                        {task.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {task.due_date ? formatDate(task.due_date) : "Sem data definida"}
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
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.is_completed
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {task.is_completed ? "Concluída" : "Pendente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/tasks/new?relatedToType=customer&relatedToId=${customer.id}`}>Nova Tarefa</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
