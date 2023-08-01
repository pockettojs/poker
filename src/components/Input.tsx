import { ForwardedRef, forwardRef, useEffect, useState } from 'react';

export type InputValueProps = {
    value: string,
};

export type InputProps = {
    id?: string,
    label?: string,
    type?: 'text' | 'password' | 'number' | 'email' | 'search' | 'tel',
    onFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onChange?: (value: string) => void,
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
    onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    onRightIconClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onLeftIconClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    styleType?: 'default' | 'search',
    placeholder?: string,
    readonly?: boolean,
    size?: 'xs' | 'sm' | 'md' | 'lg',
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full',
    ref?: React.RefObject<HTMLInputElement>,
    leftIcon?: React.ReactNode,
    leftInput?: React.ReactNode,
    rightIcon?: React.ReactNode,
};

export default forwardRef(({
    label,
    value,
    onFocus,
    onChange,
    onBlur,
    onKeyUp,
    styleType = 'default',
    type = 'text',
    placeholder = '',
    readonly = false,
    size = 'md',
    rounded = 'md',

    leftIcon,
    onLeftIconClick,

    rightIcon,
    onRightIconClick,

    leftInput,
}: InputProps & InputValueProps, ref: ForwardedRef<HTMLInputElement>) => {
    const DEFAULT_STYLE = 'block appearance-none placeholder-gray-500 dark:bg-gray-700 border dark:border-gray-700 w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline ';
    const SEARCH_STYLE = 'block appearance-none bg-gray-100 dark:bg-gray-700 placeholder-slate-400 w-full py-1 px-3 text-black dark:text-white leading-dark focus:outline-none focus:shadow-outline ';
    const inputContainerStyle = 'relative flex flex-col';

    const [inputStyle, setInputStyle] = useState(DEFAULT_STYLE);
    const [paddingLeft, setPaddingLeft] = useState('pl-4');
    const [sizeStyle, setSizeStyle] = useState('h-10');
    const [roundedStyle, setRoundedStyle] = useState('rounded-md');
    useEffect(() => {
        if (styleType === 'search') {
            setInputStyle(SEARCH_STYLE);
        } else {
            setInputStyle(DEFAULT_STYLE);
        }
        if (leftIcon) {
            setPaddingLeft('pl-10');
        }
        if (leftInput) {
            setPaddingLeft('pl-12');
        }
        if (size === 'lg') {
            setSizeStyle('h-12 text-lg');
        } else if (size === 'sm') {
            setSizeStyle('h-8 text-sm');
        } else if (size === 'xs') {
            setSizeStyle('h-6 text-xs');
        }
        if (rounded === 'none') {
            setRoundedStyle('');
        } else if (rounded === 'sm') {
            setRoundedStyle('rounded-sm');
        } else if (rounded === 'md') {
            setRoundedStyle('rounded-md');
        } else if (rounded === 'lg') {
            setRoundedStyle('rounded-lg');
        } else if (rounded === 'full') {
            setRoundedStyle('rounded-full');
        }
    }, [styleType, leftIcon, leftInput, rounded, size]);
    return (
        <div className={inputContainerStyle}>
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</label>
            <div className="relative">
                <input
                    ref={ref}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onFocus={onFocus}
                    onChange={(e) => onChange?.(e.target.value)}
                    onKeyUp={onKeyUp}
                    onBlur={onBlur}
                    className={inputStyle + ' ' + paddingLeft + ' ' + sizeStyle + ' ' + roundedStyle}
                    readOnly={readonly}
                />
                <div
                    className={
                        'absolute left-0 top-0 h-full flex items-center px-2 ' + (leftIcon && 'cursor-pointer')
                    }
                    onClick={onLeftIconClick}
                >{leftIcon || leftInput}</div>
                <div
                    className='absolute right-0 top-0 h-full flex items-center px-2 cursor-pointer'
                    onClick={onRightIconClick}
                >{rightIcon}</div>
            </div>
        </div>
    );
});
