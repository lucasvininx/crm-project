"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { generateWhatsAppLink } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface WhatsAppButtonProps {
  customer: {
    id: string
    name: string
    phone: string | null
  }
}

export function WhatsAppButton({ customer }: WhatsAppButtonProps) {
  const supabase = getSupabaseBrowserClient()
  const [companyWhatsApp, setCompanyWhatsApp] = useState<string | null>(null)

  useEffect(() => {
    const getSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("user_settings").select("company_whatsapp").eq("user_id", user.id).single()

        if (data) {
          setCompanyWhatsApp(data.company_whatsapp)
        }
      }
    }

    getSettings()
  }, [supabase])

  if (!customer.phone) {
    return null
  }

  const handleWhatsAppClick = () => {
    const text = `Olá ${customer.name}, tudo bem?`
    const link = generateWhatsAppLink(customer.phone || "", text)
    window.open(link, "_blank")
  }

  return (
    <Button variant="outline" onClick={handleWhatsAppClick}>
      <MessageSquare className="mr-2 h-4 w-4" />
      WhatsApp
    </Button>
  )
}
