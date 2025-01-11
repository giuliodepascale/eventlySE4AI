
interface DateFormatterProps {
    dateISO: string
}

const DateFormatter = ({dateISO}: DateFormatterProps) => {
const date = new Date(dateISO);


// Estrai i componenti della data
const month = String(date.getMonth() + 1).padStart(2, '0'); // I mesi in JavaScript vanno da 0 a 11
const day = String(date.getDate()).padStart(2, '0');
const hours = String(date.getHours()).padStart(2, '0');
const minutes = String(date.getMinutes()).padStart(2, '0');

// Combina i componenti nel formato desiderato
const formattedDate = `${day}/${month} ${hours}:${minutes}`;

 return formattedDate
}

export default DateFormatter;