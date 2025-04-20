'use client';

import { useState } from 'react';
import { createSize } from '@/actions/sizes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function SizeForm() {
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
      const result = await createSize({ name, value });
      if (result.success) {
        toast.success('Size created successfully');
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
        <Input placeholder="Input size name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Input size value (e.g., S, M, L)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Size'}
      </Button>
    </form>
  );
}
