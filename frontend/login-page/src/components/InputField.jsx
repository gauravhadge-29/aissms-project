import { useState } from "react";

export default function InputField({ type, name, placeholder, icon, value, onChange }) {
    const [isPasswordShown, setIsPasswordShown] = useState(false);

    return (
        <div className="input-wrapper">
            <input
                type={isPasswordShown ? "text" : type}
                name={name} // Ensure form state is updated
                placeholder={placeholder}
                className="input-field"
                required
                value={value} // Controlled component
                onChange={onChange} // Handle input change
            />
            <i className="material-symbols-rounded">
                {icon}
            </i>
            {type === "password" && (
                <i 
                    onClick={() => setIsPasswordShown((prev) => !prev)}
                    className="material-symbols-rounded eye-icon"
                >
                    {isPasswordShown ? "visibility" : "visibility_off"}
                </i>
            )}
        </div>
    );
}
