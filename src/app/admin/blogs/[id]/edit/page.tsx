'use client';

import React, { useEffect, useState } from 'react';
import BlogForm from '@/components/admin/BlogForm';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import { useParams } from 'next/navigation';

export default function EditBlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      const blogs = await blogService.getBlogs();
      const found = blogs.find(b => b.id === params.id);
      if (found) setBlog(found);
      setLoading(false);
    };
    fetchBlog();
  }, [params.id]);

  if (loading) return <div>Loading blog data...</div>;
  if (!blog) return <div>Blog post not found.</div>;

  return <BlogForm initialData={blog} isEdit={true} />;
}
