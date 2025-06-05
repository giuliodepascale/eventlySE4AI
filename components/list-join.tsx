import { getEventsWithOrganizationData } from "@/MONGODB/join-operation";


export default async function ListJoin() {
  const data = await getEventsWithOrganizationData();

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">Nessun evento trovato.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Eventi con Dati Organizzazione</h2>
      {data.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-500">Data: {new Date(item.eventDate).toLocaleDateString()}</p>
          <p className="text-sm">Organizzazione: <strong>{item.organizationInfo.name}</strong></p>
          <p className="text-sm text-gray-600">Regione: {item.organizationInfo.regione}</p>
        </div>
      ))}
    </div>
  );
}
