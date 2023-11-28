import { Mbr } from "Board/Items";
import { fitContextPanel } from "./fit";
describe("getContextPanelBoundsToFit", () => {
	it("fits bounds", () => {
		const view = new Mbr(0, 0, 1000, 1000);
		const item = new Mbr(100, 500, 300, 700);
		const context = new Mbr(0, 0, 40, 20);
		const fit = fitContextPanel(item, view, context);
		expect(fit.left).toBeCloseTo(180);
		expect(fit.right).toBeCloseTo(220);
		expect(fit.top).toBeCloseTo(454);
		expect(fit.bottom).toBeCloseTo(474);
	});
});
