"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VideoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const videoUrl = `https://www.bilibili.com/video/${id}/`;
    router.replace(`/?url=${encodeURIComponent(videoUrl)}`);
  }, [id, router]);

  return null;
}