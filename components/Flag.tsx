interface FlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Flag = ({ countryCode, size = 'md', className = '' }: FlagProps) => {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6'
  };

  return (
    <span 
      className={`fi fi-${countryCode.toLowerCase()} ${sizeClasses[size]} ${className}`}
      title={countryCode}
    />
  );
};

export default Flag;
