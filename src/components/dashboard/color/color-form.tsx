'use client';

import { useState } from 'react';
import { createColor } from '@/actions/colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ColorForm() {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !value) {
      toast.error('Please fill in all information');
      return;
    }

    setLoading(true);
    try {
      const result = await createColor({ name, value });
      if (result.success) {
        toast.success('Color created successfully');
        setName('');
        setValue('');
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
        {loading ? 'Creating...' : 'Create Color'}
      </Button>
    </form>
  );
}
