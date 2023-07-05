import Localbase from "localbase";

// collectionName for easy selection.
export const COLLECTION_NAME = {
    PREFERENCE: 'preference',
    CONTACT_PERSON: 'contactPerson',
    STUDENT: 'student',
    CLASS: 'class',
    TUITIONSET: 'tuitionSet',
    FINANCE: 'finance',
    ATTENDANCE: 'attendance', 
    STUDENT_ATTENDANCE: 'studentAttendance',
    TUITION_RECORD: 'tuitionRecord',
    CURRENCY: 'currency',   // Todo
    LOCATION: 'location',
    FINANCE_INCOME_CATEGORY: 'financeIncomeCategory',  
    FINANCE_EXPENSE_CATEGORY: 'financeExpenseCategory',
    INIT_STATE: 'initState'
}

export class DB_API {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.databaseName = 'FLbuddy'
        this.db = new Localbase(this.databaseName); // for this.db has to be in this form. There is error if this.db = new Localbase(this.databaseName).collection(this.collectionName)
    }

    /**
    * Get the collection from IndexedDB, the data structure is [ {key: '12334',data: [{...},{...}]}, ...]. the data is on the data as an array. Which '...' is the actual data.
    * @param bool isShowKey: set false to not show the key, and the data structure is [ {...},{...} ]. Which '...' is the actual data.
    * @returns a promise contain the result of the collection. 
    */
    getCollection(isShowKey = true) {
        return this.db.collection(this.collectionName).get({ keys: isShowKey })
    }

    /**
    * Get document record from a collection
    * @param bool targetObject: set false to not show the key, and the data structure is [ {...},{...} ]. Which '...' is the actual data.
    * @returns a promise contain the result of the collection. 
    */
    getDocument(targetObject, isShowKey = true) {
        return this.db.collection(this.collectionName).doc(targetObject).get({ keys: isShowKey });
    }

    /**
    * 
    * @param bool targetObject: set false to not show the key, and the data structure is [ {...},{...} ]. Which '...' is the actual data.
    * @returns a promise contain the result of the collection. 
    */
    deleteCollection() {
        return this.db.collection(this.collectionName).delete();
    }

    /**
    * Checking the current collection, return ture if the 
    *
    * @returns bool True if the collection is empty, vice versa.
    */
    isCollectionEmpty() {
        return this.getCollection(false).then(item => item.length === 0 ? true : false)
    }

    /**
    * Add a document record to the collection.
    * @param object the object of document that intented to add to collection.
    * @returns a Promise of the successful state with the updated content.
    */
    addDocument(object) {
        return this.db.collection(this.collectionName).add(object);
    }

    /**
    *  Update a attribute of a document.
    * @param object targetObject: the document with related data to select, eg: {name:'Kiwi'}.
    * @param object updatedAttributeObject: the update data object eg: {name: 'Marthin' }.
    * 
    * @returns a Promise of the successful state with the updated content.
    */
    updateDocument(targetObject, updatedAttributeObject) {
        return this.db.collection(this.collectionName).doc(targetObject).update(updatedAttributeObject)
    }

    /**
    *  Overwrite whole document record, the object will be covered with the updatedObject
    * @param object targetObject: the document with related data to select, eg: {name:'Kiwi'}.
    * @param object updatedObject: the complete object that cover to the original document.
    * 
    * @returns a Promise of the successful state with the updated content.
    */
    overwriteDocument(targetObject, updatedObject) {
        return this.db.collection(this.collectionName).doc(targetObject).set(updatedObject)
    }

    /**
    *  Delete a document
    * @param object targetObject: the document with related data to select, eg: {name:'Kiwi'}.
    * 
    * @returns a Promise of the successful state with the updated content.
    */
    deleteDocument(targetObject) {
        return this.db.collection(this.collectionName).doc(targetObject).delete();
    }

}