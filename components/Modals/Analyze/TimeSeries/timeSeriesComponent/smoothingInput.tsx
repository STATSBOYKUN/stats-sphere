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
        <div className="flex flex-row gap-2">
            <label className="max-w-sm pl-2 rounded-lg" htmlFor={id}>
                {label} :
            </label>
            <input
                className="w-12 pl-2 rounded-lg"
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