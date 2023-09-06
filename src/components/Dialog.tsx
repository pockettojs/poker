export type DialogProps = {
    children?: JSX.Element | (JSX.Element | string | boolean | undefined | null)[] | null | string | undefined;
    show: boolean;
    onClose?: () => void;
    onClick?: () => void;
};

function Dialog({
    children,
    show,
    onClose,
    onClick,
}: DialogProps) {
    return <>
        {
            show && <div className='absolute dialog-backdrop' onClick={() => onClose?.()} />
        }
        <dialog
            open={show}
            className='absolute rounded bg-white dark:bg-slate-700 shadow-md w-1/2 min-h-1/2 z-20 mt-20'
            onClose={() => onClose?.()}
            onClick={() => onClick?.()}
        >
            {children}
        </dialog>
    </>;
}

export default Dialog;