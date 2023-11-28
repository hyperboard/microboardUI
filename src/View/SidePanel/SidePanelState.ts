import { Subject } from "Subject";

export class SidePanelState {
    subject = new Subject<SidePanelState>();
    isOn = false;
    width = 300;
    toggle(): void {
        this.isOn = !this.isOn;
        this.subject.publish(this);
    }
    setWidth(width: number) {
        if (width <= 8) {
            this.width = 300;
            this.isOn = false;
        } else {
            this.width = width;
        }
        this.subject.publish(this);
    }
}
