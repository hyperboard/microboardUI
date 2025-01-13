export type ChangePasswordPayload = {
	oldPassword: string;
	newPassword: string;
};

export type RegisterPayload = {
	email: string;
	password: string;
	name: string;
	newsletter: boolean;
};

export type LoginPayload = Omit<RegisterPayload, 'newsletter' | 'name'>;

export type Tokens = {
	accessToken: string;
	refreshToken: string;
};

export type VerifyMailPayload = {
	email: string;
	passcode: string;
};

export type ResendMailPayload = {
	email: string;
};

export type CheckVerificationCodesPayload = {
	email: string;
};

export type ForgotPasswordPayload = {
	email: string;
};

export type RestorePasswordPayload = {
	token: string;
	newPassword: string;
};
