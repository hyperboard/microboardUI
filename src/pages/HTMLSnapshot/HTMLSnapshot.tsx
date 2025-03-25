import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, HTTPError } from "shared/api";

const HTMLSnapshot = (): JSX.Element => {
	const { uid } = useParams();
	const [htmlContent, setHtmlContent] = useState("");
	const [errStatus, setErrStatus] = useState<null | number>(null);

	useEffect(() => {
		const fetchSnapshot = async (): Promise<void> => {
			setErrStatus(null);
			try {
				const { data } = await api.get<{ htmlContent: string }>(
					`/media/snapshot/${uid}`,
				);
				if (!data) {
					throw new Error();
				}
				setHtmlContent(data.htmlContent);
			} catch (error) {
				if (error instanceof HTTPError && error.status) {
					setErrStatus(error.status);
				}
				console.error("Ошибка при загрузке snapshot:", error);
			}
		};

		fetchSnapshot();
	}, [uid]);

	if (errStatus === 404) {
		return <div>Not found</div>;
	}
	if (!htmlContent) {
		return <div>Loading...</div>;
	}

	return (
		<iframe
			title="HTML Snapshot"
			srcDoc={htmlContent}
			style={{ width: "100%", height: "100vh", border: "none" }}
		/>
	);
};

export default HTMLSnapshot;
