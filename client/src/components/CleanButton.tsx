type CleanButtonProps = {
  onClick: () => void;
};

export function CleanButton({ onClick }: CleanButtonProps) {
  return (
    <button type="button" className="clean" onClick={onClick}>
      Clean
    </button>
  );
}
