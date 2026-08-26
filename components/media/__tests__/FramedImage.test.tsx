import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FramedImage } from '../FramedImage';

describe('FramedImage', () => {
  it('renders the image with its alt text', () => {
    render(<FramedImage src="/img/gajahsafe.jpg" alt="GajahSafe field hardware" width={1440} height={900} />);
    expect(screen.getByRole('img', { name: 'GajahSafe field hardware' })).toBeInTheDocument();
  });

  it('refuses to render decoratively — alt is required by the type and used', () => {
    render(<FramedImage src="/img/cam-muka.jpg" alt="CAM Muka deployment" width={960} height={600} />);
    expect(screen.getByRole('img').getAttribute('alt')).toBe('CAM Muka deployment');
  });

  it('adds drift headroom only when asked', () => {
    const { container, rerender } = render(
      <FramedImage src="/img/a.jpg" alt="a" width={10} height={10} />,
    );
    const plain = container.querySelector('[data-framed-image]')?.className ?? '';
    rerender(<FramedImage src="/img/a.jpg" alt="a" width={10} height={10} drifts />);
    const drifting = container.querySelector('[data-framed-image]')?.className ?? '';
    expect(drifting.length).toBeGreaterThan(plain.length);
  });
});
