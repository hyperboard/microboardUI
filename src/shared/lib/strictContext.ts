import { createContext, useContext, type Context } from "react";

export function createStrictContext<T>() {
  return createContext<T | null>(null);
}

export function useStrictContext<T>(ctx: Context<T | null>) {
  const value = useContext(ctx);
  if (!value) {
    throw new Error("Strict context is null");
  }

  return value as T;
}
