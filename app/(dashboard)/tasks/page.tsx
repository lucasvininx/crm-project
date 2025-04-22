import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

async function getTasks() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("tasks")
    .select(
      `
      *,
      customers:related_to_id (
        id,
        name
      ),
      deals:related_to_id (
        id,
        title
      )
    `
    )
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  return data || [];
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe suas atividades.
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={tasks} />
    </div>
  );
}
