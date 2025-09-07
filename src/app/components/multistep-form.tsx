"use client";
import { useState } from "react";

// Define a type for a single field in a step
type DetailField = {
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
};

// Define a type for a single step
type DetailStep = {
    step: number;
    title: string;
    fields: DetailField[];
};

// Use the type for the steps prop
export default function MultiStepDetailForm({
    steps,
    onClose,
    onSubmitForm,
}: {
    steps: DetailStep[],
    onClose: () => void,
    onSubmitForm: (data: Record<string, string>) => void
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>(() => {
        // Initialize form data structure
        const data: Record<string, string> = {};
        steps.forEach((step, sIdx) => {
            step.fields.forEach((field, fIdx) => {
                // Use label as key for simplicity
                data[`${sIdx}-${fIdx}`] = "";
            });
        });
        return data;
    });
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const step = steps[currentStep];

    // Validation: check required fields in current step
    const isStepValid = step.fields.every((field, idx) => {
        if (!field.required) return true;
        const key = `${currentStep}-${idx}`;
        return formData[key] && formData[key].toString().trim() !== "";
    });

    const handleFieldChange = (idx: number, value: string) => {
        const key = `${currentStep}-${idx}`;
        setFormData(prev => ({ ...prev, [key]: value }));
        setTouched(prev => ({ ...prev, [key]: true }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1 && isStepValid) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isStepValid) {
            const output: Record<string, string> = {};
            steps.forEach((step, sIdx) => {
                step.fields.forEach((field, fIdx) => {
                    output[field.label] = formData[`${sIdx}-${fIdx}`];
                });
            });
            onSubmitForm(output); 
        }
    };

    // Stepper/progress indicator
    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1"
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
            }}>
            <div className="">
                <div className="flex items-center justify-center">
                    {steps.map((s, idx) => (
                        <div key={s.step} className="flex items-center">
                            <div className={`
                                flex items-center justify-center rounded-full w-8 h-8 text-sm font-bold
                                ${idx < currentStep ? "bg-green-500 text-white" : ""}
                                ${idx === currentStep ? "bg-blue-600 text-white" : ""}
                                ${idx > currentStep ? "bg-gray-200 dark:bg-neutral-800 text-gray-400" : ""}
                                border-2 border-blue-400
                                transition-all
                            `}>
                                {idx < currentStep ? <span>&#10003;</span> : idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="w-8 h-1 bg-blue-300 dark:bg-neutral-700 mx-1 rounded" />
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-center mt-2 text-sm text-gray-600 dark:text-neutral-300 font-medium">
                    Step {currentStep + 1} of {steps.length}: {step.title}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
                    <h5 className="text-md font-semibold mb-4 text-center">{step.title}</h5>
                    {step.fields.map((field, idx) => {
                        const key = `${currentStep}-${idx}`;
                        const value = formData[key] || "";
                        const showError = field.required && touched[key] && (!value || value.toString().trim() === "");
                        return (
                            <div key={idx} className="mb-4">
                                <label className="block mb-1 text-sm font-medium dark:text-white text-black">
                                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {field.type === "textarea" ? (
                                    <textarea
                                        className={`w-full p-2 border ${showError ? "border-red-500" : "border-gray-300"} rounded dark:bg-neutral-800 dark:text-white text-black`}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        value={value}
                                        onChange={e => handleFieldChange(idx, e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, [key]: true }))}
                                    />
                                ) : field.type === "select" ? (
                                    <select
                                        className={`w-full p-2 border ${showError ? "border-red-500" : "border-gray-300"} rounded dark:bg-neutral-800 dark:text-white text-black`}
                                        required={field.required}
                                        value={value}
                                        onChange={e => handleFieldChange(idx, e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, [key]: true }))}
                                    >
                                        <option value="">Select an option</option>
                                        {field.options && field.options.map((option, oIdx) => (
                                            <option key={oIdx} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        className={`w-full p-2 border ${showError ? "border-red-500" : "border-gray-300"} rounded dark:bg-neutral-800 dark:text-white text-black`}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        value={value}
                                        onChange={e => handleFieldChange(idx, e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, [key]: true }))}
                                    />
                                )}
                                {showError && (
                                    <div className="text-xs text-red-500 mt-1">This field is required.</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex justify-between mt-8 px-2">
                <button
                    type="button"
                    onClick={currentStep === 0 ? onClose : handlePrev}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-800 text-black dark:text-white border border-gray-300 dark:border-neutral-700 text-sm font-medium"
                >
                    {currentStep === 0 ? "Back" : "Previous"}
                </button>
                {currentStep < steps.length - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid}
                        className={`px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium border border-blue-700 ${!isStepValid ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!isStepValid}
                        className={`px-4 py-2 rounded bg-green-600 text-white text-sm font-medium border border-green-700 ${!isStepValid ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Submit
                    </button>
                )}
            </div>
        </form>
    );
}
