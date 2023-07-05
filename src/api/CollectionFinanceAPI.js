import { DB_API, COLLECTION_NAME} from './database';

export const FINANCE_ATTRIBUTES = {
    IS_INCOME: 'isIncome',
    AMOUNT: 'amount',
    CATEGORY: 'category',
    DATE: 'date',
    NOTE: 'note',
    // AMOUNT_OF_CATEGORY: 'amountOfcategory'
}

export const FIN_FORM_MODE = {
    INCOME: true
} 


export class CollectionFinanceAPI extends DB_API {
    constructor(){
        super(COLLECTION_NAME.FINANCE)
    } 
}
