/**
 * Shimmer loading placeholder for AI answer
 */

interface ShimmerPlaceholderProps {
  lines?: number;
}

export function ShimmerPlaceholder({ lines = 5 }: ShimmerPlaceholderProps) {
  const lineWidths = ['100%', '83%', '67%', '100%', '75%'];

  return (
    <div style={styles.container}>
      {/* Shimmer animation overlay */}
      <div style={styles.shimmer} />

      {/* Skeleton lines */}
      <div style={styles.linesContainer}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.line,
              width: lineWidths[i % lineWidths.length],
            }}
          />
        ))}
      </div>
      <style>{animationStyles}</style>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
    padding: '16px',
  },
  shimmer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transform: 'translateX(-100%)',
    animation: 'shimmer 2s infinite',
  },
  linesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  line: {
    height: '16px',
    backgroundColor: '#d1d5db',
    borderRadius: '4px',
  },
};

const animationStyles = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;
