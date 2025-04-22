import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DealKanban } from "./kanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

async function getDeals() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("deals")
    .select(
      `
      *,
      customers (
        id,
        name
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Negócios</h1>
          <p className="text-muted-foreground">
            Gerencie seus negócios e acompanhe o funil de vendas.
          </p>
        </div>
        <Button asChild>
          <Link href="/deals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Negócio
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="space-y-4">
          <DealKanban deals={deals} />
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <DataTable columns={columns} data={deals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
