import { DB_API, COLLECTION_NAME } from './database'
import { CollectionStudentAPI, STUDENT_ATTRIBUTES, STUDENT_STATE } from './CollectionStudentAPI'
import { CollectionTuitionRecordAPI } from './CollectionTuitionRecordAPI'
import { CollectionClassAPI } from './CollectionClassAPI'
import { CollectionStudentAttendanceAPI } from './CollectionStudentAttendanceAPI'

export const CONTACT_PERSON_STATE = {
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

export const CONTACT_PERSON_ATTRIBUTES = {
    CONTACT_NAME: 'contact_name',
    PHONE: 'phone',
    EMAIL: 'email',
    CREATED_DATE: 'createdDate',
    STATE: 'state',
}

export class CollectionContactPersonAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.CONTACT_PERSON)   // pass the collection name to the parent class.
        this.db_student = new CollectionStudentAPI()
        this.db_tuitionRecord = new CollectionTuitionRecordAPI();
        this.db_class = new CollectionClassAPI();
        this.db_studentAttendance = new CollectionStudentAttendanceAPI();
    }

    toggleHideActivate(contactPerson) {
        // console.log('toggling contactPerson', 'contactPerson is ', contactPerson);
        let currentState = contactPerson.data[CONTACT_PERSON_ATTRIBUTES.STATE];
        let newContactPersonState = (currentState === CONTACT_PERSON_STATE.NORMAL) ? CONTACT_PERSON_STATE.HIDDEN : CONTACT_PERSON_STATE.NORMAL

        let newStudentState = (currentState === CONTACT_PERSON_STATE.NORMAL) ? STUDENT_STATE.HIDDEN : STUDENT_STATE.NORMAL

        return this.updateDocument(contactPerson.key, { [CONTACT_PERSON_ATTRIBUTES.STATE]: newContactPersonState })
        .then(()=>{
            this.getStudentsList(contactPerson.key).then(students=>{
                // console.log('CollectionContactPersonAPI: toggleHideActivate : students', students)
                students.forEach(student=>{
                    this.db_student.updateDocument(student.key, { [STUDENT_ATTRIBUTES.STATE]: newStudentState})
                })
            })
        })
        
    }

    getStudentsList(contactPersonKey) {
        return this.db_student.getCollection().then(students => students.filter(student => student.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === contactPersonKey))
    }

    // isSingleStudent(contactPersonObj){
    //     let listOfStudents = this.getStudentsList(contactPersonObj.key) // get the students from this contact person.
    //     console.log('listOfStudents: ', listOfStudents)

    //     let studentName = listOfStudents[0][STUDENT_ATTRIBUTES.STUDENT_NAME];
    //     let contactName = contactPersonObj.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]
    //     return (listOfStudents.length === 1 && studentName === contactName)     // The student is single if the there is only one record in Student db, also the contact name and student name are same. 
    // }

    async isSingleStudent(contactPersonObj) {
        let result = false;
        await this.db_student.getCollection().then(list => {
            let matchedStudent = list.filter(item => item.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === contactPersonObj.key)
            if (matchedStudent.length === 1 && matchedStudent[0].data[STUDENT_ATTRIBUTES.STUDENT_NAME] === contactPersonObj.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]) {
                result = true;
            } else {
                result = false;
            }
        })
        return result;
    }

    deleteContactPersonWithStudents(contactPersonObj) {
        let contactPersonKey = contactPersonObj.key;

        // First Terminate the TuitionRecord of this contact person and students first 
        this.getStudentsList(contactPersonKey)
            .then(studentList => studentList
                .forEach(student => {
                    console.log('deleting tuition record')
                    this.db_tuitionRecord.setTerminateTuitionByStudentKeys(student.key)

                    console.log('deleting student from class')
                    this.db_class.removeStudentfromAllClassByStudentKey(student.key)

                    this.db_studentAttendance.deleteRecordsByStudentKey(student.key)
                    // Delete the student, and delect the record in the class.
                    this.db_student.deleteDocument(student.key)
                }))

        return this.deleteDocument(contactPersonObj.key)

    }

}