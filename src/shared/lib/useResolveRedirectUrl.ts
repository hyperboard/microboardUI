import { useEffect, useState, useRef } from "react";
import { getMediaSignedUrl } from "microboard-temp";

interface Args {
  mediaUrl: string;
  accessToken: string | null;
  beforeStartCb?: () => void;
}

export const useResolveRedirectUrl = ({
  mediaUrl,
  accessToken,
  beforeStartCb,
}: Args) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestRef = useRef(0);

  useEffect(() => {
    if (!mediaUrl) {
      setResolvedUrl(null);
      setIsLoadingUrl(false);
      setError(null);
      return;
    }

    const currentRequest = ++requestRef.current;

    const resolveRedirectUrl = async () => {
      beforeStartCb?.();
      setIsLoadingUrl(true);
      setResolvedUrl(null);
      setError(null);

      try {
        const url = await getMediaSignedUrl(mediaUrl, accessToken);

        if (currentRequest === requestRef.current) {
          setResolvedUrl(url);
        }
      } catch (err) {
        console.error("Error resolving redirect URL:", err);
        if (currentRequest === requestRef.current) {
          setError(
            err instanceof Error ? err : new Error("An unknown error occurred"),
          );
        }
      } finally {
        if (currentRequest === requestRef.current) {
          setIsLoadingUrl(false);
        }
      }
    };

    resolveRedirectUrl();
  }, [mediaUrl, accessToken]);

  return { resolvedUrl, isLoadingUrl, error };
};
