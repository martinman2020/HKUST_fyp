import { DB_API, COLLECTION_NAME } from './database'
import { CollectionInitStateAPI, INIT_STATE_ATTRIBUTES } from '../api/CollectionInitStateAPI'
import { STUDENT_ATTRIBUTES } from './CollectionStudentAPI'

export const TUITION_SET_ATTRIBUTES = {
    NAME: 'name',
    PRICE: STUDENT_ATTRIBUTES.TUITION_VALUE,
    AMOUNT_OF_LESSONS: STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS
}

export const preset_tuitionSet = [
    { [TUITION_SET_ATTRIBUTES.NAME]: 'Personal', [TUITION_SET_ATTRIBUTES.PRICE]: '400', [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: 1 },
    { [TUITION_SET_ATTRIBUTES.NAME]: 'Basic', [TUITION_SET_ATTRIBUTES.PRICE]: '500', [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: 4 },
    { [TUITION_SET_ATTRIBUTES.NAME]: 'Intermediate', [TUITION_SET_ATTRIBUTES.PRICE]: '1200', [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: 4 },
    { [TUITION_SET_ATTRIBUTES.NAME]: 'Advance', [TUITION_SET_ATTRIBUTES.PRICE]: '1600', [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: 4 }
]

export class CollectionTuitionSetAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.TUITIONSET)
        this.presetTuitionSet = preset_tuitionSet;
        this.db_initState = new CollectionInitStateAPI();
    }

    initialize() {
        this.db_initState.getDocument({ name: INIT_STATE_ATTRIBUTES.TUITION_SET }).then(res => {
            if (res === undefined || res.initialized === false) {
                this.presetTuitionSet.forEach(async (tuitionObj) => { await this.addDocument(tuitionObj) });
                this.db_initState.addDocument({ name: INIT_STATE_ATTRIBUTES.TUITION_SET, initialized: true })
            } else{
                this.db_initState.updateDocument({ name: INIT_STATE_ATTRIBUTES.TUITION_SET }, { name: INIT_STATE_ATTRIBUTES.TUITION_SET, initialized: true })
            }
        })
        
        return this.getCollection().then(allRecord=>allRecord);
    }

}