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

import { Controller } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";


import dayjs from "dayjs";
import "dayjs/locale/it";

import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';

// Imposta la localizzazione italiana per dayjs
dayjs.locale("it");






import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {FileUploader} from "./file-uploader";

import { useUploadThing } from "@/lib/uploadthing";



interface EventFormProps {
  userId: string;
  type: string
}


export const EventForm = ({userId, type}: EventFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();



  const { uploadFiles } = useUploadThing;

  

  const [files, setFiles] = useState<File[]>([]);
  const form = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageSrc: "",
      category: "",
      location: "",
      eventDate: new Date(),
      userId: userId,
      price: 0,
      isFree: false,
    },
  });

  async function handleImageUpload(files: File[], defaultImageSrc: string) {
    let uploadedImageUrl = defaultImageSrc;
    console.log("Inizio caricamento immagini...");
       if (files.length > 0) {
        console.log("Inizio caricamento immagini2...");
      const uploadedImages = await uploadFiles("imageUploader", { files }); 
      console.log("Immagini caricate con successo:", uploadedImages);
  
      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error("Errore durante il caricamento delle immagini");
      }
  

    return uploadedImageUrl;
  }
  
  const handleEventDateTime = (date: Date, time: Date):Date => {
    if (!date || !time) {
      throw new Error("Sia la data che l'orario sono obbligatori.");
    }
  
   
  // Crea un nuovo oggetto Date partendo da `date` (giorno, mese, anno)
  const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Imposta ore e minuti dall'oggetto `time`
  combined.setHours(time.getHours());
  combined.setMinutes(time.getMinutes());
  combined.setSeconds(0); // Imposta i secondi a zero per evitare dettagli non necessari

  return combined; // Restituisce l'oggetto Date combinato
};
  
  

  async function onSubmit(values: z.infer<typeof CreateEventSchema>) {
    console.log(values);
    setError("");
    setSuccess("");
    
    const combinedDateTime = handleEventDateTime(
      new Date(values.eventDateDay), 
      new Date(values.eventTime)
    );

    
      const uploadedImageUrl = await handleImageUpload(files, values.imageSrc);
  
    
     
      const updatedValues = {
        ...values,
        eventDate: combinedDateTime, 
        imageSrc: uploadedImageUrl
      };
  
      startTransition(() => {


        console.log(updatedValues);
        createEvent(updatedValues)
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
  }
  

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
           <FormField
  control={form.control}
  name="eventDateDay"
  render={({ field }) => (
    <FormItem className="flex flex-col w-full">
      <FormLabel>Seleziona la data</FormLabel>
      <FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
          <Controller
            name="eventDateDay"
            control={form.control}
            render={({ field: controllerField }) => (
              <MobileDatePicker
                label="Data"
                value={controllerField.value ? dayjs(controllerField.value) : null}
                onChange={(newValue) => controllerField.onChange(newValue?.toDate())}
                views={['year', 'month', 'day']}
                slotProps={{
                  textField: {
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        padding: '10px',
                        borderColor: '#ccc',
                        '&:hover': {
                          borderColor: '#007aff',
                        },
                      },
                    },
                  },
                  dialog: {
                    sx: {
                      borderRadius: '16px',
                      '& .MuiPickersCalendarHeader-root': {
                        backgroundColor: '#007aff',
                        color: '#fff',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: '50%',
                        '&.Mui-selected': {
                          backgroundColor: '#007aff',
                          color: '#fff',
                        },
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                        },
                      },
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="eventTime"
  render={({ field }) => (
    <FormItem className="flex flex-col w-full mt-4">
      <FormLabel>Seleziona l'orario</FormLabel>
      <FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
          <Controller
            name="eventTime"
            control={form.control}
            render={({ field: controllerField }) => (
              <MobileTimePicker
                label="Orario"
                value={controllerField.value ? dayjs(controllerField.value) : null}
                onChange={(newValue) => controllerField.onChange(newValue?.toDate())}
                ampm={false} // Formato 24 ore
                minutesStep={5} // Limita la selezione agli intervalli di 5 minuti
                slotProps={{
                  textField: {
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        padding: '10px',
                        borderColor: '#ccc',
                        '&:hover': {
                          borderColor: '#007aff',
                        },
                      },
                    },
                  },
                  dialog: {
                    sx: {
                      borderRadius: '16px',
                      '& .MuiTypography-root': {
                        fontSize: '14px',
                      },
                      '& .MuiPickersClock-pointer': {
                        backgroundColor: '#007aff',
                      },
                      '& .MuiPickersClock-pin': {
                        backgroundColor: '#007aff',
                      },
                      '& .MuiButtonBase-root:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


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
