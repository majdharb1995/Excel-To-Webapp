import useCopy from '../../hooks/useCopy';

export default function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied!' }) {
  const [copied, doCopy] = useCopy();
  return (
    <button
      className={`copy-action-btn${copied ? ' copied' : ''}`}
      onClick={() => doCopy(text)}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
