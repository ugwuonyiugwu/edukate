import { UseIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";

interface InfinitScrollProps{
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfinitScrollProps) => {

  const { targetRef, isIntersecting } = UseIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px"
  });

  useEffect(()=>{
    if (isIntersecting  && hasNextPage && !isFetchingNextPage && !isManual ) {
      fetchNextPage();
    }
  },[isIntersecting, isFetchingNextPage, isManual, hasNextPage, fetchNextPage])
  return(
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={ targetRef } className="h-1"/>
      {hasNextPage ? (
        <Button 
        variant="secondary"
        disabled={!hasNextPage || isFetchingNextPage}
        onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          you have reached the end of the list
        </p>
      )}
    </div>
  );
};