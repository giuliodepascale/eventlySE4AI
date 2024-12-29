import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";



interface HomeProps {
  searchParams: string;
}

export default async function Home({
  searchParams,
}: HomeProps) {

  //ricava listings
  const listings = undefined;

  if(!listings) return (
    <EmptyState showReset></EmptyState>
  )

  return (
    <main >
      <Container>
          <div className="
            pt-24
            grid
            grid-cols-1
            sm-grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          ">

          </div>

      </Container>    
    </main>
    
  );
}
