import { DB_API, COLLECTION_NAME } from './database'

export const INIT_STATE_ATTRIBUTES = {
    TUITION_SET:'tuitionSet',
    PREFERENCE:'preference',
    INCOME_CATEGORY: 'incomeCategory',
    EXPENSE_CATEGORY: 'expenseCategory'

}

export class CollectionInitStateAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.INIT_STATE)
    }

}