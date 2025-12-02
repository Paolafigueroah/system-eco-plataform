import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('debe renderizar skeleton de tipo card', () => {
    render(<SkeletonLoader variant="card" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toBeInTheDocument();
  });

  it('debe renderizar múltiples skeletons de tipo list', () => {
    render(<SkeletonLoader variant="list" count={3} />);
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe renderizar skeleton de tipo text', () => {
    render(<SkeletonLoader variant="text" count={2} />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toBeInTheDocument();
  });

  it('debe renderizar skeleton de tipo image', () => {
    render(<SkeletonLoader variant="image" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toBeInTheDocument();
  });
});

