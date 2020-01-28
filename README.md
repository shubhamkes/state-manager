# STATE MANAGER #
 
Target - Front End Projects

### Description ###

A tiny yet very powerful state management library. Follows pubsub architecture to maintain the state and broadcast the same. It can be used as an alternative to redux.


### How do I get set up? ###

```
npm i state-manager-utility --save
```

* If using in React Native, Must have [state-manager-utility](https://github.com/drivezy/storage-utility) as dependency. Follow steps for initialising the package for native

### Sample 
```javascript
    import React, { Component } from 'react';
    import { SubscribeToEvent, StoreEvent, TransmitToAllEvent } from 'state-manager-utility';

    export default class StorageTest {
        constructor(props) {
            StoreEvent({ eventName: 'test', data: { hey: 1 } });
            SubscribeToEvent({ eventName: 'test', callback: listen });
            SubscribeToEvent({ eventName: 'test', callback: listen });

            setTimeout(() => {
                console.log('ex');
                TransmitToAllEvent({ eventName: 'test', data: 'ghghh' });
            }, 2000);
            function listen(data) {
                console.log(data);
            }
        }
    }

```

### APIs ###

* StoreEvent - Makes available events for listening. Adds in the list of events available for subscription

```javascript
    /**
     * Event Broadcaster method
     * Event can be broadcasted without storing into state or temporarily
     * 
     * Expects eventName and data to be broadcasted
     * 
     * @param  {string} {eventName - unique identifier of event
     * @param  {any} data - to be broadcasted
     * @param  {any} objParams(optional) - extra tag to check if event is already subscribed 
     * @param  {boolean} isMemoryStore - default (false) - if set to true, events will be persisted even after current session(for this to work, initialisation of localstorage util is required)
     * @param  {boolean} isTemp - default (false) - determines if event is to be broadcasted only one time
     * @param  {boolean} dontTransmit - default (false) - event will be stored with the data but wont be broadcasted immediately after update
     */
    StoreEvent({ eventName, data, objParams, isMemoryStore = false, isTemp = false, dontTransmit= false })
```

* DeleteEvent - Removes event detail from the store, hence any listener wont be able getting updates

```javascript
    /**
     * Removes event detail from the store, hence any listener wont be able getting updates
     * @param  {string} eventName - unique identifier of event
     * @param  {boolean} isMemoryStore - default (false) - if set to true, events will be persisted even after current session(for this to work, initialisation of localstorage util is required)
     */
    export function DeleteEvent({ eventName, isMemoryStore }) 
```

* SubscribeToEvent - Subscribe to event.
 As soon as event is subscribed if event was already available for subscription, immediately callback is invoked and after that everytime 'StoreEvent' or 'TransmitToAllEvent' for same eventName will invoke this callback

```javascript
    /**
    * @param  {string} {eventName
    * @param  {function} callback
    * @param  {any} extraParams - carry forward as it is while calling back
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    * @param  {boolean} isMemoryStore}
    */
    SubscribeToEvent({ eventName, callback, extraParams, objParams, isMemoryStore, isTemp = false })
```

* UnsubscribeEvent - Unsubscribe to event

```javascript
    /**
    * Unsubscribe event from listening 
    * @param  {string} {eventName
    * @param  {function} callback
    * @param  {boolean} isMemoryStore
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    */
    UnsubscribeEvent({ eventName, callback, isMemoryStore, objParams = {} })

```

* InitialiseStateManager - This method makes avilable the dependencies to the library(In this case, it expects [Storage-Utility](https://www.npmjs.com/package/storage-utility) to be injected)
This method can be avoided if state persistance is not required(intra session events).

```javascript
/**
 * Initialize package with required dependencies
 * @param  {object} StorageUtils(optional) - GetItem, SetItem from [Storage-Utility](https://www.npmjs.com/package/storage-utility) 
 */
InitialiseStateManager({ StorageUtils })
```

* IsEventAvailable - Tells if an event is already subscribed.
Can be used to detect if already there is a listener for given eventName


```javascript
    /**
    * @param  {string} {eventName
    * @param  {boolean} isMemoryStore
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    */
    IsEventAvailable({ eventName, isMemoryStore, objParams })
```



### Document Author ###
  [Shubham_Kesarwani](https://github.com/shubhamkes)

 
