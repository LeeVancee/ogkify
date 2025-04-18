'use client';

import { useState } from 'react';
import { deleteColor, updateColor } from '@/actions/colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

type Color = {
  id: string;
  name: string;
  value: string;
};

interface ColorListProps {
  initialColors: Color[];
}

export function ColorList({ initialColors }: ColorListProps) {
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingValue, setEditingValue] = useState('');

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个颜色吗？')) return;

    try {
      const result = await deleteColor(id);
      if (result.success) {
        toast.success('删除成功');
        setColors(colors.filter((c) => c.id !== id));
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
      const result = await updateColor(id, { name: editingName, value: editingValue });
      if (result.success) {
        toast.success('更新成功');
        setColors(colors.map((c) => (c.id === id ? { ...c, name: editingName, value: editingValue } : c)));
        setEditingId(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('更新失败');
    }
  }

  function startEditing(color: Color) {
    setEditingId(color.id);
    setEditingName(color.name);
    setEditingValue(color.value);
  }

  if (colors.length === 0) {
    return <div className="text-center text-muted-foreground">暂无颜色</div>;
  }

  return (
    <div className="space-y-4">
      {colors.map((color) => (
        <div key={color.id} className="flex items-center justify-between rounded-lg border p-4">
          {editingId === color.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="颜色名称"
                className="max-w-[150px]"
              />
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="w-[60px]"
                />
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  placeholder="颜色值"
                  className="max-w-[120px]"
                />
              </div>
              <Button size="sm" onClick={() => handleUpdate(color.id)}>
                保存
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: color.value }} />
                <div>
                  <div className="font-medium">{color.name}</div>
                  <div className="text-sm text-muted-foreground">{color.value}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEditing(color)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(color.id)}
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
