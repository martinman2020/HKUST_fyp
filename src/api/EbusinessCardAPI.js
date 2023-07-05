import axios from "axios";


const url = 'https://whispering-reaches-50408.herokuapp.com/cards'

export class EbusinessCardAPI {
    static login(data){
        return axios.post(`${url}/login`, data)
    }

    static checkEmail(data){
        return axios.post(`${url}/checkEmail`, data)
    }

    static fetchCards() {
        return axios.get(url)
    }

    static updateCard(data){
        return axios.post(`${url}/update`, data)
    }


    static fetchCardById(id){
        return axios.get(`${url}/${id}`)
    }

    static createCard(data) {
        return axios.post(url, data)
    }

}