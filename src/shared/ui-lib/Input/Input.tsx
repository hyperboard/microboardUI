import clsx from "clsx";
import React, {
  useEffect,
  useRef,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { EyeClose } from "./EyeClose";
import { EyeOpen } from "./EyeOpen";
import "./Input.css";

interface BaseProps {
  id: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  successText?: string;
  errorText?: string;
  isSuccess?: boolean;
  tab?: string;
  postTab?: string;
  prefixIcon?: React.ReactNode;
  iconColor?: string;
  postfixButton?: React.ReactNode;
  postfix?: string;
  keyhint?: string;
  password?: boolean;
  hasError?: boolean;
  inputContainerClassName?: string;
  shouldFocus?: boolean;
  shouldSelect?: boolean;
}

type TextareaProps = BaseProps & {
  multiline: true;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

type InputProps = BaseProps & {
  multiline?: false;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">;

type Props = TextareaProps | InputProps;

export const Input: React.FC<Props> = (props) => {
  const {
    id,
    prefixIcon,
    label,
    tab,
    keyhint,
    errorText,
    helperText,
    password,
    isSuccess,
    hasError,
    iconColor,
    postfixButton,
    inputContainerClassName,
    shouldFocus,
    successText,
    shouldSelect,
    disabled,
    onInput,
    onPaste,
    onCopy,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    ...restProps
  } = props;

  const [inputType, setInputType] = useState(
    password ? "password" : ("type" in props && props.type) || "text",
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (props.multiline) handleInput();
  }, [textareaRef.current?.textLength]);

  useEffect(() => {
    if (shouldFocus) {
      if (inputRef.current) {
        inputRef.current.focus();
      } else {
        textareaRef.current?.focus();
      }
    }
    if (shouldSelect) {
      if (inputRef.current) {
        inputRef.current.select();
      } else {
        textareaRef.current?.select();
      }
    }
  }, []);

  const togglePassword: MouseEventHandler = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    setInputType((t) => (t === "text" ? "password" : "text"));
  };
  const stopPropagation =
    (cb?: KeyboardEventHandler): KeyboardEventHandler =>
    (ev) => {
      ev.stopPropagation();
      cb?.(ev);
    };

  return (
    <div className="InputWrapper">
      {label && (
        <label
          htmlFor={id}
          className={clsx("InputLabel", disabled && "Disabled")}
        >
          {label}
        </label>
      )}
      <div className="InputTabWrapper">
        {tab && <span className="InputTab">{tab}</span>}
        <div
          className={clsx(
            "InputContainer",
            hasError && "InputError",
            isSuccess && "InputSuccess",
            inputContainerClassName,
          )}
        >
          {prefixIcon && (
            <span style={{ color: iconColor }} className="InputPrefix">
              {prefixIcon}
            </span>
          )}
          {props.multiline ? (
            <textarea
              ref={textareaRef}
              id={id}
              disabled={disabled}
              rows={1}
              onInput={(ev) => {
                handleInput();
                props.onInput?.(ev);
              }}
              onPaste={(ev) => ev.stopPropagation()}
              onCopy={(ev) => ev.stopPropagation()}
              {...(restProps as Omit<TextareaProps, "id">)}
            />
          ) : (
            <input
              ref={inputRef}
              id={id}
              type={inputType}
              className="Input"
              disabled={disabled}
              onKeyDown={stopPropagation(onKeyDown)}
              onKeyUp={stopPropagation(onKeyUp)}
              onKeyPress={stopPropagation(onKeyPress)}
              {...(restProps as Omit<InputProps, "id" | "multiline">)}
            />
          )}
          {password && inputType === "text" && (
            <div className="Eye">
              <EyeClose onClick={togglePassword} />
            </div>
          )}
          {password && inputType === "password" && (
            <div className="Eye">
              <EyeOpen onClick={togglePassword} />
            </div>
          )}
          {postfixButton && (
            <span className="InputPostfix">{postfixButton}</span>
          )}
          {keyhint && <div className="InputKeyHint">{keyhint}</div>}
        </div>
        <span className="InputPostTab">{props.postTab}</span>
      </div>
      {(errorText || helperText || successText) && (
        <div className="Text">
          {errorText && <span className="InputErrorText">{errorText}</span>}
          {helperText && !errorText && (
            <span className="InputHelperText">{helperText}</span>
          )}
          {successText && (
            <span className="InputSuccessText">{successText}</span>
          )}
        </div>
      )}
    </div>
  );
};
