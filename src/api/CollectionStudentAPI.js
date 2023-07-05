import { DB_API, COLLECTION_NAME } from './database'

export const STUDENT_STATE = {
    NORMAL: 'normal',
    HIDDEN: 'hidden'
}

export const FORM_MODE = {
    SINGLE: 'single',
    PARENT: 'parent'
}

export const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    NONE: 'none'
}

export const STUDENT_ATTRIBUTES = {
    CONTACT_PERSON_KEY : 'contactPersonKey',
    CONTACT_NAME: 'contact_name',
    PHONE: 'phone',
    EMAIL: 'email',
    CREATED_DATE: 'createdDate',
    STATE: 'state',
    STUDENT_LIST: 'studentList',
    STUDENT_NAME: 'studentName',
    TUITION_VALUE: 'tuitionValue',
    AMOUNT_OF_LESSONS: 'amountOfLessons',
    GENDER: 'gender',
    BIRTH_YEAR: 'birthYear',
    IMAGE_URI: 'imageUri'
}

export class CollectionStudentAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.STUDENT)   // pass the collection name to the parent class.
    }

    async hideStudent(studentKey) {
        await this.updateDocument(studentKey, { state: STUDENT_STATE.HIDDEN });
        console.log('Student with key ', studentKey, 'is hidden');
    }

    async reactivateStudent(studentKey){
        await this.updateDocument(studentKey, { state: STUDENT_STATE.NORMAL });
        console.log('Student with key ', studentKey, 'is reactivate');
    }
    
    isSingleStudent(student) {
        return (student.data[STUDENT_ATTRIBUTES.STUDENT_LIST].length === 1 && student.data[STUDENT_ATTRIBUTES.STUDENT_LIST][0][STUDENT_ATTRIBUTES.STUDENT_NAME] === student.data[STUDENT_ATTRIBUTES.CONTACT_NAME])
    }
    
    /**
     * get a array of the Normal state student with key
     */
    getAvaliableStudent(){
        return this.getCollection().then(res=>{
            return res.filter(item=>item.data[STUDENT_ATTRIBUTES.STATE]===STUDENT_STATE.NORMAL)
        })
    }

}