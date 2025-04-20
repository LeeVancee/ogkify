'use client';

import { useState } from 'react';
import { updateColor } from '@/actions/colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ColorEditFormProps {
  color: {
    id: string;
    name: string;
    value: string;
  };
}

export function ColorEditForm({ color }: ColorEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(color.name);
  const [value, setValue] = useState(color.value);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !value) {
      toast.error('Please fill in all information');
      return;
    }

    setLoading(true);
    try {
      const result = await updateColor(color.id, { name, value });
      if (result.success) {
        toast.success('Color updated successfully');
        router.push('/dashboard/colors');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input placeholder="Input color name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input type="color" value={value} onChange={(e) => setValue(e.target.value)} className="w-[60px]" />
          <Input placeholder="Color Value (Hex)" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Updating...' : 'Update Color'}
      </Button>
    </form>
  );
}
