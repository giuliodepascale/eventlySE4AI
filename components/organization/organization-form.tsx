import { organizationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileUploader } from "@/components/altre/file-uploader";
import { supabase } from "@/lib/supabaseClient";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import Loader from "../loader";
import { Input } from "@/components/ui/input";
import { createOrganization } from "@/actions/organization";


interface OrganizationFormProps {
    userIdprops: string;
  }
  

  export const OrganizationForm = ({ userIdprops }: OrganizationFormProps) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const form = useForm<z.infer<typeof organizationSchema>>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
          name: "",
          description: "",
          address: "",
          phone: "",
          email: "",
          linkEsterno: "",
          imageSrc: "",
        },
      });
      async function handleImageUpload(files: File[], defaultImageSrc: string): Promise<string> {
        let uploadedImageUrl = defaultImageSrc;
    
        if (files.length > 0) {
          const file = files[0];
          const filePath = `organization/${Date.now()}-${file.name}`;
    
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
      async function onSubmit(values: z.infer<typeof organizationSchema>) {
        setIsSubmitting(true);
        setError("");
        setSuccess("");
      
        let uploadedImageUrl = await handleImageUpload(files, values.imageSrc || "");
        if (!uploadedImageUrl) {
          uploadedImageUrl = values.imageSrc || "";
        }
      
        const updatedValues = {
          ...values,
          imageSrc: uploadedImageUrl,
        };
      
      
          createOrganization(updatedValues, userIdprops) // Passa userIdprops qui
            .then((data) => {
              if (data.error) {
                setError(data.error);
              } else if (data.success) {
                setSuccess(data.success);
                form.reset();
                setFiles([]);
              }
              setIsSubmitting(false);
            })
            .catch((err) => {
              setError("Errore nella creazione dell'organizzazione");
              console.error(err);
              setIsSubmitting(false);
            });
       
      }
      
    
      return (
        <>
          {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Loader /> {/* Spinner per indicare caricamento */}
            </div>
          )}
    
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci il nome dell'organizzazione"
                          type="text"
                          disabled={isSubmitting}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Descrizione */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci una descrizione"
                          type="text"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Indirizzo */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci l'indirizzo"
                          type="text"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Telefono */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci il numero di telefono"
                          type="text"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci l'email"
                          type="email"
                          disabled={isSubmitting}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Link Esterno */}
                <FormField
                  control={form.control}
                  name="linkEsterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Pubblico</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Inserisci un URL"
                          type="url"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Immagine */}
                <FormField
                  control={form.control}
                  name="imageSrc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immagine</FormLabel>
                      <FormControl>
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
    
              
              </div>
    
              {/* Messaggi di Errore e Successo */}
              <FormError message={error} />
              <FormSuccess message={success} />
    
              {/* Pulsante di Submit */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando..." : "Crea Organizzazione"}
              </Button>
            </form>
          </Form>
        </>
      );
    };
    

  export default OrganizationForm;
