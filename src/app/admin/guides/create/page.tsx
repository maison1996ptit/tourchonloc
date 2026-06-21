'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGuideRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/blogs/create');
  }, [router]);
  return null;
}
