export function getEmailPrefix(email: string, placeholder = ""): string {
	const atIndex = email.indexOf("@");
	if (atIndex === -1) {
		return placeholder;
	}
	return email.substring(0, atIndex);
}
