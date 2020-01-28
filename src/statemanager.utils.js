/*******************************************************************************************************************
 * Utility method that Manages state, persist api response and notify back by callback method provided as param 
 * Also based on Internet connectivity, can save api call which require less attention and invoke them later 
 * Supports app working even when device is not connected any network
 * 
 * This library maintains list of events available for subscription and subscribed events 
 ******************************************************************************************************************/
import { SetItem, GetItem } from './localstorage.utils';

/**
 * Store contains list of all events and apis which is having data and can be subscribed
 * Store Object will have eventName as key which would be api incase of api call persistence otherwise an event name.
 * against each eventName there would be an object having data and
 * objParams(optional). objParams are used in case of api call to make sure that
 * data is returned for same set of params.
 * format=>  {[eventName]: {data: ANY, objParams: {}}};
 */
const Store = {};
let MemoryStore = GetItem('memoryStore') || {}; // memory store would ba as same as Store except that is would store its data in asynStorage 

/**
 * SubscribedEvent will store all events which is currently being subscribed and
 * actively looking into the same
 * format=>  {[eventName]: [ {callback: fn(), extraParams: {}, objParams: {}} ]}
 */
const SubscibedEvent = {};
const SubscribedStoreEvent = {};

/**
 * Event Broadcaster method
 * Event can be broadcasted without storing into state or temporarily
 * 
 * Expects eventName and data to be broadcasted
 * 
 * @param  {string} {eventName - unique identifier of event
 * @param  {any} data - to be broadcasted
 * @param  {any} objParams(optional) - extra tag to check if event is already subscribed 
 * @param  {boolean} isMemoryStore(optional)=false - if set to true, events will be persisted even after current session(for this to work, initialisation of localstorage util is required)
 * @param  {boolean} isTemp(optional)=false - determines if event is to be broadcasted only one time
 * @param  {boolean} dontTransmit(optional)=false - event will be stored with the data but wont be broadcasted immediately after update
 */
export function StoreEvent({ eventName, data, objParams, isMemoryStore = false, isTemp = false, dontTransmit = false }) {
    // new Promise((resolve, reject) => {
    const eventDetail = { eventName, data, objParams };
    if (!isTemp) { // temporary broadcastings needn't to be stored
        if (!isMemoryStore) {
            Store[eventName] = eventDetail;
        } else {
            MemoryStore = GetItem('memoryStore') || {};
            MemoryStore[eventName] = eventDetail;
            SetItem('memoryStore', MemoryStore);
        }
    }

    if (!dontTransmit) {
        TransmitToAllEvent({ eventDetail, isMemoryStore });
    }
    // });
}

/**
 * Removes event detail from the store, hence any listener wont be able getting updates
 * @param  {string} eventName - unique identifier of event
 * @param  {boolean} isMemoryStore - default (false) - if set to true, events will be persisted even after current session(for this to work, initialisation of localstorage util is required)
 */
export function DeleteEvent({ eventName, isMemoryStore }) {
    if (!isMemoryStore) {
        delete Store[eventName];
    } else {
        MemoryStore = GetItem('memoryStore') || {};
        delete MemoryStore[eventName];
        SetItem('memoryStore', MemoryStore);
    }
}

/**
 * Event listener method
 * calls back on event creation or updation
 * @param  {string} {eventName - unique identifier of event
 * @param  {function} callback - callback function is invoked to passon the event data
 * @param  {any} extraParams - carry forward as it is while calling back
 * @param  {object} objParams (optional) - extra tag to check if event is already subscribed 
 * @param  {boolean} isMemoryStore - default (false) - if set to true, events will be persisted even after current session(for this to work, initialisation of localstorage util is required)
 * @param  {boolean} isTemp(optional)=false - determines if event is to be broadcasted only one time
 */
