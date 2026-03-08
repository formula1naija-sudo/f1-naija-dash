import { Suspense } from "react";

import NextRound from "@/components/schedule/NextRound";
import Schedule from "@/components/schedule/Schedule";
import ScheduleTZPicker from "@/components/schedule/ScheduleTZPicker";

export default async function SchedulePage() {
  return (
    <div>
      <div className="my-4">
        <h1 className="text-3xl">Up Next</h1>
        <p className="text-zinc-500">All times are local time</p>
      </div>

      <Suspense fallback={<NextRoundLoading />}>
        <NextRound />
      </Suspense>

      <div className="my-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl">Schedule</h1>
        </div>
        <ScheduleTZPicker />
      </div>

      <Suspense fallback={<FullScheduleLoading />}>
        <Schedule />
      </Suspense>
    </div>
  );
}

const RoundLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-6 w-28 animate-pulse rounded-md bg-zinc-800" />
      <div className="h-96 animate-pulse rounded-md bg-zinc-800" />
    </div>
  );
};

const NextRoundLoading = () => {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="h-6 w-28 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-24 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-6 w-28 animate-pulse rounded-md bg-zinc-800" />
        <div className="h-24 animate-pulse rounded-md bg-zinc-800" />
      </div>
      <RoundLoading />
    </div>
  );
};

const FullScheduleLoading = () => {
  return (
    <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <RoundLoading key={i} />
      ))}
    </div>
  );
};
