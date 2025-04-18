'use client';

import { useState } from 'react';
import { deleteCategory, updateCategory } from '@/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  id: string;
  name: string;
};

interface CategoryListProps {
  initialCategories: Category[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success('删除成功');
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('删除失败');
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    try {
      const result = await updateCategory(id, editingName);
      if (result.success) {
        toast.success('更新成功');
        setCategories(categories.map((c) => (c.id === id ? { ...c, name: editingName } : c)));
        setEditingId(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('更新失败');
    }
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  if (categories.length === 0) {
    return <div className="text-center text-muted-foreground">暂无分类</div>;
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between rounded-lg border p-4">
          {editingId === category.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="max-w-[200px]" />
              <Button size="sm" onClick={() => handleUpdate(category.id)}>
                保存
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="font-medium">{category.name}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEditing(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
