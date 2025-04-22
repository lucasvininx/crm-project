"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    company_name: "",
    company_whatsapp: "",
    theme: "light",
    notification_email: true,
    notification_app: true,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

        if (error) {
          throw error
        }

        if (data) {
          setSettings({
            company_name: data.company_name || "",
            company_whatsapp: data.company_whatsapp || "",
            theme: data.theme || "light",
            notification_email: data.notification_email || true,
            notification_app: data.notification_app || true,
          })
        }
      } catch (error: any) {
        setError(error.message || "Erro ao carregar configurações")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { error } = await supabase
        .from("user_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      setSuccess("Configurações salvas com sucesso!")
    } catch (error: any) {
      setError(error.message || "Erro ao salvar configurações")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações do sistema.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Configure as informações da sua empresa que serão usadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleChange}
                  placeholder="Nome da sua empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_whatsapp">WhatsApp da Empresa</Label>
                <Input
                  id="company_whatsapp"
                  name="company_whatsapp"
                  value={settings.company_whatsapp}
                  onChange={handleChange}
                  placeholder="Ex: 5511999999999 (com código do país)"
                />
                <p className="text-xs text-muted-foreground">
                  Usado para enviar mensagens aos clientes. Inclua o código do país (Ex: 55 para Brasil).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Configure como você deseja receber notificações do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notification_email">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações por email sobre tarefas e negócios.
                  </p>
                </div>
                <Switch
                  id="notification_email"
                  checked={settings.notification_email}
                  onCheckedChange={(checked) => handleSwitchChange("notification_email", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notification_app">Notificações no Aplicativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações dentro do aplicativo sobre tarefas e negócios.
                  </p>
                </div>
                <Switch
                  id="notification_app"
                  checked={settings.notification_app}
                  onCheckedChange={(checked) => handleSwitchChange("notification_app", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  O tema "Sistema" segue as configurações do seu dispositivo.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
