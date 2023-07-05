import { DB_API, COLLECTION_NAME} from './database';
import { CollectionInitStateAPI, INIT_STATE_ATTRIBUTES } from '../api/CollectionInitStateAPI'


export const EXPENSE_CATEGORY_ATTRIBUTES = {
    VALUE: 'value',
    LABEL: 'label',
    AMOUNT_OF_CATEGORY: 'amountOfcategory'
}

export const preset_expenseCategory = [
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Beauty' },
    { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Clothing' },
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Education' },
    { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Entertainment' },
    { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Food' },
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Health' },
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Household Items' },
    { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Online Shopping' },
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Present' },
    { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Rent' },
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Snacks' },
    // { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Social' },
    { [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: 'Transportation Fee' }
]

export class CollectionExpenseCatAPI extends DB_API {
    constructor(){
        super(COLLECTION_NAME.FINANCE_EXPENSE_CATEGORY)
        this.presetExpenseCategory = preset_expenseCategory;
        this.db_initState = new CollectionInitStateAPI();
    }
    async initialize() {
        // if(await this.isCollectionEmpty() === true) {
        //     console.log('No ExpenseCategory found, initializing...');
        //     preset_expenseCategory.forEach(async item => { await this.addDocument(item) });
        //     console.log('ExpenseCategory initialized')
        // }
        this.db_initState.getDocument({ name: INIT_STATE_ATTRIBUTES.EXPENSE_CATEGORY }).then(res => {
            if (res === undefined || res.initialized === false) {
                this.presetExpenseCategory.forEach(async (ExpenseCatObj) => { await this.addDocument(ExpenseCatObj) });
                this.db_initState.addDocument({ name: INIT_STATE_ATTRIBUTES.EXPENSE_CATEGORY, initialized: true })
            } else{
                this.db_initState.updateDocument({ name: INIT_STATE_ATTRIBUTES.EXPENSE_CATEGORY }, { name: INIT_STATE_ATTRIBUTES.EXPENSE_CATEGORY, initialized: true })
            }
        })
        return this.getCollection().then(allRecord=>allRecord);
    }
}