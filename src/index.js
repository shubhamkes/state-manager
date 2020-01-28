export * from './statemanager.utils';
import { InitializeLocalStorageUtils } from './localstorage.utils';


/**
 * Initialize package with required dependencies
 * @param  {object} StorageUtils(optional) - GetItem, SetItem from [Storage-Utility](https://www.npmjs.com/package/storage-utility) 
 * this method can be avoided if state persistance is not required
 */
export function InitialiseStateManager({ StorageUtils }) {
    InitializeLocalStorageUtils(StorageUtils);
}
