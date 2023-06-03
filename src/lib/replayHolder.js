import { get, writable } from "svelte/store";
import { tick } from "svelte/internal";

export class ReplayHolder {

	constructor() {
		this.atIndex = 0;
		this.inReplay = writable(false);
	
		this.timeline = [];
		this.stateHolders = {};
	
		this.numStates = writable(0);
	
		this.overrideNow = null;
		this.nowOffset = null;

		// window.timeline = this.timeline;
		window.goToIndex = this.goToIndex;
		window.exportReplayTimeline = this.exportReplayTimeline;

		this.populateStatesGen = this.populateStatesGen.bind(this);
	}

	overrideNowOffset = (startTs) => {
		if (startTs == null) this.nowOffset = null;
		else this.nowOffset = startTs - this.firstKnownTimestamp();
	}

	now = () => {
		if (this.overrideNow) return this.overrideNow;
		if (this.nowOffset && get(this.inReplay)) return Date.now() - this.nowOffset;
		return Date.now();
	}

	recordEvent = (stateholder, event, args = []) => {
		// console.warn("recordEvent", stateholder);
		this.timeline.push({ timestamp: Date.now() });
		this.atIndex = this.timeline.length - 1;
		this.timeline[this.atIndex].event = { stateholder, event };
		if (args.length) this.timeline[this.atIndex].args = args;
		this.numStates.set(this.timeline.length);
	}

	recordState = (stateholder, state) => {
		if (this.timeline.length === 0) this.timeline.push({ timestamp: Date.now(), state: {} });
		// console.warn("recordState", stateholder);
		state = JSON.parse(JSON.stringify(state));
		if (!this.timeline[this.atIndex].state) this.timeline[this.atIndex].state = {};
		// console.log(timeline.length);
		this.timeline[this.atIndex].state[stateholder] = state;
		this.numStates.set(this.timeline.length);
	}

	reset = () => {
		this.timeline = [];
		this.numStates.set(0);
	}

	registerStateholder = (stateholder, { eventFire, stateFire }) => {
		this.stateHolders[stateholder] = { eventFire, stateFire };
	}

	goToIndex = (index) => {
		let stateAtIndex = this.timeline[index]?.state;
		if (!stateAtIndex) return;
		Object.keys(this.stateHolders).forEach((key) => {
			const stateholder = this.stateHolders[key];
			// console.log(stateholder);
			for (let i = index; i >= 0; i--) {
				stateAtIndex = this.timeline[i].state;
				// console.log(key, stateAtIndex, i, typeof stateholder.stateFire, stateAtIndex[key]);
				if (typeof stateholder.stateFire === "function" && stateAtIndex[key]) {
					// console.log(key, JSON.parse(stateAtIndex[key]));
					stateholder.stateFire(JSON.parse(JSON.stringify(stateAtIndex[key])));
					break;
				}
			}
		});
		this.atIndex = index;
	}

	// fireEventAtIndex(index) {
	// 	let eventAtIndex = timeline[index].event;
	// 	if (!eventAtIndex) return;
	// 	console.log(eventAtIndex);
	// 	const stateholder = stateHolders[eventAtIndex.stateholder];
	// 	console.log(stateholder);
	// 	stateholder?.eventFire(eventAtIndex.event);
	// }

	step = (applyTime = false) => {
		// console.log(atIndex);
		let timelineAtIndex = this.timeline[this.atIndex + 1];
		// console.log(timelineAtIndex);
		if (!timelineAtIndex) return false;
		let eventAtIndex = timelineAtIndex.event;
		this.atIndex++;
		if (!eventAtIndex) return true;
		if (applyTime) this.overrideNow = timelineAtIndex.timestamp;
		const stateholder = this.stateHolders[eventAtIndex.stateholder];
		stateholder?.eventFire(eventAtIndex.event);
		return true;
	}

	firstKnownTimestamp = () => {
		for (let i = 0; i < this.timeline.length; i++) {
			if (this.timeline[i].timestamp) return this.timeline[i].timestamp;
		}
		return 0;
	}

	getFrameTimestamp = (offset = 0) => {
		const nextStamp = this.timeline[this.atIndex + offset]?.timestamp;
		// console.log(nextStamp, firstKnownTimestamp());
		if (nextStamp) return nextStamp - this.firstKnownTimestamp();
		return 0;
	}

	delay = async (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async* populateStatesGen() {
		this.goToIndex(0);
		let count = 1;
		await this.delay(0);
		// const stopinc = Math.floor(timeline.length / 20);
		while (this.step(true)) {
			// console.log(atIndex);
			// console.log(timeline);
			yield count++ / this.timeline.length;
			// await delay(0);
			await tick();
			if (count % 100 === 0) await this.delay(0);
		}
		this.overrideNow = null;
		console.log(this.timeline);
	}

	populateStates = async () => {
		for await (const _ of this.populateStatesGen()) {
		}
	}

	exportReplayTimeline = (meta) => {
		const replay = { meta };
		replay.initialState = this.timeline[0].state;
		replay.timeline = this.timeline.map((t) => ({
			timestamp: t.timestamp,
			event: t.event ? { stateholder: t.event.stateholder, event: t.event.event, args: t.event.args } : null,
		}));
		return replay;
	}

	importReplayTimeline = (replay) => {
		this.timeline = [{ state: replay.initialState }, ...replay.timeline];
	}
	
}