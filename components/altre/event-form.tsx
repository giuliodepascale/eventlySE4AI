"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateEventSchema } from "@/schemas";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { createEvent } from "@/actions/event"; // Import dell'action
import { useState, useTransition } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

export const EventForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();


   const userId = useCurrentUser()?.id; // Ottieni l'ID dell'utente corrente

  const form = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageSrc: "",
      category: "",
      userId: userId,
      price: undefined,
      isFree: false,
    },
  });

  const onSubmit = (values: z.infer<typeof CreateEventSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      createEvent(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setSuccess("Evento creato con successo!");
          }
        })
        .catch((err) => {
          setError("Si è verificato un errore durante la creazione dell'evento.");
          console.error(err);
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Crea Evento"
      backButtonLabel="Torna indietro"
      backButtonHref="/dashboard"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Inserisci il titolo dell'evento"
                      type="text"
                      disabled={isPending}
                    />
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
                    <Input
                      {...field}
                      placeholder="Descrizione dell'evento"
                      type="text"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageSrc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Immagine</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="URL dell'immagine"
                      type="url"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Categoria dell'evento"
                      type="text"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezzo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Prezzo dell'evento"
                      type="number"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           {//checkbox isFree
            }
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full" disabled={isPending}>
              Crea Evento
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default EventForm;
