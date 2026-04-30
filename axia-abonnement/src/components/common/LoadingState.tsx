interface LoadingStateProps {
  heightClassName?: string;
}

export default function LoadingState({
  heightClassName = "h-64",
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${heightClassName}`}>
      <div className="ui-spinner" />
    </div>
  );
}