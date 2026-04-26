"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedFormFieldProps {
  children: ReactNode;
  error?: string;
}

export function AnimatedFormField({ children, error }: AnimatedFormFieldProps) {
  return (
    <motion.div
      animate={
        error
          ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
}
