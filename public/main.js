// @ts-check

import { APIWrapper, API_EVENT_TYPE } from './api.js'
import {
	addMessage,
	animateGift,
	isPossiblyAnimatingGift,
	isAnimatingGiftUI,
} from './dom_updates.js'

const api = new APIWrapper()

let animatedMessage = new Queue()

let customMessage = new Queue()

//
api.setEventHandler((events) => {
	console.log(' customMessage : ' + customMessage.length())
	console.log('animatedMessage : ' + animatedMessage.length())
	if (events.length != 0) parseEvents(events)
})

//Parse events by type
function parseEvents(events) {
	events.forEach((element) => {
		if (element.type == API_EVENT_TYPE.ANIMATED_GIFT) {
			animatedMessage.enqueue(element)
		} else {
			customMessage.enqueue(element)
		}
	})
}

function showAnimation(message) {
	animateGift(message)
	addMessage(message)
}

setInterval(() => {
	startMain()
}, 500)

// main function
function startMain() {
	if (!animatedMessage.isEmpty() && !isPossiblyAnimatingGift()) {
		showAnimation(animatedMessage.dequeue())
	} else if (
		!customMessage.isEmpty() &&
		(customMessage.peek().type == API_EVENT_TYPE.GIFT ||
			Date.now() - customMessage.peek().timestamp >= 20000)
	) {
		addMessage(customMessage.dequeue())
	} else if (!customMessage.isEmpty()) {
		customMessage.dequeue()
		startMain()
	}
}

//#region Queue contruction and functions

// queue contruction
function Queue() {
	this.elements = []
}

// add an element from the front of the queue
Queue.prototype.enqueue = function(e) {
	this.elements.push(e)
}

// remove an element from the front of the queue
Queue.prototype.dequeue = function() {
	return this.elements.shift()
}

// check if the queue is empty
Queue.prototype.isEmpty = function() {
	return this.elements.length == 0
}

// get the element at the front of the queue
Queue.prototype.peek = function() {
	return !this.isEmpty() ? this.elements[0] : undefined
}

// chech queue length
Queue.prototype.length = function() {
	return this.elements.length
}
//#endregion

// NOTE: UI helper methods from `dom_updates` are already imported above.
