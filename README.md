# STATE MANAGER #
 
Target - Front End Projects

### How do I get set up? ###

* Run 'npm i state-manager --save'
* If using in React Native, Must have [state-manager-utility](https://github.com/drivezy/storage-utility) as dependency. Follow steps for initialising the package for native

### Sample 
```
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

```
    /**
    * @param  {string} {eventName
    * @param  {any} data
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    * @param  {boolean} isMemoryStore} (optional)
    */
    StoreEvent({ eventName, data, objParams, isMemoryStore }) 
```


* SubscribeToEvent - Subscribe to event.
 As soon as event is subscribed if event was already available for subscription, immediately callback is invoked and after that everytime 'StoreEvent' or 'TransmitToAllEvent' for same eventName will invoke this callback

```
    /**
    * @param  {string} {eventName
    * @param  {function} callback
    * @param  {any} extraParams - carry forward as it is while calling back
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    * @param  {boolean} isMemoryStore}
    */
    SubscribeToEvent({ eventName, callback, extraParams, objParams = {}, isMemoryStore })
```

* UnsubscribeEvent - Unsubscribe to event

```
    /**
    * Unsubscribe event from listening 
    * @param  {string} {eventName
    * @param  {function} callback
    * @param  {boolean} isMemoryStore
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    */
    UnsubscribeEvent({ eventName, callback, isMemoryStore, objParams = {} })

```

* IsEventAvailable - Tells if an event is already subscribed.
Can be used to detect if already there is a listener for given eventName


```
    /**
    * @param  {string} {eventName
    * @param  {boolean} isMemoryStore
    * @param  {any} objParams (optional) - extra tag for identifying event accurately
    */
    IsEventAvailable({ eventName, isMemoryStore, objParams })
```



### Document Author ###
  [Shubham_Kesarwani](https://github.com/shubhamkes)

 
