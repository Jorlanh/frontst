import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false }: any) => {
  const baseStyle = "px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md relative overflow-hidden";
  const variants = {
    primary: "bg-enem-blue text-white hover:bg-blue-700 hover:shadow-lg",
    secondary: "bg-enem-yellow text-enem-dark hover:bg-yellow-500",
    outline: "border-2 border-enem-blue text-enem-blue hover:bg-blue-50 dark:hover:bg-blue-900/20",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyle} ${(variants as any)[variant]} ${className} ${loading ? 'text-transparent' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-300 ${className}`}
  >
    {children}
  </div>
);

export const Badge = ({ children, color = 'blue' }: any) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${(colors as any)[color] || colors.blue}`}>
      {children}
    </span>
  );
};

export const LoadingSpinner = ({ size = 'md', color = 'blue' }: any) => {
  const sizes = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-b-2',
    lg: 'h-16 w-16 border-b-4'
  };
  const colors: Record<string, string> = {
    blue: 'border-blue-500',
    white: 'border-white',
    yellow: 'border-yellow-400',
    current: 'border-current'
  };
  return (
    <div className={`animate-spin rounded-full ${(sizes as any)[size]} ${colors[color] || colors.blue} border-t-transparent`}></div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  const scrollToTop = React.useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollTop = 0;
  }, []);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        ref={scrollToTop}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center z-10">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white">{title || 'Premium'}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-2xl text-slate-400">×</span>
          </button>
        </div>
        <div className="">
          {children}
        </div>
      </div>
    </div>
  );
};

export const FullPageLoader = ({ text }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 w-full">
    <LoadingSpinner size="md" />
    {text && <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">{text}</p>}
  </div>
);