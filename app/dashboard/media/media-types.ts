import { type CloudinaryResource } from '@/lib/api/upload';

export interface AssetViewProps {
  assets: CloudinaryResource[];
  selected: Set<string>;
  active: string | null;
  onToggle: (id: string) => void;
  onSelect: (a: CloudinaryResource) => void;
}
