"use client";

import { useForm } from "react-hook-form";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Trash2, PlusCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ScholarshipManager = () => {
  const utils = trpc.useUtils();
  const [scholarships] = trpc.scholarship.getAllAdmin.useSuspenseQuery();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { 
      name: "", 
      amount: 0, 
      description: "", 
      scholarshipUrl: "" 
    },
  });

  // Mutations
  const create = trpc.scholarship.create.useMutation({
    onSuccess: () => {
      utils.scholarship.getAllAdmin.invalidate();
      toast.success("Scholarship published");
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggle = trpc.scholarship.update.useMutation({
    onSuccess: () => utils.scholarship.getAllAdmin.invalidate(),
    onError: () => toast.error("Update failed"),
  });

  const remove = trpc.scholarship.delete.useMutation({
    onSuccess: () => {
      utils.scholarship.getAllAdmin.invalidate();
      toast.success("Deleted");
    },
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* 1. INPUT CARD */}
      <Card className="w-full lg:w-87.5 shrink-0 shadow-sm border-muted-foreground/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Add Scholarship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleSubmit((d) => create.mutate({ ...d, isActive: false }))} 
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Name</label>
              <Input {...register("name")} placeholder="e.g. Merit Award" required />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Official URL</label>
              <Input 
                {...register("scholarshipUrl")} 
                type="url" 
                placeholder="https://example.com/apply" 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Amount (₦)</label>
              <Input 
                type="number" 
                {...register("amount", { valueAsNumber: true })} 
                placeholder="20000" 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Description</label>
              <Textarea 
                {...register("description")} 
                placeholder="Details..." 
                className="h-20 resize-none" 
                required 
              />
            </div>

            <Button className="w-full bg-[#1a2b4b]" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : "Publish"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. DATA TABLE */}
      <div className="flex-1 w-full overflow-hidden border rounded-xl bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Scholarship</TableHead>
              <TableHead className="font-bold text-slate-700">Amount</TableHead>
              <TableHead className="hidden md:table-cell font-bold text-slate-700 text-center">Link</TableHead>
              <TableHead className="text-center font-bold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scholarships.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                  No scholarships in the database.
                </TableCell>
              </TableRow>
            )}
            {scholarships.map((s) => (
              <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 max-w-45">
                    {/* Handled null with ?? "" */}
                    {s.scholarshipUrl ?? "No URL provided"}
                  </div>
                </TableCell>
                <TableCell className="text-[#28a745] font-bold">
                  ₦{s.amount.toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex justify-center">
                    {s.scholarshipUrl ? (
                      <a 
                        href={s.scholarshipUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch 
                      checked={s.isActive ?? false} 
                      onCheckedChange={(val) => toggle.mutate({ id: s.id, isActive: val })}
                      disabled={toggle.isPending}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right px-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if(window.confirm("Are you sure you want to delete this?")) {
                        remove.mutate({ id: s.id });
                      }
                    }}
                    disabled={remove.isPending}
                    className="hover:text-red-600 hover:bg-red-50 transition-all"
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