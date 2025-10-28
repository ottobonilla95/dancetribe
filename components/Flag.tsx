interface FlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Flag = ({ countryCode, size = 'md', className = '' }: FlagProps) => {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
    '2xl': 'text-8xl'
  };

  return (
    <span 
      className={`fi fi-${countryCode.toLowerCase()} inline-block ${sizeClasses[size]} ${className}`}
      style={{ fontSize: size === '2xl' ? '5rem' : size === 'xl' ? '3.5rem' : undefined }}
      title={countryCode}
    />
  );
};

export default Flag;
