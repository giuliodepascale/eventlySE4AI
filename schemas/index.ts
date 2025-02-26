
import * as z from "zod";


export const LoginSchema = z.object({
    email: z.string().email({
        message: "Inserisci una email valida",
    }),
    password: z.string().min(5,{
        message: "La password è necessaria (almeno 5 caratteri)",
    }).max(20,{
        message: "La password deve avere al massimo 20 caratteri",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Inserisci una email valida",
    }).max(50),
    password: z.string().min(5,{
        message: "La password è necessaria (almeno 5 caratteri)",
    }).max(20,{
        message: "La password deve avere al massimo 20 caratteri",
    }),
    name: z.string().min(1, {
        message: "Inserisci il tuo nome",
    }).max(25)
});

export const ResetSchema = z.object({
    email: z.string().email({
        message: "Inserisci una email valida",
    }),
});

export const NewPasswordSchema = z.object({
    password: z.string().min(5,{
        message: "La password è necessaria (almeno 5 caratteri)",
    }).max(20,{
        message: "La password deve avere al massimo 20 caratteri",
    }),
});

export const SettingsSchema = z.object({
    name: z.optional(z.string().min(1).max(25)),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(5).max(20)).or(z.literal('')),
    newPassword: z.optional(z.string().min(5).max(20)).or(z.literal('')),

    
}).refine((data) => {
    if(data.password && !data.newPassword) {
        return false
    }
    return true
}, {
    message: "Devi inserire entrambi i campi per cambiare la password",
    path: ["newPassword"]
}).refine((data) => {
    if(!data.password && data.newPassword) {
        return false
    }
    return true
}, {
    message: "Devi inserire entrambi i campi per cambiare la password",
    path: ["password"]
})



  export const organizationSchema = z.object({
    name: z
      .string()
      .min(3, "Il titolo deve contenere almeno 3 caratteri")
      .max(50, "Il titolo non può superare i 50 caratteri"),
    description: z
      .string()
      .min(10, "La descrizione deve contenere almeno 10 caratteri")
      .max(300, "La descrizione non può superare i 300 caratteri"),
    indirizzo: z
      .union([z.string().min(3, "Il luogo deve contenere almeno 3 caratteri")
        .max(50, "Il luogo non può superare i 50 caratteri"), z.literal('')])
      .optional()
      .default(''),
    phone: z
      .union([z.string().regex(/^[0-9+\-\s]+$/, "Numero di telefono non valido"), z.literal('')])
      .optional()
      .default(''),
    email: z.string().email({
        message: "Inserisci una email valida",
    }),
    linkEsterno: z
      .union([z.string().url("Link non valido"), z.literal('')]) // Permette stringa vuota o URL valido
      .optional()
      .default(''),
    imageSrc: z
      .union([z.string().url("L'immagine deve essere un URL valido"), z.literal('')])
      .optional()
      .default(''),
    // Nuovi campi per comune, provincia e seoUrl
    comune: z
      .union([z.string(), z.literal('')])
      .optional(),
    provincia: z
      .union([z.string(), z.literal('')])
      .optional(),
    regione: z
    .union([z.string(), z.literal('')])
    .optional(),
    seoUrl: z
      .union([z.string().regex(/^[a-z0-9-]+$/i, "SEO URL non valido"), z.literal('')]) // Permette stringa vuota o slug valido
      .optional()
      .default(''),
  });


  // Scheda biglietto (nome, prezzo, quantità, ecc.)





export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Il titolo deve contenere almeno 3 caratteri")
    .max(50, "Il titolo non può superare i 50 caratteri"),
  eventDate: z.date(), 
  status: z.enum(["pubblico", "privato"]).default("pubblico"),
  isReservationActive: z.boolean(),
  eventTime: z.date({required_error: "Il campo orario dell'evento è obbligatorio",}),
  eventDateDay: z.date({required_error: "Il campo data dell'evento è obbligatorio",}).refine(
    (date) => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      return date >= now
    },
    {
      message: "La data dell'evento non può essere nel passato",
    }
  ),
  indirizzo: z
  .string()
    .min(3, "L'indirizzo deve contenere almeno 3 caratteri")
    .max(50, "L'indirizzo non può superare i 50 caratteri"),
  description: z
    .string()
    .min(10, "La descrizione deve contenere almeno 10 caratteri")
    .max(300, "La descrizione non può superare i 300 caratteri"),
  imageSrc: z
    .string()
    .url("L'immagine deve essere un URL valido")
    .optional()
    .nullable(),
  category: z
    .string()
    .nonempty("La categoria è obbligatoria"),
  organizationId: z
    .string(),
  comune: z
      .string()
      .nonempty("Il comune è obbligatorio"),
    provincia: z
    .string()
    .nonempty("Il comune è obbligatorio"),
    regione: z
    .string()
    .nonempty("Il comune è obbligatorio"),
    
})
;
export const UpdateTicketTypeSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, "Il nome è obbligatorio"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative().optional()
  ),
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val) : val),
    z.number().int().min(0, "La quantità deve essere almeno 0 (sold out)")
  ),
  isActive: z.boolean().optional(),
});

export const CreateTicketTypeSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, "Il nome è obbligatorio"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative().optional()
  ),
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val) : val),
    z.number().int().min(1, "La quantità deve essere almeno 1")
  ),
});
  /*
price: z
    .string()
    .refine((val) => {
      if (val === undefined) return true;

      // Converte in intero.
      const intVal = parseInt(val, 10);

      // Controlla che non sia NaN e non sia negativo.
      if (isNaN(intVal) || intVal < 0) {
        return false;
      }

      // Se `intVal.toString()` è uguale a `val`, significa che non c'erano decimali.
      return intVal.toString() === val;
    }, {
      message: "Il prezzo deve essere un intero non negativo",
    })
}).refine((data) => {
  if(data.isFree && parseInt(data.price) > 0) {
      return false
  }
  return true
}, {
  message: "Il prezzo deve essere pari a 0 se l'evento ha ingresso libero",
  path: ["price"]
}).refine((data) => {
  if(!data.isFree && parseInt(data.price) === 0) {
      return false
  }
  return true
}, {
  message: "Se il prezzo è pari a 0 l'ingresso deve essere libero",
  path: ["isFree"]
})
  */