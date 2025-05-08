export const formatDeadline = (deadline: string) => {
  if (!deadline) return 'Unknown';
  const date = new Date(deadline);
  const now = new Date();
  const diffHours = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  if (diffHours < 0) {
    return 'Expired';
  } else if (diffHours < 1) {
    return 'Less than 1 hour';
  } else if (diffHours === 1) {
    return '1 hour';
  } else if (diffHours < 24) {
    return `${diffHours} hours`;
  } else {
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }
};
