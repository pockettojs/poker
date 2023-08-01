import { useState } from 'react';

function Dialog() {
    const [show, setShow] = useState(true);

    return <>
        {
            show && <div className='dialog-backdrop' onClick={() => setShow(false)} />
        }
        <dialog 
            open={show} 
            className='rounded bg-white shadow-md w-1/2 h-1/2 z-20 mt-20' 
            onClose={() => setShow(false)}
            onClick={() => setShow(false)}
        >
            Test
        </dialog>
    </>;
}

export default Dialog;