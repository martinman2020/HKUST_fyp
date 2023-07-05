import { DB_API, COLLECTION_NAME } from './database'

export const LOCATION_ATTRIBUTES = {
    LABEL: 'label',
    COUNT: 'count'
}

// The data structure of the location is a array of object  
export class CollectionLocationAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.LOCATION)
    }

    /**
    * Check weather the location existance
    * @param object element: the object provide the relate information. eg: {label: 'Kowloon'}
    * @returns bool that represent whether the location existed.
    */
    isElementExisted(element) {
        return this.getDocument(element).then(res => (res !== undefined))
    }

    updateLocation(location) {
        let trimedLocation = location.trim()
        this.getDocument({ [LOCATION_ATTRIBUTES.LABEL]: trimedLocation }).then(result => {
            if (result) {
                this.updateDocument({ [LOCATION_ATTRIBUTES.LABEL]: trimedLocation }, { [LOCATION_ATTRIBUTES.COUNT]: result[LOCATION_ATTRIBUTES.COUNT] + 1 })
            } else {
                this.addDocument({ [LOCATION_ATTRIBUTES.LABEL]: trimedLocation, [LOCATION_ATTRIBUTES.COUNT]: 1 })
            }
        })
    }
}