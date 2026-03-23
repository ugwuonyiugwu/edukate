import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { LibraryDetailsView } from "@/modules/home/Libraries/Libraryview/view";

// In Next.js 15, these MUST be Promises
interface PageProps {
  params: Promise<{ libraryId: string }>;
  searchParams: Promise<{ docId?: string }>;
}

export default async function LibraryPage(props: PageProps) {
  // 1. Properly await the promises (Crucial for Next.js 15)
  const params = await props.params;
  const searchParams = await props.searchParams;

  // 2. Safely parse the IDs
  const libraryId = Number(params.libraryId);
  const docId = searchParams.docId ? Number(searchParams.docId) : null;

  // 3. Validation: Only prefetch if we have a valid ID
  if (!isNaN(libraryId)) {
    void trpc.documents.getLibraryById.prefetch({ id: libraryId });
  }

  if (docId && !isNaN(docId)) {
    void trpc.documents.getDocumentById.prefetch({ id: docId });
  }

  return (
    <HydrateClient>
      <LibraryDetailsView libraryId={libraryId} />
    </HydrateClient>
  );
}