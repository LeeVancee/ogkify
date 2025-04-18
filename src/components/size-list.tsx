'use client';

import { useState } from 'react';
import { deleteSize, updateSize } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

type Size = {
  id: string;
  name: string;
  value: string;
};

interface SizeListProps {
  initialSizes: Size[];
}

export function SizeList({ initialSizes }: SizeListProps) {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingValue, setEditingValue] = useState('');

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个尺寸吗？')) return;

    try {
      const result = await deleteSize(id);
      if (result.success) {
        toast.success('删除成功');
        setSizes(sizes.filter((s) => s.id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('删除失败');
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim() || !editingValue.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const result = await updateSize(id, { name: editingName, value: editingValue });
      if (result.success) {
        toast.success('更新成功');
        setSizes(sizes.map((s) => (s.id === id ? { ...s, name: editingName, value: editingValue } : s)));
        setEditingId(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('更新失败');
    }
  }

  function startEditing(size: Size) {
    setEditingId(size.id);
    setEditingName(size.name);
    setEditingValue(size.value);
  }

  if (sizes.length === 0) {
    return <div className="text-center text-muted-foreground">暂无尺寸</div>;
  }

  return (
    <div className="space-y-4">
      {sizes.map((size) => (
        <div key={size.id} className="flex items-center justify-between rounded-lg border p-4">
          {editingId === size.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="尺寸名称"
                className="max-w-[150px]"
              />
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                placeholder="尺寸值"
                className="max-w-[100px]"
              />
              <Button size="sm" onClick={() => handleUpdate(size.id)}>
                保存
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div>
                <div className="font-medium">{size.name}</div>
                <div className="text-sm text-muted-foreground">值: {size.value}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEditing(size)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(size.id)}
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
