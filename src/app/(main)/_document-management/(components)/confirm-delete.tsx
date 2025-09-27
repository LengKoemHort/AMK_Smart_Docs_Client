interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  prompt: string;
  btnLabel: string;
  cls: string;
}

export default function ConfirmDialog({
  cls,
  title,
  prompt,
  btnLabel,
  isOpen,
  onClose,
  onDelete,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal z-[60]" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-2 text-sm">{prompt}</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button
              type="button"
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300 hover:cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${cls} hover:cursor-pointer`}
              onClick={onDelete}
            >
              {btnLabel}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
