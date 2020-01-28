/****************************************
 * Gateway for storage utility
 * implements SetItem,GetItem, using storage-utility
 ****************************************/


let SetItem = () => { };
let GetItem = () => { };

function InitializeLocalStorageUtils({ ...props }) {
    SetItem = props.SetItem;
    GetItem = props.GetItem;
}

export { GetItem, SetItem, InitializeLocalStorageUtils };


