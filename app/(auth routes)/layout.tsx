"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function AuthRoutesLayout({ children }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    router.refresh();
    startTransition(() => setIsLoading(false));
  }, [router]);

  return isLoading ? <p>Loading...</p> : <>{children}</>;
}
