import React, { useEffect, useRef } from "react";

/**
 * Customizable labels for HostDeviceWarningModal text.
 * All fields are optional — defaults are used for any omitted field.
 */
export interface HostDeviceWarningModalLabels {
  /** Modal heading (default: "Big screen recommended"). */
  title?: string;
  /** Body copy shown under the heading. */
  body?: string;
  /** Primary action label (default: "Continue anyway"). */
  confirmLabel?: string;
  /** Secondary action label (default: "Cancel"). */
  cancelLabel?: string;
}

const defaultLabels: Required<HostDeviceWarningModalLabels> = {
  title: "Big screen recommended",
  body: "Hosting usually works best on a larger display, like a laptop or TV. You can continue on this device, but some layouts may be cramped.",
  confirmLabel: "Continue anyway",
  cancelLabel: "Cancel",
};

export interface HostDeviceWarningModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  labels?: HostDeviceWarningModalLabels;
}

export function HostDeviceWarningModal({
  open,
  onConfirm,
  onCancel,
  className,
  confirmButtonClassName,
  cancelButtonClassName,
  labels: labelsProp,
}: HostDeviceWarningModalProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleClose() {
      onCancel();
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onCancel]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  }

  const headingId = "host-device-warning-title";

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      className={className}
      aria-labelledby={headingId}
      onClick={handleBackdropClick}
    >
      <h3 id={headingId}>{labels.title}</h3>
      <p>{labels.body}</p>
      <div data-host-warning-actions="">
        <button
          type="button"
          className={cancelButtonClassName}
          onClick={onCancel}
        >
          {labels.cancelLabel}
        </button>
        <button
          type="button"
          className={confirmButtonClassName}
          onClick={onConfirm}
        >
          {labels.confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
