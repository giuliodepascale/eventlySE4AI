
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



export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Il titolo deve contenere almeno 3 caratteri")
    .max(50, "Il titolo non può superare i 50 caratteri"),
  eventDate: z.date(), 
  isFree: z.boolean(),
  eventTime: z.date({required_error: "Il campo orario dell'evento è obbligatorio",}),
  eventDateDay: z.date({required_error: "Il campo data dell'evento è obbligatorio",}).refine(
    (date) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now;
    },
    {
      message: "La data dell'evento non può essere nel passato",
    }
  ),
  location: z
  .string()
    .min(3, "Il luogo deve contenere almeno 3 caratteri")
    .max(50, "Il luogo non può superare i 50 caratteri"),
  description: z
    .string()
    .min(10, "La descrizione deve contenere almeno 10 caratteri")
    .max(300, "La descrizione non può superare i 300 caratteri"),
  imageSrc: z
    .string()
    .url("L'immagine deve essere un URL valido"),
  category: z
    .string()
    .nonempty("La categoria è obbligatoria"),
  userId: z
    .string(),
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
;




