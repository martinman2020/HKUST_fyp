import express from 'express'
import * as controller_card from '../controllers/cards.js'

const router = express.Router();

router.get('/', (req,res)=>controller_card.getCards(req,res))

router.get('/:id', (req,res)=>controller_card.getCardById(req,res))

router.post('/login', (req,res)=>controller_card.login(req,res))

router.post('/checkemail', (req,res)=>controller_card.checkEmail(req,res))

router.post('/update', (req,res)=>controller_card.updateCard(req,res))

router.post('/', (req,res)=>controller_card.createCard(req,res))



export default router