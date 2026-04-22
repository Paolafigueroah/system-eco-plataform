import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('debe renderizar skeleton de tipo card', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    const skeleton = container.firstChild;
    expect(skeleton).toBeInTheDocument();
  });

  it('debe renderizar múltiples skeletons de tipo list', () => {
    render(<SkeletonLoader variant="list" count={3} />);
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe renderizar skeleton de tipo text', () => {
    const { container } = render(<SkeletonLoader variant="text" count={2} />);
    const skeleton = container.firstChild;
    expect(skeleton).toBeInTheDocument();
  });

  it('debe renderizar skeleton de tipo image', () => {
    const { container } = render(<SkeletonLoader variant="image" />);
    const skeleton = container.firstChild;
    expect(skeleton).toBeInTheDocument();
  });
});

