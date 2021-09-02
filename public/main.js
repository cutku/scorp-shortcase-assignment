import { APIWrapper, API_EVENT_TYPE } from './api.js'
import {
	addMessage,
	animateGift,
	isPossiblyAnimatingGift,
	isAnimatingGiftUI,
} from './dom_updates.js'

const api = new APIWrapper()

let animatedMessages = new Queue()

let customMessages = new Queue()

let bstEventCache = new BinarySearchTree()

api.setEventHandler((events) => {
	if (events.length != 0) parseEvents(events)
})

setInterval(() => {
	startMain()
}, 500)

// Main function(Recursive)
function startMain() {
	if (!animatedMessages.isEmpty() && !isPossiblyAnimatingGift()) {
		showAnimation(animatedMessages.dequeue())
	} else if (
		!customMessages.isEmpty() &&
		(customMessages.peek().type == API_EVENT_TYPE.GIFT ||
			Date.now() - customMessages.peek().timestamp >= 20000)
	) {
		showMessage(customMessages.dequeue())
	} else if (!customMessages.isEmpty()) {
		customMessages.dequeue()
		startMain()
	}
}

//Parse events by type
function parseEvents(events) {
	events.forEach((element) => {
		if (element.type == API_EVENT_TYPE.ANIMATED_GIFT) {
			animatedMessages.enqueue(element)
		} else {
			customMessages.enqueue(element)
		}
	})
}

//At duplicate recursive function will triggered
function showMessage(message) {
	//search duplicateEvents in bst : complexity O(log n)
	if (!bstEventCache.contains(message.id)) {
		addMessage(message)
		bstEventCache.add(message.id)
	} else {
		startMain()
	}
}

function showAnimation(message) {
	//search duplicateEvents in bst : complexity O(log n)
	if (!bstEventCache.contains(message.id)) {
		animateGift(message)
		addMessage(message)
		bstEventCache.add(message.id)
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

//#region BinarySearchTree contruction and functions
function BinarySearchTree() {
	this.root = null
}

BinarySearchTree.prototype.makeNode = function(value) {
	var node = {}
	node.value = value
	node.left = null
	node.right = null
	return node
}

BinarySearchTree.prototype.add = function(value) {
	var currentNode = this.makeNode(value)
	if (!this.root) {
		this.root = currentNode
	} else {
		this.insert(currentNode)
	}
	return this
}

BinarySearchTree.prototype.insert = function(currentNode) {
	var value = currentNode.value
	var traverse = function(node) {
		//if value is equal to the value of the node, ignore
		//and exit function since we don't want duplicates
		if (value === node.value) {
			return
		} else if (value > node.value) {
			if (!node.right) {
				node.right = currentNode
				return
			} else traverse(node.right)
		} else if (value < node.value) {
			if (!node.left) {
				node.left = currentNode
				return
			} else traverse(node.left)
		}
	}
	traverse(this.root)
}

BinarySearchTree.prototype.contains = function(value) {
	var node = this.root
	var traverse = function(node) {
		if (!node) return false
		if (value === node.value) {
			return true
		} else if (value > node.value) {
			return traverse(node.right)
		} else if (value < node.value) {
			return traverse(node.left)
		}
	}
	return traverse(node)
}
//#endregion
