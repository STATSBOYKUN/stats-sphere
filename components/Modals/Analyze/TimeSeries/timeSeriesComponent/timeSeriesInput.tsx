type InputRowProps = {
    label: string;
    id: string;
    value: number;
    min: string;
    max: string;
    step: string;
    onChange: (value: number) => void;
};

const InputRow: React.FC<InputRowProps> = ({ label, id, value, min, max, step, onChange }) => {
    return (
        <div className="flex flex-row">
            <label className="w-[65px] text-sm font-semibold" htmlFor={id}>
                {label} :
            </label>
            <input
                className="w-[40px]  text-sm font-semibold rounded-lg pl-1"
                type="number"
                id={id}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
};

export { InputRow };