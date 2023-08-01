type AlertProps = {
    message: string;
    type?: 'success' | 'error';
};

function Alert({
    message,
    type = 'success',
}: AlertProps) {
    return <>
        <dialog
            open
            className={'rounded shadow-md z-20 right-to-left-fade ' + (type === 'success' ? ' bg-green-100 text-green-500' : ' bg-red-100 text-red-500')}
            style={{
                marginRight: '1%',
                paddingLeft: '1%',
                marginTop: '1%',
                paddingTop: '12px',
                height: '48px',
                minWidth: '20%',
            }}
        >
            <div>
                {message}
            </div>
        </dialog>
    </>;
}

export default Alert;