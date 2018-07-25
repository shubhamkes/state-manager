/*******************************************************************************************************************
 * Utility method that Manages state, persist api response and notify back by callback method provided as param 
 * Also based on Internet connectivity, can save api call which require less attention and invoke them later 
 * Supports app working even when device is not connected any network
 * 
 * This library maintains list of events available for subscription and subscribed events 
 ******************************************************************************************************************/
import { SetItem, GetItem } from 'storage-utility';
// import { IsEqualObject } from './common.utils';
const isEqual = require('lodash.isequal');

/**
 * Checks if two given objects are same 
 * NOTE: Mainly used in persitance for identifying if two params are same
 * @param  {object} object
 * @param  {object} otherObject
 */
function IsEqualObject(object, otherObject) {
    console.log(isEqual(object, otherObject), object, otherObject);
    return isEqual(object, otherObject);
}

/**
 * Store contains list of all events and apis which is having data and can be subscribed
 * Store Object will have eventName as key which would be api incase of api call persistence otherwise an event name.
 * against each eventName there would be an object having data and
 * objParams(optional). objParams are used in case of api call to make sure that
 * data is returned for same set of params.
 * format=>  {[eventName]: {data: ANY, objParams: {}}};
 */
const Store = {};
const MemoryStore = GetItem('memoryStore') || {}; // memory store would ba as same as Store except that is would store its data in asynStorage 

/**
 * SubscribedEvent will store all events which is currently being subscribed and
 * actively looking into the same
 * format=>  {[eventName]: [ {callback: fn(), extraParams: {}, objParams: {}} ]}
 */
const SubscibedEvent = {};
const SubscribedStoreEvent = {};

/**
 * Stores the status of the alerts
 */
let alertVisible = false;
let alertView = undefined;

/**
 * Makes available events for listening
 * @param  {string} {eventName
 * @param  {any} data
 * @param  {any} objParams - extra tag to check if event is already subscribed
 * @param  {boolean} isMemoryStore}
 */
export function StoreEvent({ eventName, data, objParams, isMemoryStore }) {
    new Promise((resolve, reject) => {
        if (!isMemoryStore) {
            Store[eventName] = { data, objParams };
        } else {
            MemoryStore[eventName] = { data, objParams };
            SetItem('memoryStore', MemoryStore);
        }
        TransmitToAllEvent({ eventName, data, isMemoryStore });
    });
}

export function DeleteEvent({ eventName, isMemoryStore }) {
    if (!isMemoryStore) {
        delete Store[eventName];
    } else {
        delete MemoryStore[eventName];
        SetItem('memoryStore', MemoryStore);
    }
}

/**
 * Start listening for the event
 * @param  {string} {eventName
 * @param  {function} callback
 * @param  {any} extraParams - carry forward as it is while calling back
 * @param  {object} objParams
 * @param  {boolean} isMemoryStore}
 */
export function SubscribeToEvent({ eventName, callback, extraParams, objParams, isMemoryStore }) {
    new Promise(resolve => {
        const events = (!isMemoryStore ? SubscibedEvent[eventName] : SubscribedStoreEvent[eventName]) || [];
        // events.push({ callback, extraParams, objParams, isMemoryStore });

        const index = IsAlreadySubscribed({ events, callback, objParams });
        if (index === false) { // makes sure against duplicate event subscription
            events.push({ callback, extraParams, objParams, isMemoryStore });
        } else {
            events[index] = { callback, extraParams, objParams, isMemoryStore };
        }

        if (!isMemoryStore) {
            SubscibedEvent[eventName] = events;
        } else {
            SubscribedStoreEvent[eventName] = events;
        }
        // alert('efe');
        TransmitToSingleEvent({ eventName, isMemoryStore, callback, extraParams });
    });
}

/**
 * Broadcasts event to all subscribed channels
 * @param  {} {eventName
 * @param  {} data
 * @param  {} isMemoryStore}
 */
export function TransmitToAllEvent({ eventName, data, isMemoryStore }) {
    let eventDetail, subscribedEvent;
    if (!isMemoryStore) {
        eventDetail = Store[eventName]; // array of subscribed event for particular event name
        subscribedEvent = SubscibedEvent[eventName];
    } else {
        let eventsAvailableInStore = GetItem('memoryStore') || {};
        eventDetail = eventsAvailableInStore[eventName]; // array of subscribed event for particular event name
        subscribedEvent = SubscribedStoreEvent[eventName];
    }
    if (!Array.isArray(subscribedEvent) || !eventDetail) {
        return;
    }
    subscribedEvent.forEach(event => {
        if (IsEqualObject(event.objParams, eventDetail.objParams) && event.callback) {
            event.callback(data || eventDetail.data, { eventName, extraParams: event.extraParams });
        }
    });
}

function TransmitToSingleEvent({ eventName, isMemoryStore, callback, extraParams }) {
    let eventDetail;
    if (!isMemoryStore) {
        eventDetail = Store[eventName];
    } else {
        let eventsAvailableInStore = GetItem('memoryStore') || {};
        eventDetail = eventsAvailableInStore[eventName]; // array of subscribed event for particular event name
    }

    if (!eventDetail) {
        return;
    }
    callback(eventDetail.data, { eventName, extraParams })

}

/**
 * Tells if event is already subscribed
 * Can be used to detect if already there is a listener for given eventName
 * @param  {string} {eventName
 * @param  {boolean} isMemoryStore
 * @param  {any} objParams (optional) - extra tag for identifying event accurately
 */
export function IsEventAvailable({ eventName, isMemoryStore, objParams }) {
    let eventsAvailableInStore;
    if (!isMemoryStore) {
        eventsAvailableInStore = Store;
    } else {
        eventsAvailableInStore = GetItem('memoryStore') || {};
    }
    const eventDetail = eventsAvailableInStore[eventName];
    if (eventDetail && IsEqualObject(eventDetail.objParams, objParams)) {
        return true;
    }
    return false;
}

/**
 * Unsubscribe event from listening 
 * @param  {string} {eventName
 * @param  {function} callback
 * @param  {boolean} isMemoryStore
 * @param  {any} objParams (optional) - extra tag for identifying event accurately
 */
export function UnsubscribeEvent({ eventName, callback, isMemoryStore, objParams = {} }) {
    const events = (!isMemoryStore ? SubscibedEvent[eventName] : SubscribedStoreEvent[eventName]) || [];
    // events.push({ callback, extraParams, objParams, isMemoryStore });
    const index = IsAlreadySubscribed({ events, callback, objParams });
    if (index != false) {
        events.splice(index, -1);
    }
    if (!isMemoryStore) {
        SubscibedEvent[eventName] = events;
    } else {
        SubscribedStoreEvent[eventName] = events;
    }
}

/**
 * Avoids duplicate subscription of event
 * @param  {} {events
 * @param  {} callback
 * @param  {any} objParams (optional) - extra tag for identifying event accurately
 */
function IsAlreadySubscribed({ events, callback, objParams }) {
    if (!(Array.isArray(events) && events.length)) {
        return false;
    }
    for (const i in events) {
        const event = events[i];
        if (event.callback == callback && IsEqualObject(event.objParams, objParams)) {
            // if (Function.prototype.toString(event.callback) == Function.prototype.toString(callback) && IsEqualObject(event.objParams, objParams)) {
            return i;
        }
    }
    return false;
}