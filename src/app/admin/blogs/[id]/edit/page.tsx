'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GuideForm from '@/components/admin/GuideForm';
import { Guide } from '@/types/guide';

export default function EditBlogPage() {
  const params = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuide() {
      try {
        // Query the list to find the matching ID (including categories, tags, blocks)
        const res = await fetch(`/api/guides?status=All`);
        if (res.ok) {
          const result = await res.json();
          // Find by ID in the full list
          const found = result.data?.find((g: Guide) => g.id === params.id);
          if (found) {
            // Fetch detailed guide including blocks by querying via its slug
            const detailRes = await fetch(`/api/guides/${found.slug}`);
            if (detailRes.ok) {
              setGuide(await detailRes.json());
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchGuide();
    }
  }, [params.id]);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải thông tin bài viết...</div>;
  if (!guide) return <div style={{ padding: '20px' }}>Không tìm thấy bài viết yêu cầu.</div>;

  return <GuideForm initialData={guide} isEdit={true} />;
}
