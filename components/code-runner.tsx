"use client";

import { useEffect } from "react";

interface CodeRunnerProps {
  code: string;
  onDone: () => void;
}

export function CodeRunner({ code, onDone }: CodeRunnerProps) {
  useEffect(() => {
    try {
      // WARNING: This is not safe in a real-world application.
      // You should use a web worker or a server-side execution environment.
      eval(code);
    } catch (error) {
      console.error("Error running code:", error);
    } finally {
      onDone();
    }
  }, [code, onDone]);

  return null;
}
