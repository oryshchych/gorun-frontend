"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface AnimatedFormFieldProps {
  children: ReactNode;
  error?: string;
}

export function AnimatedFormField({ children, error }: AnimatedFormFieldProps) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <motion.div
      animate={
        shake
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
