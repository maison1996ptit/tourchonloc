'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditMemoRedirect() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    if (params.id) {
      router.replace(`/admin/blogs/${params.id}/edit`);
    } else {
      router.replace('/admin/blogs');
    }
  }, [params.id, router]);
  
  return null;
}
