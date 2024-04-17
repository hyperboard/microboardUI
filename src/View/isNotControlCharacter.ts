const exclude = [
	"Control",
	"Meta",
	"Alt",
	"Shift",
	"CapsLock",
	"Escape",
	"Delete",
	"Backspace",
	"F1",
	"F2",
	"F3",
	"F4",
	"F5",
	"F6",
	"F7",
	"F8",
	"F9",
	"F10",
	"F11",
	"F12",
];
export function isNotControlCharacter(key: string): boolean {
	return !exclude.includes(key);
}
