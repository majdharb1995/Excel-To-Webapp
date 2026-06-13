import { useState, useCallback } from 'react';

export default function useCopy() {
  const [copied, setCopied] = useState(false);
  const doCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);
  return [copied, doCopy];
}
