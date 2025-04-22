"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EditTaskPageProps {
  params: {
    id: string
  }
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [deals, setDeals] = useState<{ id: string; title: string }[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    related_to_type: "",
    related_to_id: "",
    is_completed: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Buscar tarefa
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (taskError) {
          throw taskError
        }

        if (taskData) {
          setFormData({
            title: taskData.title || "",
            description: taskData.description || "",
            priority: taskData.priority || "medium",
            related_to_type: taskData.related_to_type || "",
            related_to_id: taskData.related_to_id || "",
            is_completed: taskData.is_completed || false,
          })

          if (taskData.due_date) {
            setDate(new Date(taskData.due_date))
          }
        }

        // Buscar clientes
        const { data: customersData } = await supabase
          .from("customers")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name")

        if (customersData) {
          setCustomers(customersData)
        }

        // Buscar negócios
        const { data: dealsData } = await supabase
          .from("deals")
          .select("id, title")
          .eq("user_id", user.id)
          .order("title")

        if (dealsData) {
          setDeals(dealsData)
        }
      } catch (error: any) {
        setError(error.message || "Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          ...formData,
          due_date: date ? date.toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      router.push(`/tasks/${params.id}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Erro ao atualizar tarefa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/tasks/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar Tarefa</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Tarefa</CardTitle>
            <CardDescription>Atualize os dados da tarefa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="related_to_type">Relacionado a</Label>
              <Select
                value={formData.related_to_type}
                onValueChange={(value) => {
                  handleSelectChange("related_to_type", value)
                  handleSelectChange("related_to_id", "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de relacionamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="deal">Negócio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.related_to_type === "customer" && (
              <div className="space-y-2">
                <Label htmlFor="related_to_id">Cliente</Label>
                <Select
                  value={formData.related_to_id}
                  onValueChange={(value) => handleSelectChange("related_to_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.related_to_type === "deal" && (
              <div className="space-y-2">
                <Label htmlFor="related_to_id">Negócio</Label>
                <Select
                  value={formData.related_to_id}
                  onValueChange={(value) => handleSelectChange("related_to_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id.toString()}>
                        {deal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="is_completed">Status</Label>
              <Select
                value={formData.is_completed ? "completed" : "pending"}
                onValueChange={(value) => handleSelectChange("is_completed", value === "completed" ? "true" : "false")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/tasks/${params.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
