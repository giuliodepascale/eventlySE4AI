"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateEventSchema } from "@/schemas";
import { categories } from "@/components/altre/categories";
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
import { useRouter } from "next/navigation";
import { FaEuroSign } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {FileUploader} from "./file-uploader";

interface EventFormProps {
  userId: string;
  type: string
}


export const EventForm = ({userId, type}: EventFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageSrc: "",
      category: "",
      location: "",
      userId: userId,
      price: 0,
      isFree: false,
    },
  });

  const onSubmit = (values: z.infer<typeof CreateEventSchema>) => {
    console.log("arrivo client")
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
      backButtonLabel="Torna alla home"
      backButtonHref="/"
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
                  <FormLabel>Immagine</FormLabel>
                  <FormControl>
                    <FileUploader 
                      onFieldChange={field.onChange}
                      imageUrl={field.value}
                      setFiles={setFiles}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item.label} value={item.label}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Prezzo</FormLabel>
                  <FormControl>
                  <div className="flex items-center gap-2 rounded-lg  py-2">
                  <FaEuroSign size={16} className="text-gray-500" />
                    <Input
                      {...field}
                      placeholder="Prezzo dell'evento"
                      type="number"
                      disabled={isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           </div>
           <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>Luogo</FormLabel>
                  <FormControl>
                  <div className="flex items-center gap-2 rounded-lg  py-2 w-full">
                  <FiMapPin  size={16} className="text-gray-500" />
                    <Input
                      {...field}
                      placeholder="Luogo dell'evento"
                      type="text"
                      disabled={isPending}
                       className="flex-1 focus:ring-0 w-full"
                    />
                  </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           </div>
           
           {//checkbox isFree TODO
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
