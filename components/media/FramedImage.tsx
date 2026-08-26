import Image from 'next/image';
import styles from './FramedImage.module.css';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Adds headroom for the s03 2.5D scroll drift. */
  drifts?: boolean;
  priority?: boolean;
  className?: string;
};

/**
 * An image inside the HUD treatment: duotone toward the accent, scanlined,
 * hard-bordered. Used by the s01 portrait and the four s03 spotlights.
 */
export function FramedImage({
  src,
  alt,
  width,
  height,
  drifts = false,
  priority = false,
  className,
}: Props) {
  return (
    <div
      className={[styles.frame, drifts ? styles.drifts : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      data-framed-image
    >
      <Image
        className={styles.image}
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
      />
    </div>
  );
}
