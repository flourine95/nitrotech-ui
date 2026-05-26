import Link from 'next/link';
import { LightningIcon } from './lightning';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /**
   * Size variant
   * - sm: size-6 icon, text-base
   * - md: size-8 icon, text-lg (default)
   * - lg: size-10 icon, text-xl
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show hover effects
   */
  interactive?: boolean;
  /**
   * Custom className for the wrapper
   */
  className?: string;
  /**
   * Custom className for the icon
   */
  iconClassName?: string;
  /**
   * Custom className for the text
   */
  textClassName?: string;
}

const sizeConfig = {
  sm: {
    icon: 'size-6',
    text: 'text-base',
  },
  md: {
    icon: 'size-8',
    text: 'text-lg',
  },
  lg: {
    icon: 'size-10',
    text: 'text-xl',
  },
};

export function BrandLogo({
  size = 'md',
  interactive = true,
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href="/"
      aria-label="NitroTech - Trang chủ"
      className={cn(
        'flex cursor-pointer items-center gap-2.5',
        interactive && 'group transition-transform hover:scale-105',
        className
      )}
    >
      <LightningIcon
        className={cn(
          config.icon,
          'text-slate-900',
          interactive && 'transition-colors group-hover:text-blue-600',
          iconClassName
        )}
      />
      <span className={cn(config.text, 'font-bold text-slate-900', textClassName)}>
        Nitro<span className="text-blue-600">Tech</span>
      </span>
    </Link>
  );
}
