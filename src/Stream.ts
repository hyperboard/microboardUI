/**
 * Subject class to implement the publish and subscribe pattern.
 * Observer is passed as a callback function.
 * Observers recieve events that describe object changes.
 * On subscription observer recieves all the events that happened before in order.
 */

export class Stream<Type> {
	observers: ((object: Type) => void)[] = [];
	objects: Type[] = [];

	subscribe(observer: (object: Type) => void): void {
		const index = this.observers.indexOf(observer);
		if (index === -1) {
			this.observers.push(observer);
		}
		for (const object of this.objects) {
			observer(object);
		}
	}

	unsubscribe(observer: (object: Type) => void): void {
		const index = this.observers.indexOf(observer);
		if (index !== -1) {
			this.observers.splice(index, 1);
		}
	}

	publish(object: Type): void {
		for (const observer of this.observers) {
			observer(object);
		}
		this.objects.push(object);
	}
}

export class Streams<Type> {
	streams: Map<
		string,
		{ observers: ((object: Type) => void)[]; objects: Type[] }
	> = new Map();

	subscribe(streamId: string, observer: (object: Type) => void): void {
		if (!this.streams.has(streamId)) {
			this.streams.set(streamId, { observers: [], objects: [] });
		}
		const stream = this.streams.get(streamId);
		const index = stream.observers.indexOf(observer);
		if (index === -1) {
			stream.observers.push(observer);
		}
		for (const object of stream.objects) {
			observer(object);
		}
	}

	unsubscribe(streamId: string, observer: (object: Type) => void): void {
		const stream = this.streams.get(streamId);
		if (stream) {
			const index = stream.observers.indexOf(observer);
			if (index !== -1) {
				stream.observers.splice(index, 1);
			}
		}
	}

	publish(streamId: string, object: Type): void {
		const stream = this.streams.get(streamId);
		if (stream) {
			for (const observer of stream.observers) {
				observer(object);
			}
			stream.objects.push(object);
		}
	}
}
