"use client";

import { useForm } from "react-hook-form";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { PlusCircle, Loader2, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const TeacherManager = () => {
  const utils = trpc.useUtils();
  const [teachers] = trpc.teacher.getAll.useSuspenseQuery();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: "", whatsappNumber: "", subjects: "", topics: "" }
  });

  const create = trpc.teacher.create.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      toast.success("Teacher added successfully");
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.teacher.delete.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      toast.success("Teacher removed");
    },
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* FORM CARD */}
      <Card className="w-full lg:w-[380px] shrink-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Add New Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Full Name</label>
              <Input {...register("name")} placeholder="e.g. Mr. Samuel Okon" required />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">WhatsApp (With Country Code)</label>
              <Input {...register("whatsappNumber")} placeholder="e.g. 2348012345678" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Subjects</label>
              <Input {...register("subjects")} placeholder="e.g. Mathematics, Physics" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Specific Topics</label>
              <Input {...register("topics")} placeholder="e.g. Calculus, Algebra, Mechanics" required />
            </div>

            <Button className="w-full bg-[#1a2b4b]" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : "Register Teacher"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* DATA TABLE */}
      <div className="flex-1 w-full border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Teacher</TableHead>
              <TableHead className="font-bold text-slate-700">Expertise</TableHead>
              <TableHead className="text-right font-bold text-slate-700 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((t) => (
              <TableRow key={t.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                    <MessageCircle className="w-3 h-3" /> {t.whatsappNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-bold text-slate-700">{t.subjects}</div>
                  <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]">{t.topics}</div>
                </TableCell>
                <TableCell className="text-right px-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove.mutate({ id: t.id })}
                    disabled={remove.isPending}
                    className="hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};