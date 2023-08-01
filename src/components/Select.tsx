import { useState, useRef, useEffect } from 'react';
import Input, { InputProps } from './Input';
import { Dismiss16Regular } from '@ricons/fluent';

export type Option = {
    label: string;
    value: string | number | boolean;
    [key: string]: any;
};

export type SelectProps<T> = {
    value: T;
    options: Option[];
    /**
     * Emit the selected value when the user clicks on an option
     */
    onSelect?: (value: T | undefined, option: Option) => void;
};

export default function Search<T>({
    label,
    value,
    onChange = () => ({}),
    onBlur = () => ({}),
    onSelect = () => ({}),
    styleType = 'default',
    placeholder = '',
    readonly = false,
    options = [],
}: SelectProps<T> & InputProps) {
    const [hidden, setHidden] = useState(true);
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>();
    const [selectedLabel, setSelectedLabel] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(selectedLabel.toLowerCase()));
    const filteredOptionLength = filteredOptions.length;

    const DROPDOWN_STYLE =
        'z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-md w-100 dark:bg-gray-700';

    useEffect(() => {
        if (inputRef.current && !hidden) {
            setDropdownWidth((inputRef.current as HTMLElement).offsetWidth);
        }
        if (value) {
            const selectedOption = options.find((option) => option.value === value);
            if (selectedOption) {
                setSelectedLabel(selectedOption.label);
            }
        }
    }, [hidden, value, options]);

    const handleOptionMouseDown = (selectedOption: Option, e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevents the input from losing focus
        const event = {
            target: {
                value: selectedOption.value,
            },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(event.target.value);
        setSelectedLabel(selectedOption.label);
        onSelect(selectedOption.value as T, selectedOption);
        if (inputRef.current) {
            inputRef.current.blur();
        }
        setHidden(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const isDropdownClick = dropdownRef.current && dropdownRef.current.contains(e.relatedTarget as Node);

        if (!isDropdownClick) {
            setHidden(true);
            onBlur(e);
            setHighlightedIndex(undefined);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!inputRef.current) {
            return;
        }
        if (e.key === 'ArrowDown') {
            setHighlightedIndex((prev) => ((prev || 0) + 1) % filteredOptionLength);
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex((prev) => {
                if (prev === 0) {
                    return filteredOptionLength - 1;
                }
                return (prev || 1) - 1;
            });
        } else if (e.key === 'Enter') {
            const event = {
                target: {
                    value: filteredOptions[highlightedIndex || 0].value,
                },
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(event.target.value);
            setSelectedLabel(filteredOptions[highlightedIndex || 0].label);
            onSelect(filteredOptions[highlightedIndex || 0].value as T, filteredOptions[highlightedIndex || 0]);
            inputRef.current.blur();
            setHidden(true);
        } else if (e.key === 'Escape') {
            inputRef.current.blur();
            setHidden(true);
        }
    };

    const HIGHLIGHTED_DROPDOWN_ITEM_STYLE = 'block px-4 py-2 bg-gray-100 dark:bg-gray-600 dark:text-white cursor-pointer';
    const DEFAULT_DROPDOWN_ITEM_STYLE = 'block px-4 py-2 cursor-pointer';

    return (
        <>
            <Input
                id={'dropdownDefaultInput'}
                label={label}
                value={selectedLabel}
                onFocus={() => {
                    setHidden(false);
                    setHighlightedIndex(0);
                }}
                onChange={(text) => {
                    setSelectedLabel(text);
                    onChange(text);
                }}
                onKeyUp={(e) => handleKeyPress(e)}
                onBlur={handleBlur}
                styleType={styleType}
                placeholder={placeholder}
                readonly={readonly}
                ref={inputRef}
                rightIcon={selectedLabel ? <Dismiss16Regular className="text-gray-400 dark:text-gray-300 w-5" /> : <></>}
                onRightIconClick={() => {
                    setSelectedLabel('');
                    onChange('');
                    onSelect(undefined, { label: '', value: '' });
                }}
            />
            <div
                id="dropdown"
                className={DROPDOWN_STYLE + (hidden ? ' hidden' : '')}
                style={{ width: dropdownWidth, position: 'absolute' }}
                ref={dropdownRef}
            >
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultInput">
                    {
                        filteredOptions.map((option, index) => (
                            <li key={option.label}>
                                <div
                                    className={highlightedIndex === index ? HIGHLIGHTED_DROPDOWN_ITEM_STYLE : DEFAULT_DROPDOWN_ITEM_STYLE}
                                    onMouseDown={(e) => handleOptionMouseDown(option, e)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    {option.label}
                                </div>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </>
    );
}
