interface ILoggerStorage {
	add(record: string): void;
	get(): string[];
	clear(): void;
}

class MemoryLoggerStorage implements ILoggerStorage {
	private records: string[] = [];

	add(record: string): void {
		this.records.push(record);
	}

	get(): string[] {
		return this.records;
	}

	clear(): void {
		this.records = [];
	}
}

class BufferedLogger {
	private context: string | null = null;
	isEnabled = false;

	constructor(private readonly storage: ILoggerStorage) {}

	enable() {
		this.isEnabled = true;
	}

	disable() {
		this.isEnabled = false;
		this.storage.clear();
	}

	log(record: string) {
		if (!this.isEnabled) {
			return;
		}
		const timestamp = new Date().toLocaleString();
		this.storage.add(
			(this.context ? `[${this.context}] ` : "") +
				`${timestamp}: ${record}`,
		);
	}

	setContext(ctx: string) {
		this.context = ctx;
	}

	getContext(ctx: string) {
		this.context = ctx;
	}

	downloadLogs(filename: string) {
		const records = this.storage.get();
		const data = records.join("\n");
		const blob = new Blob([data], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}

export const MemoryLogger = new BufferedLogger(new MemoryLoggerStorage());
