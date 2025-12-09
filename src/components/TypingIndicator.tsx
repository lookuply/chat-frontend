/**
 * Animated typing indicator for AI response loading
 */

interface TypingIndicatorProps {
  message?: string;
}

export function TypingIndicator({ message = 'AI premýšľa...' }: TypingIndicatorProps) {
  return (
    <div style={styles.container}>
      <div style={styles.dotsContainer}>
        <div style={{ ...styles.dot, animationDelay: '-0.3s' }} />
        <div style={{ ...styles.dot, animationDelay: '-0.15s' }} />
        <div style={styles.dot} />
      </div>
      <span style={styles.message}>{message}</span>
      <style>{animationStyles}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  dotsContainer: {
    display: 'flex',
    gap: '4px',
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  message: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

const animationStyles = `
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
