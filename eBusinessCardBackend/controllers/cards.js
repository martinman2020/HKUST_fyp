import CardContent from "../models/cardContent.js"

export const getCards = async (req, res) => {
    try {
        let cards = await CardContent.find();

        res.status(200).json(cards);

    } catch (err) {
        res.status(404).json({
            message: err.message,
        })
    }
}

export const getCardById = async (req, res) => {
    try {
        let { id } = req.params
        let card = await CardContent.findById(id);

        res.status(200).json(card);
    } catch (err) {
        res.status(404).json({
            message: err.message,
        })
    }
}

export const checkEmail = async (req, res) => {
    try {
        let { email } = req.body
        let card = await CardContent.findOne({ email: email });

        // console.log('card:', card)
        if (card) {
            res.status(200).json({ exsited: true });
        } else {
            res.status(200).json({ exsited: false });
        }
    } catch (err) {
        res.state(404).json({
            message: err.message
        })
    }
}

export const login = async (req, res) => {
    try {
        let email = req.body.email
        let password = req.body.password

        // console.log('email is ', email, 'password is ', password)
        let newCard = await CardContent.findOne({
            email: email,
            password: password
        });

        if (newCard) {
            res.status(200).json({ user: true, userId: newCard._id })
        }
        else {
            res.status(200).json({ user: false })
        }

    } catch (err) {
        res.status(404).json({
            message: err.message,
        })
    }
}

export const createCard = async (req, res) => {
    let cardContent = req.body;

    let newCard = new CardContent(cardContent);

    try {
        await newCard.save();

        res.status(200).json(newCard);

    } catch (err) {
        res.state(409).json({ message: err.message })
    }
}

export const updateCard = async (req, res) => {
    try {
        let cardContent = req.body;
        let cardId = cardContent._id;

        delete cardContent._id;

        console.log(cardContent)

        let card = await CardContent.findOne({ _id: cardId })

        // check if the password changed
        
        

        if (card) {
            if(!cardContent.password){
                cardContent.password = card.password;
            }
            
            card.overwrite({
                ...cardContent
            })

            await card.save()

            res.status(200).json({ message: 'The data has been updated' })

        } else {

            res.status(200).json({ message: 'Cannot find the card' })
        }





        // console.log('card',card);
        // console.log('cardContent instanceof CardContent',card instanceof CardContent); // true
        // console.log('cardContent instanceof mongoose.Model',card instanceof mongoose.Model); // true
        // console.log('cardContent instanceof mongoose.Document',card instanceof mongoose.Document); // true

        // if(cardContent.password){
        //     card.password = cardContent.password;
        // }

        // card.password = cardContent.password
        // card.overwrite()

        // await card.save().then((res)=>{
        //     console.log(res);
        // })

        // return res.status(200).json(card)



        

    } catch (err) {

    }


    // let newCard = await CardContent.findOne({})
}