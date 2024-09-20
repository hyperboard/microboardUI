import { Modal } from "shared/ui-lib/Modal";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TemplateItem } from "../TemplateItem/TemplateItem";
import styles from "./SelectTemplateModal.module.css";
import { ModalSize } from "../../../shared/ui-lib/Modal/Modal";

interface SelectTemplateModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const SelectTemplateModal = ({
	isOpen,
	setIsOpen,
}: SelectTemplateModalProps): JSX.Element => {
	const { t } = useTranslation();
	const [templates, setTemplates] = useState<any[]>([]);

	useEffect(() => {
		if (isOpen) {
			geTemplates().then(templates => setTemplates(templates));
		}
	}, [isOpen]);

	const geTemplates = async () => {
		return fetch("http://localhost:8000/api/v1/boards/templates", {
			method: "GET",
		})
			.then(response => response.json())
			.catch(error => console.error(error));
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.M}>
			{templates && (
				<div className={styles.container}>
					{templates.map(template => (
						<TemplateItem
							preview={template.preview}
							description={template.desc}
							language={template.lan}
							tags={template.tags}
							snapshot={template.snapshot}
							setIsOpen={setIsOpen}
						/>
					))}
				</div>
			)}
		</Modal>
	);
};
