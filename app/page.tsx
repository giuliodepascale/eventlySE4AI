import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";


export default async function Home() {
  const listings = undefined;

  if (!listings)
    return <EmptyState showReset></EmptyState>;

  return (
    <main>
      <Container>
        <div
          className="
            pt-24
            grid
            grid-cols-1
            sm-grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          "
        >
          {/* Qui puoi mappare i listings */}
        </div>
      </Container>
    </main>
  );
}
