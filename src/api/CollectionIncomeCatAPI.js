import { DB_API, COLLECTION_NAME} from './database';
import { CollectionInitStateAPI, INIT_STATE_ATTRIBUTES } from '../api/CollectionInitStateAPI'

export const INCOME_CATEGORY_ATTRIBUTES = {
    VALUE: 'value',
    LABEL: 'label',
    AMOUNT_OF_CATEGORY: 'amountOfcategory'
}

export const preset_incomeCategory = [
    { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Bank'},
    // { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Gathering'},
    { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Group Class'},
    // { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Payment Received'},
    { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Private Class'},
    { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Profit'},
    { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Salary'},
    { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Saving'},
    // { [INCOME_CATEGORY_ATTRIBUTES.LABEL]: 'Welfare'}
]

export class CollectionIncomeCatAPI extends DB_API {
    constructor(){
        super(COLLECTION_NAME.FINANCE_INCOME_CATEGORY)
        this.presetIncomeCategory = preset_incomeCategory;
        this.db_initState = new CollectionInitStateAPI();
    }
    async initialize() {
        this.db_initState.getDocument({ name: INIT_STATE_ATTRIBUTES.INCOME_CATEGORY }).then(res => {
            if (res === undefined || res.initialized === false) {
                this.presetIncomeCategory.forEach(async (IncomeCatObj) => { await this.addDocument(IncomeCatObj) });
                this.db_initState.addDocument({ name: INIT_STATE_ATTRIBUTES.INCOME_CATEGORY, initialized: true })
            } else{
                this.db_initState.updateDocument({ name: INIT_STATE_ATTRIBUTES.INCOME_CATEGORY }, { name: INIT_STATE_ATTRIBUTES.INCOME_CATEGORY, initialized: true })
            }
        })
        return this.getCollection().then(allRecord=>allRecord);
        // if(await this.isCollectionEmpty() === true) {
        //     // console.log(incomeCategory);
        //     console.log('No IncomeCategory found, initializing...');
        //     preset_incomeCategory.forEach(async item => { await this.addDocument(item) })
        //     console.log('IncomeCategory initialized')
        // }
    }
}