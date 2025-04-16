import { useAccount } from "App/useAccount";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, HTTPError } from "shared/api";

const HTMLSnapshot = (): JSX.Element => {
	const { uid } = useParams();
	const uniquePass = window.location.search;
	const [htmlContent, setHtmlContent] = useState("");
	const [errStatus, setErrStatus] = useState<null | number>(null);
	const account = useAccount();

	useEffect(() => {
		account.init();
	}, []);

	useEffect(() => {
		if (!account.isInitialized) {
			return;
		}

		const fetchSnapshot = async (): Promise<void> => {
			setErrStatus(null);
			try {
				const { data } = await api.get<{ htmlContent: string }>(
					`/media/snapshot/${uid}${uniquePass}`,
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
	}, [uid, account]);

	if (errStatus === 404) {
		return <div>Not found</div>;
	} else if (errStatus) {
		return <div>Unkown error</div>;
	} else if (!htmlContent || !account.isInitialized) {
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
