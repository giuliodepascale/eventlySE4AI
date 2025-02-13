"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateTicketTypeSchema } from "@/schemas/index";
import { updateTicketType } from "@/actions/ticket-type";
import { z } from "zod";

interface TicketUpdateFormProps {
  eventId: string;
  ticketTypeId: string;
  defaultValues: {
    name: string;
    description?: string;
    price?: number;
    quantityDelta: number;
    isActive: boolean;
  };
  onSuccess: () => void;
}

type UpdateTicketFormValues = z.infer<typeof UpdateTicketTypeSchema>;

export default function TicketUpdateForm({
  eventId,
  ticketTypeId,
  defaultValues,
  onSuccess,
}: TicketUpdateFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<UpdateTicketFormValues>({
    resolver: zodResolver(UpdateTicketTypeSchema),
    defaultValues: { eventId, ...defaultValues },
  });

  const onSubmit = async (values: UpdateTicketFormValues) => {
    const result = await updateTicketType(ticketTypeId, values);
    if (result && result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("name")}
        placeholder="Nome del biglietto"
        required
        className="border p-2 rounded w-full"
      />
      <textarea
        {...register("description")}
        placeholder="Descrizione"
        className="border p-2 rounded w-full"
      />
      <input
        type="number"
        {...register("price", { valueAsNumber: true })}
        placeholder="Prezzo in centesimi (0 per gratuito)"
        className="border p-2 rounded w-full"
      />
      <input
        type="number"
        {...register("quantityDelta", { valueAsNumber: true })}
        placeholder="Variazione quantità"
        className="border p-2 rounded w-full"
      />
      <label className="flex items-center gap-2">
        Attivo:
        <input
          type="checkbox"
          {...register("isActive")}
          defaultChecked={defaultValues.isActive}
        />
      </label>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Aggiorna Biglietto
      </button>
    </form>
  );
}
