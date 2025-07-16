import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const getIsMediaMatches = () => matchMedia(query).matches;

  const [isMediaMatches, setIsMediaMatches] = useState(getIsMediaMatches);

  useEffect(() => {
    const handleWindowSizeChange = () => setIsMediaMatches(getIsMediaMatches());

    window.addEventListener("resize", handleWindowSizeChange);

    return () => window.removeEventListener("resize", handleWindowSizeChange);
  }, []);

  return isMediaMatches;
}
