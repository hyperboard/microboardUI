import { Modal } from "shared/ui-lib/Modal";
import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../../shared/ui-lib/Input";
import { Button } from "../../../shared/ui-lib/Button";
import { useAppContext } from "../../AppContext";
import { getApiUrl } from "../../../Config";
import Cookies from "js-cookie";
import styles from "./CreateTemplateModal.module.css";

interface CreateTemplateModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const CreateTemplateModal = ({
	isOpen,
	setIsOpen,
}: CreateTemplateModalProps): JSX.Element => {
	const formRef = useRef<HTMLFormElement>(null);
	const imageSrc = useRef<null | string>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const { t } = useTranslation();
	const { board } = useAppContext();

	useEffect(() => {
		return () => {
			formRef.current?.reset();
		};
	}, []);

	const handleFileChange: ChangeEventHandler<HTMLInputElement> = e => {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		const headers = new Headers();
		headers.append("content-type", "image/png");
		headers.append("x-image-id", Date.now().toString());

		const requestOptions = {
			method: "POST",
			headers,
			body: file,
		};

		setSubmitDisabled(true);

		fetch("http://localhost:8000/api/v1/media", requestOptions)
			.then(response => response.json())
			.then(result => {
				imageSrc.current = result.src;
			})
			.finally(() => setSubmitDisabled(false));
	};

	const handleChangeImageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.click();
	};

	async function createTemplate(body: string) {
		const response = await fetch(
			`${getApiUrl()}/boards/${board.getBoardId()}/template`,
			{
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${Cookies.get("accessToken")}`,
				},
				body,
				redirect: "follow",
				referrerPolicy: "no-referrer",
			},
		);
		if (!response.ok) {
			throw new Error("response not OK");
		}
	}

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		setErrors([]);

		const form = formRef.current;
		const description = form?.description.value;
		const language = form?.language.value;
		let tags = form?.tags.value;
		if (tags) {
			tags = tags.split(",");
		}
		const snapshot = board.getSnapshot();

		setIsSubmitLoading(true);
		setSubmitDisabled(true);

		const body = JSON.stringify({
			description,
			language,
			tags,
			snapshot,
			preview: imageSrc.current,
		});

		await createTemplate(body)
			.then(res => {
				formRef.current?.reset();
				setSubmitDisabled(false);
				setIsSubmitLoading(false);
				setIsOpen(false);
			})
			.catch(() => {
				setErrors(["Error while creating template"]);
			})
			.finally(() => {
				setSubmitDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
		>
			<form
				id="create-template-form"
				onSubmit={onSubmit}
				ref={formRef}
				className={styles.form}
			>
				<h1>Create template</h1>
				<input
					ref={inputRef}
					onChange={handleFileChange}
					type="file"
					style={{ display: "none" }}
				/>
				<Button onClick={handleChangeImageClick}>Choose preview</Button>
				<Input id="description" placeholder="Description" />
				<Input id="tags" placeholder="tags" />
				<select defaultValue="ru" id="language">
					<option value="ru">Russian</option>
					<option value="en">English</option>
				</select>
				<Button
					type="submit"
					disabled={submitDisabled}
					loading={isSubmitLoading}
				>
					Save
				</Button>
				{errors.length ? (
					<p className={styles.errorText}>{errors[0]}</p>
				) : undefined}
			</form>
		</Modal>
	);
};
