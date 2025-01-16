"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateEventSchema } from "@/schemas";
import { categories } from "@/components/altre/categories";

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
import { createEvent } from "@/actions/event";
import { useState, useTransition } from "react";
import { FaEuroSign } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { Controller } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/it";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "./file-uploader";
import { useUploadThing } from "@/lib/uploadthing";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "lucide-react";


dayjs.locale("it");

interface EventFormProps {
  userIdprops: string;
  type: string;
}


export const EventForm = ({ userIdprops, type }: EventFormProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const action = type //todo
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");
  const [files, setFiles] = useState<File[]>([]);


  const form = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageSrc: "",
      category: "",
      location: "",
      isFree: true,
      eventDate: new Date(),
      userId: userIdprops,
      price: "0",
    },
  });

  async function handleImageUpload(files: File[], defaultImageSrc: string) {
    let uploadedImageUrl = defaultImageSrc;
    if (files.length > 0) {
      const uploadedImages = await startUpload(files);
      if (!uploadedImages || uploadedImages.length === 0) {
        return;
      }
      uploadedImageUrl = uploadedImages[0].url;
    }
    return uploadedImageUrl;
  }

  const handleEventDateTime = (date: Date, time: Date): Date => {
    if (!date || !time) {
      throw new Error("Sia la data che l'orario sono obbligatori.");
    }
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    return combined;
  };

  async function onSubmit(values: z.infer<typeof CreateEventSchema>) {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const combinedDateTime = handleEventDateTime(
      new Date(values.eventDateDay),
      new Date(values.eventTime)
    );

    let uploadedImageUrl = await handleImageUpload(files, values.imageSrc);
    if (!uploadedImageUrl) {
      uploadedImageUrl = values.imageSrc;
    }

    const updatedValues = {
      ...values,
      eventDate: combinedDateTime,
      imageSrc: uploadedImageUrl,
      userId: userIdprops,
    };

    startTransition(() => {
      createEvent(updatedValues)
        .then((data) => {
          setError(data?.error);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    });
  }

if(isSubmitting){
  return (
    <Loader />
  )
}
  return (
   
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="rounded-md border-gray-300 focus:ring focus:ring-blue-500"
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem
                          key={item.label}
                          value={item.label}
                          disabled={isSubmitting}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
           
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <FormField
    control={form.control}
    name="imageSrc"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Immagine</FormLabel>
        <FormControl >
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
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Descrizione</FormLabel>
        <FormControl>
       
          <textarea
            {...field}
            placeholder="Inserisci la descrizione dell'evento"
            disabled={isSubmitting}
            className="flex items-center gap-2 border rounded-md px-3 py-2 w-full h-24 resize-none"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Prezzo e Ingresso libero */}
  <div className="flex items-center gap-6">
    <FormField
      control={form.control}
      name="price"
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>Prezzo</FormLabel>
          <FormControl>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2">
              <FaEuroSign size={16} className="text-gray-500" />
              <Input
                {...field}
                placeholder="Prezzo dell'evento"
                type="text"
                disabled={isSubmitting}
                className="flex-1 border-none focus:ring-0"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="isFree"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <FormLabel className="mr-4">Ingresso libero</FormLabel>
          <FormControl>
            <Checkbox
              onCheckedChange={field.onChange}
              checked={field.value}
              className="h-5 w-5"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>

  {/* Campo Luogo */}
  <FormField
    control={form.control}
    name="location"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Luogo</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2 border rounded-md px-3 py-2">
            <FiMapPin size={16} className="text-gray-500" />
            <Input
              {...field}
              placeholder="Luogo dell'evento"
              type="text"
              disabled={isSubmitting}
              className="flex-1 border-none focus:ring-0"
            />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="eventDateDay"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seleziona la data</FormLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
                  <Controller
                    name="eventDateDay"
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <MobileDatePicker
                        label="Data"
                        value={controllerField.value ? dayjs(controllerField.value) : null}
                        onChange={(newValue) =>
                          controllerField.onChange(newValue?.toDate())
                        }
                        className="w-full border rounded-md"
                      />
                    )}
                  />
                </LocalizationProvider>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventTime"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seleziona l&apos;orario</FormLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
                  <Controller
                    name="eventTime"
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <MobileTimePicker
                        label="Orario"
                        value={controllerField.value ? dayjs(controllerField.value) : null}
                        onChange={(newValue) =>
                          controllerField.onChange(newValue?.toDate())
                        }
                        ampm={false}
                        minutesStep={5}
                        className="w-full border rounded-md"
                      />
                    )}
                  />
                </LocalizationProvider>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            disabled={isSubmitting}
          >
            Crea evento
          </Button>
        </form>
      </Form>
   
  );
};

export default EventForm;
