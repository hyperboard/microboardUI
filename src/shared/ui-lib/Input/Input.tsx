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
import styles from "./Input.module.css";

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
    onFocus,
    onBlur,
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
    <div className={styles.InputWrapper}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(styles.inputLabel, disabled && styles.disabled)}
        >
          {label}
        </label>
      )}
      <div className={styles.inputTabWrapper}>
        {tab && <span className={styles.inputTab}>{tab}</span>}
        <div
          className={clsx(
            styles.inputContainer,
            hasError && styles.inputError,
            isSuccess && styles.inputSuccess,
            inputContainerClassName,
          )}
        >
          {prefixIcon && (
            <span style={{ color: iconColor }} className={styles.inputPrefix}>
              {prefixIcon}
            </span>
          )}
          {props.multiline ? (
            <textarea
              ref={textareaRef}
              id={id}
              disabled={disabled}
              rows={1}
              className={styles.inputTextarea}
              onInput={(ev) => {
                handleInput();
                props.onInput?.(ev);
              }}
              onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
              onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
              onPaste={(ev) => ev.stopPropagation()}
              onCopy={(ev) => ev.stopPropagation()}
              {...(restProps as Omit<TextareaProps, "id">)}
            />
          ) : (
            <input
              ref={inputRef}
              id={id}
              type={inputType}
              className={styles.input}
              disabled={disabled}
              onInput={onInput as React.FormEventHandler<HTMLInputElement>}
              onFocus={onFocus as React.FocusEventHandler<HTMLInputElement>}
              onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
              onKeyDown={stopPropagation(onKeyDown)}
              onKeyUp={stopPropagation(onKeyUp)}
              onKeyPress={stopPropagation(onKeyPress)}
              {...(restProps as Omit<InputProps, "id" | "multiline">)}
            />
          )}
          {password && inputType === "text" && (
            <div className={styles.eye}>
              <EyeClose onClick={togglePassword} />
            </div>
          )}
          {password && inputType === "password" && (
            <div className={styles.eye}>
              <EyeOpen onClick={togglePassword} />
            </div>
          )}
          {postfixButton && (
            <span className={styles.inputPostfix}>{postfixButton}</span>
          )}
          {keyhint && <div className={styles.inputKeyHint}>{keyhint}</div>}
        </div>
        <span className={styles.inputPostTab}>{props.postTab}</span>
      </div>
      {(errorText || helperText || successText) && (
        <div className={styles.text}>
          {errorText && (
            <span className={styles.inputErrorText}>{errorText}</span>
          )}
          {helperText && !errorText && (
            <span className={styles.inputHelperText}>{helperText}</span>
          )}
          {successText && (
            <span className={styles.inputSuccessText}>{successText}</span>
          )}
        </div>
      )}
    </div>
  );
};
