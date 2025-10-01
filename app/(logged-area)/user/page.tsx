"use client";

import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/perfil");
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner color="warning" size="lg" />
    </div>
  );
}
