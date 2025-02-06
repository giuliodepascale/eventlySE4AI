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
import { useMemo, useState } from "react";
import { FaEuroSign } from "react-icons/fa";
//import { FiMapPin } from "react-icons/fi";
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
import { FileUploader } from "@/components/altre/file-uploader";
import { Checkbox } from "@/components/ui/checkbox";
import Loader from "../loader";
import { supabase } from "@/lib/supabaseClient";
import { SafeOrganization } from "@/app/types";
import italia from "italia";


dayjs.locale("it");

interface EventFormProps {
  organization: SafeOrganization;
  type: string;
}


export const EventForm = ({ organization, type }: EventFormProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const action = type //todo
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);


  const { regioni } = italia; // Estrai regioni direttamente

       // Stati per regione e provincia selezionata
     const [selectedRegion, setSelectedRegion] = useState<string | null>(organization.regione || null);
     const [selectedProvince, setSelectedProvince] = useState<string | null>(organization.provincia || null);
   
     
    const province = useMemo(() => {
      if (!selectedRegion || !regioni) {
          return [];
      }
  
      // Trova la regione corrispondente
      const region = regioni.find((reg: {nome:string}) => reg.nome === selectedRegion);
  
      if (!region) {
         
          return [];
      }
  
      if (!region.province || region.province.length === 0) {
          return [];
      }
  
     
  
      // 🔹 Ritorniamo direttamente le sigle
      return region.province.map((sigla:{sigla:string}) => ({
          nome: sigla, // Nome e sigla saranno uguali
          sigla: sigla
      }));
  }, [selectedRegion, regioni]);
  
  const comuni = useMemo(() => {
    if (!selectedProvince || !italia.comuni || !italia.comuni.regioni) {
        
        return [];
    }
  
  
  
    // 🔹 Troviamo la regione che contiene la provincia selezionata
    const regione = italia.comuni.regioni.find((regione: { province: { code: string; }[]; }) =>
        regione.province.some((prov: { code: string }) => prov.code === selectedProvince)
    );
  
    if (!regione) {
      
        return [];
    }
  
  
  
    // 🔹 Troviamo la provincia dentro la regione usando `code` invece di `sigla`
    const provincia = regione.province.find((prov: { code: string }) => prov.code === selectedProvince);
  
    if (!provincia || !provincia.comuni) {
        return [];
    }
  
    
  
    // 🔹 Restituiamo i comuni trovati
    return provincia.comuni.map((comune: { nome: string }) => ({
        nome: comune.nome,
    }));
  }, [selectedProvince]);
  
  

  async function handleImageUpload(files: File[], defaultImageSrc: string): Promise<string> {
    let uploadedImageUrl = defaultImageSrc;

    if (files.length > 0) {
      const file = files[0];
      const filePath = `events/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
      .from('immagini') // Assicurati che il bucket "immagini" esista
      .upload(filePath, file);
    
    if (uploadError) {
      console.error("Errore durante il caricamento dell'immagine:", uploadError.message);
      setError("Errore durante il caricamento dell'immagine. Riprova.");
      return uploadedImageUrl;
    }
    
    // Ottieni l'URL pubblico
    const { data } = supabase.storage.from('immagini').getPublicUrl(filePath);
    
    if (!data?.publicUrl) {
      console.error("Errore nel recupero dell'URL pubblico");
      setError("Errore nel recupero dell'URL pubblico.");
      return uploadedImageUrl;
    }
    
    const publicUrl = data.publicUrl;

      uploadedImageUrl = publicUrl;
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

  const form = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageSrc: "",
      category: "",
      indirizzo: organization.indirizzo || "",
      comune: organization.comune || "",
      provincia: organization.provincia || "",
      regione: organization.regione || "",
      isFree: true,
      eventDate: new Date(),
      eventDateDay: new Date(),  // nuovo default
      eventTime: new Date(),     // nuovo default
      organizationId: organization.id,
      price: "0",
    },
    
    
  });

  async function onSubmit(values: z.infer<typeof CreateEventSchema>) {
        console.log("ciaoooo")
        setIsSubmitting(true);
        setError("");
        setSuccess("");
      
        let uploadedImageUrl = await handleImageUpload(files, values.imageSrc || "");
        if (!uploadedImageUrl) {
          uploadedImageUrl = values.imageSrc || "";
        }

        const combinedDateTime = handleEventDateTime(
          new Date(values.eventDateDay),
          new Date(values.eventTime)
        );
      
        const updatedValues = {
          ...values,
          eventDate: combinedDateTime,
          imageSrc: uploadedImageUrl,
          userId: organization.id,
        };
      
      
          createEvent(updatedValues) // Passa userIdprops qui
            .then((data) => {
              if (data.error) {
                setError(data.error);
              }
            })
            .finally(() => {
              setIsSubmitting(false);
            })
            ;
       
      }


  return (
   <>
    {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader/> {/* Spinner per indicare caricamento */}
        </div>
      )}

   
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
                      disabled={isSubmitting}
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
            imageUrl={field.value || ""}
            setFiles={setFiles}
          />
       
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  <FormField
  control={form.control}
  name="indirizzo"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Indirizzo</FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder="Inserisci l'indirizzo dell'evento"
          disabled={isSubmitting}
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

  {/* Campo luogo */}
  <FormField
      control={form.control}
      name="regione"
      render={({ field }) => (
    <FormItem>
      <FormLabel>Regione</FormLabel>
      <FormControl>
          <Select
            onValueChange={(val: string) => {
              field.onChange(val);
              setSelectedRegion(val);
              setSelectedProvince(null); // Reset provincia
            }}
            value={selectedRegion || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona una Regione" />
            </SelectTrigger>
            <SelectContent>
              {regioni.map((reg: {nome: string}) => (
                <SelectItem key={reg.nome} value={reg.nome}>
                  {reg.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
 {/* 🔹 SELEZIONE PROVINCIA */}
 <FormField
  control={form.control}
  name="provincia"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Provincia</FormLabel>
      <FormControl>
        <Select
          onValueChange={(val: string) => {
            field.onChange(val);
            setSelectedProvince(val);
          }}
          value={field.value || ""} // Assicura che il valore non sia undefined
          disabled={!selectedRegion}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona una Provincia" />
          </SelectTrigger>
          <SelectContent>
            {province.map((prov: {sigla:string}) => (
              <SelectItem key={prov.sigla} value={prov.sigla}>
                {prov.sigla}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

             
        {/* 🔹 SELEZIONE COMUNE */}
        <FormField
          control={form.control}
          name="comune"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comune</FormLabel>
              <FormControl>
             
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedProvince ? "Seleziona un Comune" : "Seleziona prima una Provincia"} />
                  </SelectTrigger>
                  <SelectContent>
                  {
                      comuni.map((comune: {nome: string}) => (
                        <SelectItem key={comune.nome} value={comune.nome}>
                          {comune.nome}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
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
      </>
  );
};

export default EventForm;