export function SubscribeToEvent({ eventName, callback, extraParams, objParams, isMemoryStore, isTemp = false }) {
    // new Promise(resolve => {
    const events = (!isMemoryStore ? SubscibedEvent[eventName] : SubscribedStoreEvent[eventName]) || [];

    const index = IsAlreadySubscribed({ events, callback, objParams });
    const subscribedEventDetail = { eventName, callback, extraParams, objParams, isMemoryStore, isTemp, index: typeof index == 'number' ? index : events.length };
    if (index === false) { // makes sure against duplicate event subscription
        events.push(subscribedEventDetail);
    } else {
        events[index] = subscribedEventDetail;
    }

    if (!isMemoryStore) {
        SubscibedEvent[eventName] = events;
    } else {
        SubscribedStoreEvent[eventName] = events;
    }
    TransmitToSingleEvent({ subscribedEventDetail, extraParams });
    // })
}

/**
 * Unsubscribe event from listening 
 * @param  {string} {eventName
 * @param  {function} callback
 * @param  {boolean} isMemoryStore
 * @param  {any} objParams (optional) - extra tag for identifying event accurately
 */
export function UnsubscribeEvent({ eventName, callback, isMemoryStore, objParams }) {
    const events = (!isMemoryStore ? SubscibedEvent[eventName] : SubscribedStoreEvent[eventName]) || [];
    // events.push({ callback, extraParams, objParams, isMemoryStore });
    const index = IsAlreadySubscribed({ events, callback, objParams });
    if (index !== false) {
        events.splice(index, 1);
    }
    if (!isMemoryStore) {
        SubscibedEvent[eventName] = events;
    } else {
        SubscribedStoreEvent[eventName] = events;
    }
}

/**
 * checks if event is already subscribed
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
 * Broadcasts event to all subscribed channels
 * @param  {string} {eventName
 * @param  {any} data
 * @param  {boolean} isMemoryStore}
 */
function TransmitToAllEvent({ eventDetail, isMemoryStore }) {
    let subscribedEvent;
    if (!isMemoryStore) {
        subscribedEvent = SubscibedEvent[eventDetail.eventName];
    } else {
        subscribedEvent = SubscribedStoreEvent[eventDetail.eventName];
    }
    if (!Array.isArray(subscribedEvent) || !eventDetail) {
        return;
    }
    subscribedEvent.forEach(event => {
        if (IsEqualObject(event.objParams, eventDetail.objParams) && event.callback) {
            TransmitToSingleEvent({ eventDetail, subscribedEventDetail: event, extraParams: event.extraParams });
        }
    });
}

/**
 * Broadcasts event to given event subscribed channel
 * @param  {} {eventDetail
 * @param  {} subscribedEventDetail
 * @param  {} extraParams}
 */
function TransmitToSingleEvent({ eventDetail, subscribedEventDetail, extraParams }) {
    if (!subscribedEventDetail) {
        return;
    }

    if (!eventDetail) {
        if (!subscribedEventDetail.isMemoryStore) {
            eventDetail = Store[subscribedEventDetail.eventName];
        } else {
            MemoryStore = GetItem('memoryStore') || {};
            eventDetail = MemoryStore[subscribedEventDetail.eventName];
        }
    }

    if (!eventDetail) {
        return;
    }
    // if temporary event subscription found, delete after once callback
    if (subscribedEventDetail.isTemp) {
        delete SubscibedEvent[subscribedEventDetail.eventName][subscribedEventDetail.index]; // cause only without memory store one are eligible for temporary broadcasting & capturing
    }
    subscribedEventDetail.callback(eventDetail.data, { eventName: subscribedEventDetail.eventName, extraParams })
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

/**
 * Checks if two given objects are same 
 * NOTE: Mainly used in persitance for identifying if two params are same
 * @param  {object} object
 * @param  {object} otherObject
 */
function IsEqualObject(x, y) {
    // return isEqual(object, otherObject);
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
        ok(x).length === ok(y).length &&
        ok(x).every(key => deepEqual(x[key], y[key]))
    ) : (x === y);
}

