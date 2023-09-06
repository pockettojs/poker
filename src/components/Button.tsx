import { ForwardedRef, forwardRef, useEffect, useState } from 'react';

export type ButtonProps = {
    className?: string;
    children?: JSX.Element | (JSX.Element | string | boolean)[] | string | undefined;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    align?: 'left' | 'center' | 'right';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    type?: 'default' | 'text' | 'outline';
    color?: 'red' | 'green' | 'yellow' | 'orange' | 'blue' | 'indigo' | 'teal' | 'purple' | 'pink' | 'amber' | 'slate' | 'automate' | string;
    disabled?: boolean;
};

export default forwardRef(({
    children,
    onClick = () => ({}),
    onMouseEnter = () => ({}),
    onMouseLeave = () => ({}),
    type = 'default',
    className = '',
    align = 'center',
    size = 'md',
    rounded = 'md',
    color = 'automate',
    disabled = false,
}: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const [textColor, setTextColor] = useState('');
    const [hoverTextColor, setHoverTextColor] = useState('');
    const [bgColor, setBgColor] = useState('');
    const [borderColor, setBorderColor] = useState('');
    const [hoverBgColor, setHoverBgColor] = useState('');
    const [buttonSize, setButtonSize] = useState('text-md h-18');
    const [buttonRounded] = useState(`rounded-${rounded || ''}`);
    const BUTTON_STYLE = `inline-flex items-center justify-${align} w-full px-4 py-1 text-base font-medium focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-slate-300 sm:w-auto disabled:opacity-75`;

    useEffect(() => {
        if (size === 'lg') {
            setButtonSize('text-lg h-18');
        } else if (size === 'md') {
            setButtonSize('text-md h-10');
        } else if (size === 'sm') {
            setButtonSize('text-sm h-8');
        } else if (size === 'xs') {
            setButtonSize('text-xs h-5');
        }
        if (type === 'text') {
            setHoverBgColor('hover:bg-gray-50');
            setBgColor('bg-transparent');
            if (color === 'automate') {
                setTextColor('text-automate-500 dark:text-automate-600');
            } else if (color === 'red') {
                setTextColor('text-red-500 dark:text-red-600');
            } else if (color === 'green') {
                setTextColor('text-green-500 dark:text-green-600');
            } else if (color === 'yellow') {
                setTextColor('text-yellow-500 dark:text-yellow-600');
            } else if (color === 'orange') {
                setTextColor('text-orange-500 dark:text-orange-600');
            } else if (color === 'blue') {
                setTextColor('text-blue-500 dark:text-blue-600');
            } else if (color === 'indigo') {
                setTextColor('text-indigo-500 dark:text-indigo-600');
            } else if (color === 'teal') {
                setTextColor('text-teal-500 dark:text-teal-600');
            } else if (color === 'purple') {
                setTextColor('text-purple-500 dark:text-purple-600');
            } else if (color === 'pink') {
                setTextColor('text-pink-500 dark:text-pink-600');
            } else if (color === 'amber') {
                setTextColor('text-amber-500 dark:text-amber-600');
            } else if (color === 'slate') {
                setTextColor('text-slate-500 dark:text-slate-600');
            } else if (color === 'white') {
                setTextColor('text-white dark:text-slate-600');
            } else {
                setTextColor(`text-[${color}] dark:text-[${color}]`);
            }
        } else if (type === 'outline') {
            setHoverTextColor('hover:text-white');
            if (color === 'automate') {
                setBorderColor('border border-automate-500');
                setTextColor('text-automate-500');
                setHoverBgColor('hover:bg-automate-500');
            } else if (color === 'red') {
                setBorderColor('border border-red-500');
                setTextColor('text-red-500');
                setHoverBgColor('hover:bg-red-500');
            } else if (color === 'green') {
                setBorderColor('border border-green-500');
                setTextColor('text-green-500');
                setHoverBgColor('hover:bg-green-500');
            } else if (color === 'yellow') {
                setBorderColor('border border-yellow-500');
                setTextColor('text-yellow-500');
                setHoverBgColor('hover:bg-yellow-500');
            } else if (color === 'orange') {
                setBorderColor('border border-orange-500');
                setTextColor('text-yellow-500');
                setHoverBgColor('hover:bg-orange-500');
            } else if (color === 'blue') {
                setBorderColor('border border-blue-500');
                setTextColor('text-blue-500');
                setHoverBgColor('hover:bg-blue-500');
            } else if (color === 'indigo') {
                setBorderColor('border border-indigo-500');
                setTextColor('text-indigo-500');
                setHoverBgColor('hover:bg-indigo-500');
            } else if (color === 'teal') {
                setBorderColor('border border-teal-500');
                setTextColor('text-teal-500');
                setHoverBgColor('hover:bg-teal-500');
            } else if (color === 'purple') {
                setBorderColor('border border-purple-500');
                setTextColor('text-purple-500');
                setHoverBgColor('hover:bg-purple-500');
            } else if (color === 'pink') {
                setBorderColor('border border-pink-500');
                setTextColor('text-pink-500');
                setHoverBgColor('hover:bg-pink-500');
            } else if (color === 'amber') {
                setBorderColor('border border-amber-500');
                setTextColor('text-amber-500');
                setHoverBgColor('hover:bg-amber-500');
            } else if (color === 'slate') {
                setBorderColor('border border-slate-500');
                setTextColor('text-slate-500');
                setHoverBgColor('hover:bg-slate-500');
            }
        } else if (type === 'default') {
            setTextColor('text-white');
            if (color === 'automate') {
                setBgColor('bg-automate-500 dark:bg-automate-600');
                setHoverBgColor('hover:bg-automate-600 dark:hover:bg-automate-700');
            } else if (color === 'red') {
                setBgColor('bg-red-500 dark:bg-red-600');
                setHoverBgColor('hover:bg-red-600 dark:hover:bg-red-700');
            } else if (color === 'green') {
                setBgColor('bg-green-500 dark:bg-green-600');
                setHoverBgColor('hover:bg-green-600 dark:hover:bg-green-700');
            } else if (color === 'yellow') {
                setBgColor('bg-yellow-500 dark:bg-yellow-600');
            } else if (color === 'orange') {
                setBgColor('bg-orange-500 dark:bg-orange-600');
                setHoverBgColor('hover:bg-orange-600 dark:hover:bg-orange-700');
            } else if (color === 'blue') {
                setBgColor('bg-blue-500 dark:bg-blue-600');
                setHoverBgColor('hover:bg-blue-600 dark:hover:bg-blue-700');
            } else if (color === 'indigo') {
                setBgColor('bg-indigo-500 dark:bg-indigo-600');
                setHoverBgColor('hover:bg-indigo-600 dark:hover:bg-indigo-700');
            } else if (color === 'teal') {
                setBgColor('bg-teal-500 dark:bg-teal-600');
                setHoverBgColor('hover:bg-teal-600 dark:hover:bg-teal-700');
            } else if (color === 'purple') {
                setBgColor('bg-purple-500 dark:bg-purple-600');
                setHoverBgColor('hover:bg-purple-600 dark:hover:bg-purple-700');
            } else if (color === 'pink') {
                setBgColor('bg-pink-500 dark:bg-pink-600');
                setHoverBgColor('hover:bg-pink-600 dark:hover:bg-pink-700');
            } else if (color === 'amber') {
                setBgColor('bg-amber-500 dark:bg-amber-600');
                setHoverBgColor('hover:bg-amber-600 dark:hover:bg-amber-700');
            } else if (color === 'slate') {
                setBgColor('bg-slate-500 dark:bg-slate-600');
                setHoverBgColor('hover:bg-slate-600 dark:hover:bg-slate-700');
            } else if (color === 'grey') {
                setBgColor('bg-slate-200 dark:bg-slate-600');
                setTextColor('text-slate-600 dark:text-slate-200');
                setHoverBgColor('hover:bg-slate-400 dark:hover:bg-slate-700');
            } else {
                setBgColor(`bg-[${color}] dark:bg-[${color}]`);
                setHoverBgColor(`hover:bg-[${color}] dark:hover:bg-[${color}]`);
            }
        }
    }, [color, type, size]);
    if (!textColor) {
        return <></>;
    }
    return (
        <div className="flex flex-col">
            <button
                ref={ref}
                disabled={disabled}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={BUTTON_STYLE + ' ' + bgColor + ' ' + hoverBgColor + ' ' + borderColor + ' ' + textColor + ' ' + hoverTextColor + ' ' + buttonSize + ' ' + buttonRounded + ' ' + className}
            >
                {children}
            </button>
        </div>
    );
});
