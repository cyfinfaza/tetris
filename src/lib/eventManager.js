import { getContext } from "svelte";
import { writable, get } from "svelte/store";

export default class EventManager {
	constructor(componentName, {initialState={}, events={}}={initialState:{}, events:{}}) {
		this.componentName = componentName;
		this.events = events;
        this.replayHolder = getContext("replayHolder");
        this.state = writable(initialState);
        this.stateRecordDisabled = true;
        this.onPostEventFire = () => {};
        this.onPostRecordState = () => {};
        this.state.subscribe((s) => {
            // console.log("state changed on", this.componentName, "and stateRecordDisabled is", this.stateRecordDisabled)
            if (!this.stateRecordDisabled)
            this.replayHolder.recordState(this.componentName, s);
            this.stateRecordDisabled = false;
            this.onPostRecordState();
        });
		this.replayHolder.registerStateholder(this.componentName, {
			eventFire: (e, a) => {
                this.stateRecordDisabled = false;
                this._fireEvent(e, false, a)
            },
			stateFire: (s) => {
                this.stateRecordDisabled = true;
                // console.log("statefire on", this.componentName, "with", s)
				this.state.set(s);
			},
		});
	}

    _fireEvent = (eventName, records, args, recordsState = false) => {
        if (records) this.replayHolder.recordEvent(this.componentName, eventName, args, recordsState);
        // console.log("trying to", eventName, "with", args, "on", this.componentName);
        if (this.events[eventName] && typeof this.events[eventName] === "function")
		    {this.events[eventName](...(args || []));
            this.onPostEventFire()}
        else console.warn("No event handler for", eventName, "on", this.componentName);
    }

    fireEvent = (eventName, ...args) => {
        this._fireEvent(eventName, true, args);
    }

    fireStateRecordingEvent = (eventName, ...args) => {
        this._fireEvent(eventName, true, args, true);
    }
}
