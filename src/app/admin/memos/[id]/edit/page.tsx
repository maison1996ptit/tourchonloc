'use client';

import React, { useEffect, useState } from 'react';
import MemoForm from '@/components/admin/MemoForm';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import { useParams } from 'next/navigation';

export default function EditMemoPage() {
  const params = useParams();
  const [memo, setMemo] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemo = async () => {
      const blogs = await blogService.getBlogs();
      const found = blogs.find(b => b.id === params.id && b.isMemo === true);
      if (found) setMemo(found);
      setLoading(false);
    };
    fetchMemo();
  }, [params.id]);

  if (loading) return <div>Đang tải dữ liệu Memo...</div>;
  if (!memo) return <div>Không tìm thấy bài viết Memo.</div>;

  return <MemoForm initialData={memo} isEdit={true} />;
}
