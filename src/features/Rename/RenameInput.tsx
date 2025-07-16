import clsx from "clsx";
import React, {
  ChangeEventHandler,
  FocusEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  type SyntheticEvent,
} from "react";

import style from "./RenameInput.module.css";
import { useRenameContext } from "./RenameContext";

export function RenameInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { newName, rename, setNewName, setRenamingId } = useRenameContext();

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.focus();
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }, []);

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    rename();
    setNewName("");
    setRenamingId(null);
  };

  const preventPropagation = (event: SyntheticEvent) => event.stopPropagation();

  const handleCancel: KeyboardEventHandler = (event) => {
    event.stopPropagation();
    if (event.code === "Escape") {
      setNewName("");
      setRenamingId(null);
    }
  };

  const handleBlur: FocusEventHandler = () => {
    rename();

    setTimeout(() => {
      setNewName("");
      setRenamingId(null);
    }, 100);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    setNewName(ev.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={clsx(style.form)}>
      <input
        ref={inputRef}
        className={clsx(style.input)}
        onChange={handleChange}
        onKeyDown={handleCancel}
        onKeyUp={preventPropagation}
        onClick={preventPropagation}
        onPointerDown={preventPropagation}
        onPointerUp={preventPropagation}
        onBlur={handleBlur}
        value={newName}
        type="text"
      />
    </form>
  );
}
