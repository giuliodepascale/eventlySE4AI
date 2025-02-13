"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createTicketType, updateTicketType } from "@/actions/ticket-type";
import { CreateTicketTypeSchema, UpdateTicketTypeSchema } from "@/schemas";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Interfaccia base per il ticket usata nel form, omettendo i campi non necessari
interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isActive: boolean;
  // Questi campi non verranno usati nel form:
  sold?: number;
  createdAt?: Date;
  maxPerUser?: number | null;
}

interface TicketTypeFormProps {
  eventId: string;
  // Omit per escludere i campi non gestiti dal form
  ticketType?: Omit<TicketType, "sold" | "createdAt" | "maxPerUser">;
  onClose?: () => void;
}

export const TicketTypeForm: React.FC<TicketTypeFormProps> = ({
  eventId,
  ticketType,
  onClose,
}) => {
  const isUpdateMode = !!ticketType;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateTicketTypeSchema>>({
    resolver: zodResolver(isUpdateMode ? UpdateTicketTypeSchema : CreateTicketTypeSchema),
    defaultValues: isUpdateMode
      ? {
          eventId,
          name: ticketType?.name || "",
          description: ticketType?.description || "",
          price: ticketType?.price || 0,
          quantity: ticketType?.quantity || 0,
        }
      : {
          eventId,
          name: "",
          description: "",
          price: 0,
          quantity: 0,
        },
  });

  async function onSubmit(values: z.infer<typeof CreateTicketTypeSchema>) {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isUpdateMode && ticketType) {
        // In modalità update inviamo il nuovo valore assoluto per "quantity" e gli altri campi
        const result = await updateTicketType(ticketType.id, {
          ...values,
          isActive: ticketType.isActive,
        });
        if (result?.error) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
      } else {
        const result = await createTicketType(values);
        if (result?.error) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
      }
      // In caso di successo aggiorna la pagina e chiudi il form
      router.refresh();
      if (onClose) onClose();
    } catch (err) {
      setError("Errore in fase di salvataggio.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-gray-100 rounded-lg shadow-md mb-4">
        {error && <p className="text-red-500">{error}</p>}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Biglietto</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Inserisci il nome del biglietto" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Inserisci una descrizione" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantità</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg" disabled={isSubmitting}>
            {isUpdateMode ? "Aggiorna Biglietto" : "Crea Biglietto"}
          </Button>
          {onClose && (
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Annulla
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default TicketTypeForm;
