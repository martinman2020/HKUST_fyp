import { DB_API, COLLECTION_NAME } from './database'
import { PREFERENCE_ATTRIBUTES } from './CollectionPreferenceAPI'
import { STUDENT_ATTRIBUTES } from './CollectionStudentAPI'
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES, TUITION_RECORD_STATE } from './CollectionTuitionRecordAPI'
import { ATTENDANCE_ATTRIBUTES, ATTENDANCE_STATE, BEFORE_AFTER, CollectionAttendanceAPI } from './CollectionAttendanceAPI'

import moment from 'moment'

export const CLASS_STATE = {
    NORMAL: 'normal',
    SUSPENDED: 'suspended',
    TERMINATED: 'terminated',
}

export const CLASS_STUDENT_STATE = {
    NORMAL: 'normal',
    QUIT: 'quit'
}

export const FORM_MODE = {
    SINGLE: 'single',
    REGULAR: 'regular'
}

export const WEEKDAY = {
    SUNDAY: '0',
    MONDAY: '1',
    TUESDAY: '2',
    WEDNESDAY: '3',
    THURSDAY: '4',
    FRIDAY: '5',
    SATURDAY: '6'
}

export const CLASS_FORM_ATTRIBUTES = {
    CLASS_NAME: 'className',
    DESCRIPTION: 'description',
    START_DATE: 'startDate',
    LAST_DATE: 'lastDate',
    LESSON_START_TIME: 'lessonStartTime',
    WEEKDAYS: 'weekdays',
    WEEKLY_MODE: 'weeklyMode',
    DURATION_MIN: PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN,
    FREQUENCY: PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY,
    SELECTED_STUDENT: 'selectedStudent',
    LOCATION: 'location',
    CREATED_DATE_TIME: 'createdDateTime',
    STATE: 'state',
    STUDENT_STATE: 'studentState'
}

export class CollectionClassAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.CLASS)   // pass the collection name to the parent class.
        this.db_tuitionRecord = new CollectionTuitionRecordAPI();
        this.db_attendance = new CollectionAttendanceAPI();
    }

    createClass(classObj) {
        this.addDocument({
            ...classObj,
            [CLASS_FORM_ATTRIBUTES.CREATED_DATE_TIME]: new Date().getTime(),    // Add the timeStamp 
            [CLASS_FORM_ATTRIBUTES.STATE]: CLASS_STATE.NORMAL,                  // Add the default state
        }).then(res => {
            if (res) {
                console.log('res:', res)
            }
        })
    }


    removeClass(selectedClass) {
        // delete the attendance from current
        return this.db_attendance.deleteTicket(selectedClass.key, BEFORE_AFTER.AFTER, new Date(), false).then(()=>{
            // delete the class record
            this.deleteDocument(selectedClass.key);
        })

        


    }

    removeStudentfromAllClassByStudentKey(studentKey){
        return this.getCollection().then(allClassRecords=>{
            allClassRecords.forEach(classRecord => {
                let oldSelectedStudents = classRecord.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT]
                let classRecordHasThisStudent = oldSelectedStudents.find(student=>student.key === studentKey)
                if(classRecordHasThisStudent){
                    this.updateDocument(classRecord.key, {[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT]: oldSelectedStudents.filter(student=>student.key !== studentKey)})
                }
            })
        })
    }

}