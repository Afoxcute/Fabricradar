import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white p-4">
      <div className="container mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Back button and creator info skeleton */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mt-8">
          <Skeleton className="h-6 w-20" />

          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>

          <div className="flex items-center gap-8 ml-0 md:ml-auto">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-8" />
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>
        </div>

        <Skeleton className="h-8 w-48 mt-4" />

        {/* Product display skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Product Images skeleton */}
          <div className="flex gap-4">
            <div className="hidden md:flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-md" />
              ))}
            </div>

            <Skeleton className="flex-1 h-[500px] rounded-lg" />
          </div>

          {/* Product Info skeleton */}
          <div>
            <Skeleton className="h-10 w-48 mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-8" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>

        {/* Description section skeleton */}
        <div className="mt-16">
          <Skeleton className="h-8 w-32 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Reviews section skeleton */}
        <div className="mt-16">
          <Skeleton className="h-8 w-40 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Chat interface skeleton */}
        <div className="mt-16 mb-16">
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
