import { Modal } from "shared/ui-lib/Modal";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TemplateItem } from "../TemplateItem/TemplateItem";
import styles from "./SelectTemplateModal.module.css";
import { ModalSize } from "../../../shared/ui-lib/Modal/Modal";
import { Template } from "../types";
import { TemplateItemPreview } from "../TemplateItemPreview/TemplateItemPreview";
import { getApiUrl } from "../../../Config";

interface SelectTemplateModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const SelectTemplateModal = ({
	isOpen,
	setIsOpen,
}: SelectTemplateModalProps): JSX.Element => {
	const { t } = useTranslation();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [presentedTemplate, setPresentedTemplate] = useState<Template | null>(
		null,
	);

	useEffect(() => {
		if (isOpen) {
			geTemplates().then(templates => setTemplates(templates));
		}
	}, [isOpen]);

	const geTemplates = async (): Promise<Template[]> => {
		return fetch(`${getApiUrl()}/boards/templates`, {
			method: "GET",
		})
			.then(response => response.json())
			.catch(error => {
				console.error(error);
				return [];
			});
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.M}>
			{templates && !presentedTemplate && (
				<div className={styles.container}>
					{templates.map(template => (
						<TemplateItem
							key={template.uniq_id}
							preview={template.preview}
							name={"Hello"}
							setPresentedTemplate={() =>
								setPresentedTemplate(template)
							}
						/>
					))}
				</div>
			)}
			{presentedTemplate && (
				<TemplateItemPreview
					name={"Hello"}
					language={presentedTemplate.lan}
					description={presentedTemplate.desc}
					snapshot={presentedTemplate.snapshot}
					setPresentedTemplate={setPresentedTemplate}
					setIsOpen={setIsOpen}
					tags={presentedTemplate.tags}
					viewLinkId={presentedTemplate.uniq_id}
				/>
			)}
		</Modal>
	);
};
