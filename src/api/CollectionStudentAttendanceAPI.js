import { DB_API, COLLECTION_NAME } from './database'
import { STUDENT_ATTRIBUTES } from './CollectionStudentAPI'

export const STUDENT_ATTENDANCE_ATTR = {
    CLASS_KEY: 'classKey',
    ATTENDANCE_KEY: 'attendanceKey',
    STUDENT_NAME: STUDENT_ATTRIBUTES.STUDENT_NAME,
    LESSON_DEDUCTION: 'lessonDeduction',
    STUDENT_KEY: 'studentKey',
    IS_PRESENT: 'isPresent',
    IS_LATE: 'isLate',
    NOTE: 'note',
    CREATE_DATE_TIME: 'createDateTime'
}


export class CollectionStudentAttendanceAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.STUDENT_ATTENDANCE)
    }

    deleteRecordsByStudentKey = (studentKey)=>{
        return this.getCollection().then(allStudentAttendance=>{
            let selectedAttendance = allStudentAttendance.filter(studentAttendance=>studentAttendance.data[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY]===studentKey)
            selectedAttendance.forEach(studentAttendance=> this.deleteDocument(studentAttendance.key))
        })
    }

    deleteRecordsByClassKey = (classKey)=>{
        return this.getCollection().then(allStudentAttendance=>{
            let selectedAttendance = allStudentAttendance.filter(studentAttendance=>studentAttendance.data[STUDENT_ATTENDANCE_ATTR.CLASS_KEY]===classKey)
            selectedAttendance.forEach(studentAttendance=> this.deleteDocument(studentAttendance.key))
        })
    }
}