'use client';

import { useState } from 'react';
import { createCategory } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function CategoryForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('请输入分类名称');
      return;
    }

    setLoading(true);
    try {
      const result = await createCategory(name);
      if (result.success) {
        toast.success('分类创建成功');
        setName('');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input placeholder="输入分类名称" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '创建中...' : '创建分类'}
      </Button>
    </form>
  );
}
