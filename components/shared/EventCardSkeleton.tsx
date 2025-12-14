"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

export function EventCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden">
        {/* Image Skeleton */}
        <div className="relative w-full h-48 bg-muted animate-pulse" />

        <CardContent className="p-4">
          {/* Title Skeleton */}
          <div className="h-6 bg-muted rounded animate-pulse mb-3" />
          <div className="h-6 bg-muted rounded animate-pulse mb-3 w-3/4" />

          {/* Details Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
