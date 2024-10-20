import { cn } from "src/utils/cn";

type AlertProps = {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
};

function Alert({
    message,
    type = 'success',
}: AlertProps) {
    return <>
        <dialog
            open
            className={cn(
                'rounded shadow-md z-20 right-to-left-fade',
                type === 'success' && 'bg-green-100 text-green-800',
                type === 'error' && 'bg-red-100 text-red-800',
                type === 'info' && 'bg-blue-100 text-blue-800',
                type === 'warning' && 'bg-yellow-100 text-yellow-800',
            )}
            style={{
                marginRight: '1%',
                paddingLeft: '1%',
                paddingRight: '1%',
                marginTop: '1%',
                paddingTop: '12px',
                height: '48px',
                minWidth: '20%',
                position: 'fixed',
            }}
        >
            <div>
                {message}
            </div>
        </dialog>
    </>;
}

export default Alert;